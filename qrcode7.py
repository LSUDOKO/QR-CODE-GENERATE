# animated_qrcode.py

import segno
from urllib.request import urlopen
qrcode = segno.make_qr("https://github.com/LSUDOKO")
nirvana_url = urlopen("https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExaTlsbmE0a3FkOTdnYzEzcDE5OGliM2gxYXQwZHV0Ym04OG5jajBwbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/NytMLKyiaIh6VH9SPm/giphy.webp")
qrcode.to_artistic(
    background=nirvana_url,
    target="animated_qrcode.gif",
    scale=5,
    light="lightblue",
    dark="darkblue",
    data_light="lightgreen"
)
