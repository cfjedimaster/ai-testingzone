from dotenv import load_dotenv
load_dotenv()

import cloudinary
from cloudinary import CloudinaryImage

config = cloudinary.config(secure=True)

# Read in our sizes first
sizes = [line.rstrip() for line in open('sizes.txt','r')]

# Then the text values we need
copy = [line.rstrip() for line in open('copy.txt','r')]

for size in sizes:
    for text in copy:
        print(f"URL for copy, '{text}', at size, '{size}'")
       	width, height = size.split('x')

        result = CloudinaryImage("original_for_demo").build_url(transformation= [
        {"width": width, "height": height, "background": "gen_fill", "crop": "pad"},
        {'color':"#FFFFFF", 'background': "black", 'border': "10px_solid_black", 'overlay': {'font_family': "Arial", 'font_size': 35, 'text': text}},
        {'flags': "layer_apply", 'gravity': "south_east", 'x': 10, 'y': 10}
        ])
        
        print(result, '\n')



