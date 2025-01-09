import segno
qrcode = segno.make_qr("Hello, World")
qrcode.save(
    "lightblue_qrcode.png",
    scale=5,
    light="lightblue",border=5,dark="darkblue"
)