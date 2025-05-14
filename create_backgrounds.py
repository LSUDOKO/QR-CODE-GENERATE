import os
from PIL import Image, ImageFilter, ImageEnhance

def create_bg_images():
    """Create background images for QR codes from existing images"""
    input_dir = 'images'
    if not os.path.exists(input_dir):
        os.makedirs(input_dir)
    
    # Create a backgrounds directory if it doesn't exist
    bg_dir = os.path.join(input_dir, 'backgrounds')
    if not os.path.exists(bg_dir):
        os.makedirs(bg_dir)
    
    # Sample background patterns and effects to create
    backgrounds = [
        {'name': 'gradient_blue', 'size': (300, 300), 'type': 'gradient', 'colors': ['#1a237e', '#0d47a1', '#1565c0', '#1976d2', '#1e88e5']},
        {'name': 'gradient_red', 'size': (300, 300), 'type': 'gradient', 'colors': ['#b71c1c', '#c62828', '#d32f2f', '#e53935', '#f44336']},
        {'name': 'gradient_green', 'size': (300, 300), 'type': 'gradient', 'colors': ['#1b5e20', '#2e7d32', '#388e3c', '#43a047', '#4caf50']},
        {'name': 'gradient_purple', 'size': (300, 300), 'type': 'gradient', 'colors': ['#4a148c', '#6a1b9a', '#7b1fa2', '#8e24aa', '#9c27b0']},
        {'name': 'gradient_gold', 'size': (300, 300), 'type': 'gradient', 'colors': ['#ff6f00', '#ff8f00', '#ffa000', '#ffb300', '#ffc107']},
    ]
    
    # Create gradient backgrounds
    for bg in backgrounds:
        if bg['type'] == 'gradient':
            create_gradient_bg(bg['name'], bg['size'], bg['colors'], bg_dir)
    
    # Process existing images to create more background options
    existing_images = [f for f in os.listdir(input_dir) if f.startswith('arpit') and f.endswith(('.png', '.jpg', '.jpeg'))]
    
    for img_file in existing_images:
        input_path = os.path.join(input_dir, img_file)
        
        # Get base name without extension
        base_name = os.path.splitext(img_file)[0]
        
        try:
            # Open the image
            img = Image.open(input_path)
            
            # Resize to a standard size for backgrounds
            img = img.resize((400, 400), Image.LANCZOS)
            
            # Save the resized version
            resized_path = os.path.join(bg_dir, f"{base_name}_bg.png")
            img.save(resized_path)
            print(f"Created background: {resized_path}")
            
            # Create a blurred version
            blurred = img.filter(ImageFilter.GaussianBlur(radius=5))
            blurred_path = os.path.join(bg_dir, f"{base_name}_blurred.png")
            blurred.save(blurred_path)
            print(f"Created background: {blurred_path}")
            
            # Create a lightened version
            lightened = ImageEnhance.Brightness(img).enhance(1.5)
            lightened_path = os.path.join(bg_dir, f"{base_name}_light.png")
            lightened.save(lightened_path)
            print(f"Created background: {lightened_path}")
            
        except Exception as e:
            print(f"Error processing {img_file}: {e}")

def create_gradient_bg(name, size, colors, output_dir):
    """Create a gradient background image"""
    img = Image.new('RGB', size, color=colors[0])
    pixels = img.load()
    
    width, height = size
    num_colors = len(colors)
    color_width = width // (num_colors - 1)
    
    # Convert hex colors to RGB tuples
    rgb_colors = [hex_to_rgb(color) for color in colors]
    
    # Create horizontal gradient
    for x in range(width):
        # Find the two colors to blend between
        color_index = min(x // color_width, num_colors - 2)
        color1 = rgb_colors[color_index]
        color2 = rgb_colors[color_index + 1]
        
        # Calculate blend factor (0.0 to 1.0)
        factor = (x % color_width) / color_width
        
        # Interpolate between colors
        blended_color = interpolate_color(color1, color2, factor)
        
        # Apply to all vertical pixels
        for y in range(height):
            pixels[x, y] = blended_color
    
    output_path = os.path.join(output_dir, f"{name}.png")
    img.save(output_path)
    print(f"Created gradient background: {output_path}")

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def interpolate_color(color1, color2, factor):
    """Interpolate between two RGB colors"""
    return tuple(int(color1[i] + (color2[i] - color1[i]) * factor) for i in range(3))

if __name__ == "__main__":
    create_bg_images()
    print("Background images created successfully!")
