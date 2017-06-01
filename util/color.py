from skimage import color
import numpy

colors = [
('black dark', [0,0,0]),
('white light', [255,255,255]),
('grey gray', [127,127,127]),
('blue', [0,0,255]),
('green', [0,255,0]),
('red', [255,0,0]),
('yellow gold golden', [255,255,0]),
('orange', [255,127,0]),
('purple violet magenta', [128,0,128]),
('pink magenta', [255,105,180]),
('turquoise cyan blue', [173,234,234]),
('brown', [139,69,19])
]

colors = list(map(lambda c: (c[0],numpy.array([[c[1]]])/255), colors))
colors = list(map(lambda c: (c[0],color.rgb2lab(c[1])), colors))

def nameRGB(rgb):
    x = color.rgb2lab([[numpy.array(rgb)/255]])
    dist = list(map(lambda c: (color.deltaE_cie76(c[1][0][0],x[0][0]), c[0]), colors))
    dist.sort()
    return ' '.join(list(map(lambda t: t[1], dist[:3])))

if __name__ == '__main__':

    while True:
        inp = input('rgb: ')
        if inp == "exit":
            break
        rgb = list(map(int,inp.split(';')))
        print(nameRGB(rgb))
