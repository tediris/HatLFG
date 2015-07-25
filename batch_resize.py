#usage: python BatchImageResize.py -d "C:\MyImages" -w 1024 -h 768
import os, getopt, sys, Image

# Parse the command line arguments
opts, args = getopt.getopt(sys.argv[1:], "d:w:h:")

directory = ""
width = -1
height = -1

# Read the command line arguments
for opt, arg in opts:
  if opt == '-d':
    directory = arg
  elif opt == '-w':
    width = int(arg)
  elif opt == '-h':
    height = int(arg)

# Check that the options were all set
if directory == "" or width == -1 or height == -1:
  print "Invalid command line arguments.\
  -d [directory] -w [width] -h [height] required"
  exit()

# Iterate through every image in the directory and resize them
for file in os.listdir(directory):
  print "Resizing image " + file
  # Open the image
  img = Image.open(directory + "\\" + file)
  # Resize it
  img = img.resize((width, height), Image.BILINEAR)
  # Save it back to disk
  img.save(directory + "\\resized" + file)