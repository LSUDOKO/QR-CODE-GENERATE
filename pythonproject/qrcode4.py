# green_datadark_qrcode.py

import segno

qrcode = segno.make_qr("Hello, World")
qrcode.save(
    "green_datadark_qrcode.png",
    scale=5,
    light="lightblue",
    dark="darkblue",
    data_dark="green",
)