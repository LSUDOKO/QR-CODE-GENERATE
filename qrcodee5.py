# green_datamodules_qrcode.py

import segno

qrcode = segno.make_qr("Hello, World")
qrcode.save(
    "green_datamodules_qrcode.png",
    scale=5,
    light="lightblue",
    dark="darkblue",
    data_dark="green",
    data_light="lightgreen",
)