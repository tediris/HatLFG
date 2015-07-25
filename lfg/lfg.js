Activities = new Mongo.Collection('activities');
UserEmblems = new Mongo.Collection('user-emblems');

//console.log(today.format());

imageThumbnails = {"Vault of Glass - NM": "vog.jpg",
  "Vault of Glass - HM": "vog.jpg",
  "Crota's End - NM": "ce_2.jpg",
  "Crota's End - HM": "ce_2.jpg",
  "Prison of Elders - LV28": "poe.jpg",
  "Prison of Elders - LV32": "poe.jpg",
  "Prison of Elders - LV34": "poe.jpg",
  "Prison of Elders - LV35": "skolas.jpg",
  "Trials of Osiris": "too_2.jpg",
  "Patrol": "patrol.png",
  "Weekly Nightfall": "nightfall.png",
  "Weekly Heroic": "weekly.png",
  "Crucible": "crucible.png",
  "Other": "other.png"
  };  

function cleanDatabase() {
  var currentTime = convertServerToUserTimezone(moment(new Date()));
  var timeBuffer = currentTime.add(6, 'hours');
  Activities.remove({"dateTime": {$lte: new Date(currentTime.format())}});
}

function submitNewActivity() {
  console.log("test successful :)");
}

function convertServerToUserTimezone(momentDate) {
  var timezone = jstz.determine().name();
  var serverTime = moment.tz(momentDate.format(), "America/Los_Angeles");
  return serverTime.clone().tz(timezone);
}

function guardianAlreadySignedUp(guardians, newGuardian) {
  //console.log("Looking for: " + newGuardian.psn);
  for (var i = 0; i < guardians.length; i = i + 1) {
    //console.log(guardians[i].psn);
    if (guardians[i].psn == newGuardian.psn) return true;
  }
  return false;
}

if (Meteor.isClient) {
  Meteor.startup(function() {
    var today = new Date();
    var timezone = jstz.determine().name();
    var todayMoment = moment.tz(today.toISOString(), timezone);
    var pacificTime = todayMoment.clone().tz("America/Los_Angeles");
    //console.log(pacificTime.format("MMM Do YY, h:mm"));

    //cleanDatabase();
    Meteor.call("cleanDatabase");

    $("#emblem-select").imagepicker();
    $(document).bind('cbox_cleanup', function(){
      var emblem = $("#emblem-select").val(); 
      //console.log(emblem);
      Meteor.call('updateUserEmblem', emblem);
    });
  });
  

  Template.body.helpers({
    activities: function() {
      return Activities.find({}, {sort: {dateTime: 1}});
    }
    
  });

  Template.body.events({
    "submit .new-activity" : function(event) {
      //console.log(event);
      return false;
      //Activities.insert({name: event.target.activity_name.value, description: event.target.description.value, date: event.target.date.value, time: event.target.time.value});
    }
  });

  Template.player_comment.helpers({
    isCommentOwner: function() {
      if (Meteor.user()) {
        return this.psn == Meteor.user().username;
      }
      return false;
    },

    emblem: function() {
      var emblemList = UserEmblems.find({username: this.psn}).fetch();
      if (emblemList.length > 0) return emblemList[0].emblem;
      return "./50x50.jpg";
    }
  });

  Template.player_comment.events({
    'click .leave-button': function(event) {
      //console.log("trying to leave activity");
      var activityObject = Template.parentData(1);
      //console.log(activityObject);
      Activities.update(activityObject._id, {$pull: {guardians: this}});
    }
  });

  Template.activity.helpers({
    guardians: this.guardians,
    isOwner: function() {
      if (Meteor.user()) {
        return this.creator == Meteor.user().username;
      } 
      return false;
    },
    date: function() {
      var dateTime = convertServerToUserTimezone(moment(new Date(this.dateTime)));
      return dateTime.format("MMM Do");
    },
    time: function() {
      var dateTime = convertServerToUserTimezone(moment(new Date(this.dateTime)));
      return dateTime.format("h:mm a");
    },

    emblem: function() {
      var emblemList = UserEmblems.find({username: Meteor.user().username}).fetch();
      if (emblemList.length > 0) return emblemList[0].emblem;
      return /*UserEmblems.find({username: this.psn}) || */"./50x50.jpg";
    },

    notSignedUp: function() {
      newGuardian = {psn: Meteor.user().username};
    
      if (!guardianAlreadySignedUp(this.guardians, newGuardian)) return true;
      return false;
    }
  });

  Template.addActivityForm.events({
    'submit form' : function(event) {
      // Display an info toast with no title
      //toastr.info('Adding event...')
      //toastr.info("Debug: selected time - " + event.target.time.value);
      //toastr.info("Debug: selcted date - " + event.target.date.value);
      event.preventDefault();
      var currDate = new Date();
      var eventDate = event.target.date.value;
      var eventTime = event.target.time.value;
      var eventDateTime = Date.parse("" + eventDate + " " + eventTime);
      eventDateTime = moment(eventDateTime);
      var timezone = jstz.determine().name();
      var todayMoment = moment.tz(eventDateTime.format(), timezone);
      var pacificTime = todayMoment.clone().tz("America/Los_Angeles");
      var storedDate = Date.parse(pacificTime.format());

      var realTime = moment.tz(new Date(), timezone);
      realTime = realTime.clone().tz("America/Los_Angeles");
      //toastr.info("Debug: trying to add time: " + todayMoment.format("MMM Do YY, h:mm") + ", timezone: " + timezone);
      if (pacificTime < realTime) return;

      var newActivity = {name: event.target.activity_name.value, 
        description: event.target.description.value, 
        //date: event.target.date.value, 
        //time: event.target.time.value, 
        guardians: [{psn: Meteor.user().username, comment: ""}], 
        image: imageThumbnails[event.target.activity_name.value],
        creator: Meteor.user().username,
        dateTime: storedDate
      };
      //console.log(newActivity);
      if (newActivity.time != "") {
        Activities.insert(newActivity);
        toastr.info("Activity added");

      }
    }
  });

  Template.activity.events({
    'submit form' : function(event) {
      event.preventDefault();
      newGuardian = {psn: Meteor.user().username, comment: event.target.comment.value};
    
      if (!guardianAlreadySignedUp(this.guardians, newGuardian)) {
        Activities.update(this._id, {$push: {guardians: newGuardian}});
      }

      //console.log(this.guardians[1].psn);
      //console.log(newGuardian);
    },

    'click .join-anim' : function(event) {
      console.log(event);
      console.log(event.target.nextElementSibling.comment);
    },

    'click .delete-activity' : function(event) {
      Activities.remove(this._id);
    }

    
  });

  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    //insertTestValues();
    //Activities.remove({});
  });
}

Meteor.methods({
  cleanDatabase: function() {
    if (!Meteor.userId()) {
      return;
    }
    var currentTime = convertServerToUserTimezone(moment(new Date()));
    var timeBuffer = currentTime.subtract(6, 'hours');
    var queryTime = Date.parse(timeBuffer.format());
    //var results = Activities.find({dateTime: {$lte: queryTime}}).fetch();
    Activities.remove({dateTime: {$lte: queryTime}});

    //console.log(results);

  },

  updateUserEmblem: function(chosenEmblem) {
    if (!Meteor.userId()) {
      return;
    }
    UserEmblems.update(Meteor.userId(), {emblem: chosenEmblem, username: Meteor.user().username}, {upsert: true});
    //var results = UserEmblems.find({}).fetch();
    //console.log(results);
  }
});
