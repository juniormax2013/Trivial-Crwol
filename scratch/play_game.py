import os
import sys
import time
import subprocess
from PIL import Image

def run_cmd(cmd):
    result = subprocess.run(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    return result.stdout.strip()

def activate_simulator():
    run_cmd('osascript -e "tell application \\"Simulator\\" to activate"')
    time.sleep(0.5)

def get_window_rect():
    out = run_cmd('osascript -e "tell application \\"System Events\\" to tell process \\"Simulator\\" to get {position, size} of window 1"')
    # Output looks like: "359, 87, 453, 971"
    try:
        parts = [int(x.strip()) for x in out.split(',')]
        if len(parts) == 4:
            return {
                'x': parts[0],
                'y': parts[1],
                'w': parts[2],
                'h': parts[3]
            }
    except Exception as e:
        print("Error getting window rect:", e)
    return None

def click_at(x, y):
    print(f"Clicking at screen coordinates: ({x}, {y})")
    run_cmd(f'osascript -e "tell application \\"System Events\\" to tell process \\"Simulator\\" to click at {{{x}, {y}}}"')

def play_step():
    activate_simulator()
    
    # 1. Get window bounds
    rect = get_window_rect()
    if not rect:
        print("Simulator window not found.")
        return False
    
    # 2. Take screenshot of simulator screen
    screenshot_path = 'scratch/screen.png'
    os.makedirs('scratch', exist_ok=True)
    run_cmd(f'xcrun simctl io booted screenshot {screenshot_path}')
    
    if not os.path.exists(screenshot_path):
        print("Failed to take screenshot.")
        return False
    
    # 3. Analyze image
    img = Image.open(screenshot_path)
    w, h = img.size
    pix = img.load()
    
    # Find blue button first (JE SUIS PRÊT or CONTINUER)
    # The blue color is bg-[#0A84FF] -> RGB(10, 132, 255)
    # Let's search in the lower half of the screen
    blue_pixels = []
    for y in range(int(h * 0.6), int(h * 0.98)):
        for x in range(int(w * 0.1), int(w * 0.9)):
            r, g, b = pix[x, y][:3]
            # Match blue #0A84FF with some tolerance
            if abs(r - 10) < 15 and abs(g - 132) < 15 and abs(b - 255) < 15:
                blue_pixels.append((x, y))
                
    if blue_pixels:
        # Click center of the blue region
        avg_x = sum([p[0] for p in blue_pixels]) // len(blue_pixels)
        avg_y = sum([p[1] for p in blue_pixels]) // len(blue_pixels)
        
        # Convert to window coordinates
        mac_x = rect['x'] + int(avg_x * (rect['w'] / w))
        mac_y = rect['y'] + int(avg_y * (rect['h'] / h))
        print("Found blue button!")
        click_at(mac_x, mac_y)
        return True

    # Find green highlight of the correct option border
    # Tailwind green-400 is #4ade80 -> RGB(74, 222, 128)
    green_pixels = []
    for y in range(int(h * 0.4), int(h * 0.95)):
        for x in range(int(w * 0.05), int(w * 0.95)):
            r, g, b = pix[x, y][:3]
            # Match green with some tolerance
            if abs(r - 74) < 30 and abs(g - 222) < 30 and abs(b - 128) < 30:
                green_pixels.append((x, y))
                
    if green_pixels:
        # Click center of the green region
        avg_x = sum([p[0] for p in green_pixels]) // len(green_pixels)
        avg_y = sum([p[1] for p in green_pixels]) // len(green_pixels)
        
        # Convert to window coordinates
        mac_x = rect['x'] + int(avg_x * (rect['w'] / w))
        mac_y = rect['y'] + int(avg_y * (rect['h'] / h))
        print("Found green highlighted option!")
        click_at(mac_x, mac_y)
        return True

    # Check for order_events or drag-drop: if we see "Check order" or "Comprobar orden", it's a blue button.
    # What if we are on a trick question or there is no highlight? (should not happen for admin, but let's default to Option C center)
    print("No colored elements detected. Clicking default Option C position.")
    mac_x = rect['x'] + int(rect['w'] * 0.5)
    mac_y = rect['y'] + int(rect['h'] * 0.72)
    click_at(mac_x, mac_y)
    return True

if __name__ == '__main__':
    # Run loop to play 15 steps
    for step in range(1, 25):
        print(f"\n--- STEP {step} ---")
        success = play_step()
        if not success:
            break
        time.sleep(2.5) # Wait for animations and transitions
