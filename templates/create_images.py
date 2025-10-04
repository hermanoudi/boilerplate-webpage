#!/usr/bin/env python3
"""
Image Placeholder Generator
Creates placeholder images for products with customizable colors
"""

import os
from pathlib import Path

def create_placeholder_images():
    """Generate placeholder product images"""
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        print("⚠️  Pillow not installed. Install it with: pip3 install Pillow")
        print("   Skipping image generation...")
        return

    # Configuration
    image_dir = Path('assets/images/products')
    image_dir.mkdir(parents=True, exist_ok=True)

    # Image settings
    width, height = 600, 800
    products = [
        ('produto-1.jpg', '#000000', 'Produto 1'),
        ('produto-2.jpg', '#FFB6C1', 'Produto 2'),
        ('produto-3.jpg', '#98FB98', 'Produto 3'),
        ('produto-4.jpg', '#87CEEB', 'Produto 4'),
        ('produto-5.jpg', '#FFD700', 'Produto 5'),
        ('produto-6.jpg', '#8B4513', 'Produto 6'),
    ]

    print("🎨 Gerando imagens placeholder...")

    for filename, color, text in products:
        img = Image.new('RGB', (width, height), color=color)
        draw = ImageDraw.Draw(img)

        # Try to use a nice font, fallback to default
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 60)
        except:
            font = ImageFont.load_default()

        # Calculate text position (centered)
        text_bbox = draw.textbbox((0, 0), text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        position = ((width - text_width) // 2, (height - text_height) // 2)

        # Draw text with contrasting color
        text_color = '#FFFFFF' if color in ['#000000', '#8B4513'] else '#333333'
        draw.text(position, text, fill=text_color, font=font)

        # Save image
        filepath = image_dir / filename
        img.save(filepath, 'JPEG', quality=85)
        print(f"  ✓ {filename}")

    # Create hero image
    hero_img = Image.new('RGB', (800, 600), color='{{PRIMARY_COLOR}}')
    draw = ImageDraw.Draw(hero_img)

    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 80)
    except:
        font = ImageFont.load_default()

    text = "Hero"
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    position = ((800 - text_width) // 2, (600 - text_height) // 2)

    draw.text(position, text, fill='#FFFFFF', font=font)
    hero_img.save('assets/images/hero-model.jpg', 'JPEG', quality=85)
    print(f"  ✓ hero-model.jpg")

    print(f"\n✅ {len(products) + 1} imagens criadas com sucesso!")

if __name__ == '__main__':
    create_placeholder_images()
