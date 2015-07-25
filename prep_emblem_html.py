#usage: python BatchImageResize.py -d "C:\MyImages" -w 1024 -h 768
import os, getopt, sys

# Parse the command line arguments
opts, args = getopt.getopt(sys.argv[1:], "d:")

directory = ""

# Read the command line arguments
for opt, arg in opts:
  if opt == '-d':
    directory = arg

# Check that the options were all set
if directory == "":
  print "Invalid command line arguments.\
  -d [directory] required"
  exit()

# Iterate through every image in the directory and resize them
for file in os.listdir(directory):
  print "<option data-img-src=\"./emblems/resized/" + file + "\" value=\"./emblems/resized/" + file + "\"></option>"
  # Open the image
  