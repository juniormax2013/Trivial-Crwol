import os
import glob
from PIL import Image

def remove_white_background(img_path):
    try:
        img = Image.open(img_path).convert("RGBA")
        width, height = img.size
        pixels = list(img.getdata())
        
        visited = set()
        queue = []
        
        def is_light_bg(r, g, b, a):
            if a == 0:
                return False
            # Blanco puro o gris claro
            if r > 200 and g > 200 and b > 200:
                return True
            # Tonos claros cercanos al blanco
            if abs(r - g) < 15 and abs(g - b) < 15 and r > 165:
                return True
            return False
            
        def get_idx(x, y):
            return y * width + x
            
        # Semillas: Píxeles del borde que son claros
        for x in range(width):
            for y in [0, height - 1]:
                idx = get_idx(x, y)
                r, g, b, a = pixels[idx]
                if is_light_bg(r, g, b, a):
                    queue.append((x, y))
                    visited.add((x, y))
        for y in range(height):
            for x in [0, width - 1]:
                idx = get_idx(x, y)
                r, g, b, a = pixels[idx]
                if is_light_bg(r, g, b, a) and (x, y) not in visited:
                    queue.append((x, y))
                    visited.add((x, y))
                    
        # Búsqueda por Anchura (BFS) para flood-fill
        while queue:
            cx, cy = queue.pop(0)
            idx = get_idx(cx, cy)
            
            # Volver 100% transparente
            pixels[idx] = (0, 0, 0, 0)
            
            # 4 Vecinos
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < width and 0 <= ny < height:
                    if (nx, ny) not in visited:
                        nidx = get_idx(nx, ny)
                        nr, ng, nb, na = pixels[nidx]
                        if is_light_bg(nr, ng, nb, na):
                            visited.add((nx, ny))
                            queue.append((nx, ny))
                            
        # Guardar imagen limpia
        img.putdata(pixels)
        img.save(img_path, "PNG")
        print(f"✅ Fondo removido con éxito: {os.path.basename(img_path)}")
    except Exception as e:
        print(f"❌ Error al procesar {os.path.basename(img_path)}: {str(e)}")

def main():
    target_dir = "/Users/angelus/Desktop/Mis Proyectos/Trivial Crowl App/Trivial App/public/images/Devil image"
    png_pattern = os.path.join(target_dir, "*.png")
    png_files = glob.glob(png_pattern)
    
    if not png_files:
        print("⚠️ No se encontraron imágenes PNG del diablo.")
        return
        
    print(f"🚀 Iniciando remoción de fondo para {len(png_files)} imágenes...")
    for f in png_files:
        remove_white_background(f)
    print("🎉 ¡Todas las imágenes han sido procesadas con éxito!")

if __name__ == "__main__":
    main()
