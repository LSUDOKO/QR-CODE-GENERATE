import qrcode as y
from PIL import Image
f=y.QRCode(version=1,box_size=40,border=5)
f.add_data('https://github.com/LSUDOKO')
f.make(fit=True)
a=f.make_image(fill_color="yellow",back_color="black")
#a=y.make("https://github.com/LSUDOKO")
a.save("arpit5.png")