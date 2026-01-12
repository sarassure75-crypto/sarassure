#!/usr/bin/env python3
"""
Générateur de fonds d'écran pour SARASSURE
Crée des images PNG de 540x960 (ratio mobile 9:16) avec le thème de couleurs
"""

from PIL import Image, ImageDraw, ImageFilter
import os

# Couleurs du thème SARASSURE (du tailwind.config.js)
COLORS = {
    "background": "#F5F8F7",      # Light bg
    "primary": "#3A5A40",         # Dark green
    "secondary": "#588157",       # Medium green
    "accent": "#A3B18A",          # Light green/kaki
    "muted": "#C8CEC2",           # Muted gray-green
    "light_muted": "#E8EDE8",     # Very light
}

# Dimensions mobile (540x960 = 9:16 ratio, compatible avec la plupart des téléphones)
WIDTH = 540
HEIGHT = 960

def create_solid_bg(filename, color, name):
    """Crée un fond uni"""
    img = Image.new('RGB', (WIDTH, HEIGHT), color)
    img.save(filename)
    print(f"✅ {name}: {filename}")

def create_gradient_bg(filename, color1, color2, direction="vertical", name=""):
    """Crée un dégradé"""
    img = Image.new('RGB', (WIDTH, HEIGHT))
    draw = ImageDraw.Draw(img)
    
    if direction == "vertical":
        for y in range(HEIGHT):
            r = int(int(color1[1:3], 16) + (int(color2[1:3], 16) - int(color1[1:3], 16)) * (y / HEIGHT))
            g = int(int(color1[3:5], 16) + (int(color2[3:5], 16) - int(color1[3:5], 16)) * (y / HEIGHT))
            b = int(int(color1[5:7], 16) + (int(color2[5:7], 16) - int(color1[5:7], 16)) * (y / HEIGHT))
            draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))
    
    img.save(filename)
    print(f"✅ {name}: {filename}")

def create_pattern_bg(filename, bg_color, pattern_color, name=""):
    """Crée un fond avec motif géométrique"""
    img = Image.new('RGB', (WIDTH, HEIGHT), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Grille légère de carrés
    square_size = 60
    bg_rgb = tuple(int(bg_color[i:i+2], 16) for i in (1, 3, 5))
    pattern_rgb = tuple(int(pattern_color[i:i+2], 16) for i in (1, 3, 5))
    
    for x in range(0, WIDTH, square_size):
        for y in range(0, HEIGHT, square_size):
            if (x // square_size + y // square_size) % 2 == 0:
                opacity_color = tuple(
                    int(pattern_rgb[i] * 0.15 + bg_rgb[i] * 0.85) 
                    for i in range(3)
                )
                draw.rectangle([x, y, x + square_size, y + square_size], fill=opacity_color)
    
    img.save(filename)
    print(f"✅ {name}: {filename}")

def create_dotted_bg(filename, bg_color, dot_color, name=""):
    """Crée un fond avec motif de points"""
    img = Image.new('RGB', (WIDTH, HEIGHT), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Motif de points espacés
    dot_size = 8
    spacing = 40
    dot_color_rgba = tuple(int(dot_color[i:i+2], 16) for i in (1, 3, 5))
    
    for x in range(0, WIDTH, spacing):
        for y in range(0, HEIGHT, spacing):
            draw.ellipse(
                [x - dot_size//2, y - dot_size//2, x + dot_size//2, y + dot_size//2],
                fill=dot_color_rgba
            )
    
    img.save(filename)
    print(f"✅ {name}: {filename}")

def create_wave_bg(filename, bg_color, wave_color, name=""):
    """Crée un fond avec vagues subtiles"""
    img = Image.new('RGB', (WIDTH, HEIGHT), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Trois courbes de vagues
    wave_color_rgba = tuple(int(wave_color[i:i+2], 16) for i in (1, 3, 5))
    
    for wave_offset in [0, 150, 300]:
        points = []
        for x in range(0, WIDTH + 50, 20):
            y = 200 + wave_offset + int(50 * ((x % 200) / 200))
            points.append((x, y))
        
        # Remplir jusqu'au bas
        for i in range(len(points) - 1):
            draw.polygon([
                points[i], 
                points[i+1],
                (points[i+1][0], HEIGHT),
                (points[i][0], HEIGHT)
            ], fill=wave_color_rgba)
    
    img.save(filename)
    print(f"✅ {name}: {filename}")

def create_circles_bg(filename, bg_color, circle_color, name=""):
    """Crée un fond avec cercles géométriques"""
    img = Image.new('RGB', (WIDTH, HEIGHT), bg_color)
    draw = ImageDraw.Draw(img)
    
    circle_color_rgba = tuple(int(circle_color[i:i+2], 16) for i in (1, 3, 5))
    
    # Grands cercles décalés
    positions = [
        (-80, -100, 250),
        (WIDTH + 60, HEIGHT + 50, 300),
        (WIDTH // 2 - 50, HEIGHT // 2, 200),
        (100, HEIGHT - 150, 150),
    ]
    
    for x, y, r in positions:
        draw.ellipse([x - r, y - r, x + r, y + r], fill=circle_color_rgba, outline=None)
    
    # Appliquer un petit flou pour un effet plus doux
    img = img.filter(ImageFilter.GaussianBlur(radius=2))
    
    img.save(filename)
    print(f"✅ {name}: {filename}")

# Créer le répertoire de sortie
output_dir = "public/wallpapers_neutral"
os.makedirs(output_dir, exist_ok=True)

print("🎨 Génération des fonds d'écran SARASSURE...\n")

# 1. Fonds unis simples
create_solid_bg(f"{output_dir}/bg_white_neutral.png", COLORS["background"], "Blanc neutre")
create_solid_bg(f"{output_dir}/bg_light_muted.png", COLORS["light_muted"], "Gris-vert très clair")
create_solid_bg(f"{output_dir}/bg_muted.png", COLORS["muted"], "Gris-vert clair")

# 2. Dégradés subtils
create_gradient_bg(
    f"{output_dir}/bg_gradient_white_muted.png",
    COLORS["background"],
    COLORS["light_muted"],
    "vertical",
    "Dégradé blanc → gris clair"
)

create_gradient_bg(
    f"{output_dir}/bg_gradient_light_accent.png",
    COLORS["light_muted"],
    COLORS["accent"],
    "vertical",
    "Dégradé gris clair → kaki"
)

# 3. Motifs
create_pattern_bg(
    f"{output_dir}/bg_pattern_grid_subtle.png",
    COLORS["background"],
    COLORS["muted"],
    "Motif grille subtile"
)

create_dotted_bg(
    f"{output_dir}/bg_pattern_dots.png",
    COLORS["background"],
    COLORS["accent"],
    "Motif points kaki"
)

# 4. Fonds avec formes géométriques
create_circles_bg(
    f"{output_dir}/bg_circles_accent.png",
    COLORS["background"],
    COLORS["accent"],
    "Cercles géométriques (kaki)"
)

create_circles_bg(
    f"{output_dir}/bg_circles_muted.png",
    COLORS["light_muted"],
    COLORS["muted"],
    "Cercles géométriques (gris-vert)"
)

print("\n✅ Tous les fonds d'écran ont été générés !")
print(f"📁 Dossier: {output_dir}")
print(f"📱 Format: 540x960px (ratio 9:16 mobile)")
print(f"\n📊 Fichiers créés:")
print("   - bg_white_neutral.png")
print("   - bg_light_muted.png")
print("   - bg_muted.png")
print("   - bg_gradient_white_muted.png")
print("   - bg_gradient_light_accent.png")
print("   - bg_pattern_grid_subtle.png")
print("   - bg_pattern_dots.png")
print("   - bg_circles_accent.png")
print("   - bg_circles_muted.png")
print("\n💡 Utilisation: Uploader ces images dans 'Wallpapers' de la bibliothèque d'images")
