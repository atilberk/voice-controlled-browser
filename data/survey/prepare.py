import sys
from PIL import Image

name = sys.argv[1]

img = Image.open(name);
img2 = img.crop((0,20,img.size[0],img.size[1]))

img2.save("cropped/"+name[:-4]+"_cropped"+name[-4:])
