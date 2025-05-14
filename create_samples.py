import qrcode
from PIL import Image
import os

# Ensure the directory exists
os.makedirs('images/samples', exist_ok=True)

# Create sample QR codes with different settings
samples = [
    {
        'name': 'rounded_red_qr',
        'url': 'https://example.com/rounded',
        'foreground': '#B71C1C',  # Dark red
        'background': '#FFFFFF',  # White
        'style': 'rounded'
    },
    {
        'name': 'circular_green_qr',
        'url': 'https://example.com/circular',
        'foreground': '#1B5E20',  # Dark green
        'background': '#F5F5F5',  # Light gray
        'style': 'circular'
    },
    {
        'name': 'gradient_purple_qr',
        'url': 'https://example.com/gradient',
        'foreground': '#4A148C',  # Dark purple
        'background': '#E1BEE7',  # Light purple
        'style': 'gradient'
    },
    {
        'name': 'corporate_blue_qr',
        'url': 'https://example.com/corporate',
        'foreground': '#0D47A1',  # Dark blue
        'background': '#BBDEFB',  # Light blue
        'style': 'square'
    }
]

# Create each sample
for sample in samples:
    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(sample['url'])
    qr.make(fit=True)
    
    # Create QR code image
    img = qr.make_image(fill_color=sample['foreground'], back_color=sample['background'])
    
    # Save the image
    output_path = f"images/samples/{sample['name']}.png"
    img.save(output_path)
    print(f"Created sample QR code: {output_path}")

print("Sample QR codes created successfully!")
