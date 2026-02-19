#!/usr/bin/env python3
"""
Create simple PNG icons for WeChat miniprogram.
TabBar icons: 40x40 pixels
Menu icons: 52x52 pixels (larger for better visibility)
"""

from PIL import Image, ImageDraw
import os

# Colors
GRAY = (128, 128, 128, 255)      # Normal state
BLUE = (59, 130, 246, 255)       # Active state (theme color)

# ============================================
# TabBar Icons (40x40)
# ============================================
TAB_SIZE = 40
TAB_CENTER = TAB_SIZE // 2

def create_task_icon(output_path, is_active=False):
    """Create a checkbox/task list icon - 40x40"""
    img = Image.new('RGBA', (TAB_SIZE, TAB_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    color = BLUE if is_active else GRAY

    # Draw checkbox outline
    draw.rectangle([8, 8, 20, 20], outline=color, width=2)

    # Draw checkmark for active state
    if is_active:
        draw.line([10, 14, 14, 18], fill=color, width=2)
        draw.line([14, 18, 18, 10], fill=color, width=2)

    # Draw list lines below
    draw.line([8, 26, 32, 26], fill=color, width=2)
    draw.line([8, 32, 28, 32], fill=color, width=2)

    img.save(output_path)
    print(f"Created: {output_path}")

def create_calendar_icon(output_path, is_active=False):
    """Create a calendar icon - 40x40 - SIMPLIFIED"""
    img = Image.new('RGBA', (TAB_SIZE, TAB_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    color = BLUE if is_active else GRAY

    # Draw calendar outline
    draw.rectangle([6, 7, 34, 34], outline=color, width=2)

    # Draw header line
    draw.line([6, 14, 34, 14], fill=color, width=2)

    # Draw top bindings
    draw.line([12, 5, 12, 11], fill=color, width=2)
    draw.line([28, 5, 28, 11], fill=color, width=2)

    # Simplified: just a small dot (same as menu calendar)
    draw.ellipse([18, 22, 22, 26], fill=color)

    img.save(output_path)
    print(f"Created: {output_path}")

def create_pomodoro_icon(output_path, is_active=False):
    """Create a timer/clock icon - 40x40"""
    img = Image.new('RGBA', (TAB_SIZE, TAB_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    color = BLUE if is_active else GRAY

    # Draw clock circle
    draw.ellipse([6, 6, 34, 34], outline=color, width=2)

    # Draw hour hand
    draw.line([20, 20, 20, 14], fill=color, width=2)

    # Draw minute hand
    draw.line([20, 20, 26, 20], fill=color, width=2)

    # Draw center dot
    draw.ellipse([18, 18, 22, 22], fill=color)

    img.save(output_path)
    print(f"Created: {output_path}")

def create_countdown_icon(output_path, is_active=False):
    """Create a countdown/hourglass icon - 40x40"""
    img = Image.new('RGBA', (TAB_SIZE, TAB_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    color = BLUE if is_active else GRAY

    # Draw top and bottom bars
    draw.line([10, 8, 30, 8], fill=color, width=2)
    draw.line([10, 32, 30, 32], fill=color, width=2)

    # Draw hourglass diagonals
    draw.line([10, 8, 20, 20], fill=color, width=2)
    draw.line([30, 8, 20, 20], fill=color, width=2)
    draw.line([10, 32, 20, 20], fill=color, width=2)
    draw.line([30, 32, 20, 20], fill=color, width=2)

    # Draw sand dot
    draw.ellipse([18, 22, 22, 26], outline=color, width=2)

    img.save(output_path)
    print(f"Created: {output_path}")

def create_habit_icon(output_path, is_active=False):
    """Create a habit/tracking icon (star) - 40x40"""
    img = Image.new('RGBA', (TAB_SIZE, TAB_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    color = BLUE if is_active else GRAY

    # Draw star shape
    points = [
        (20, 6),   # Top
        (24, 16),  # Upper right
        (34, 16),  # Right
        (26, 22),  # Middle right
        (29, 32),  # Bottom right
        (20, 26),  # Bottom center
        (11, 32),  # Bottom left
        (14, 22),  # Middle left
        (6, 16),   # Left
        (16, 16)   # Upper left
    ]

    for i in range(len(points) - 1):
        draw.line([points[i], points[i + 1]], fill=color, width=2)

    img.save(output_path)
    print(f"Created: {output_path}")

def create_me_icon(output_path, is_active=False):
    """Create a user/profile icon - 40x40"""
    img = Image.new('RGBA', (TAB_SIZE, TAB_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    color = BLUE if is_active else GRAY

    # Draw head (circle)
    draw.ellipse([14, 6, 26, 18], outline=color, width=2)

    # Draw body (semicircle)
    draw.ellipse([8, 18, 32, 38], outline=color, width=2)

    img.save(output_path)
    print(f"Created: {output_path}")


# ============================================
# Menu Icons (52x52 - larger for better visibility)
# ============================================
MENU_SIZE = 52
MENU_CENTER = MENU_SIZE // 2

def create_menu_user_icon(output_path):
    """Create menu user icon (outlined person style) - 52x52"""
    img = Image.new('RGBA', (MENU_SIZE, MENU_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    color = GRAY

    # Draw head (circle) - larger and clearer
    draw.ellipse([16, 6, 36, 26], outline=color, width=3)

    # Draw body (shoulders) - rounded arc
    draw.arc([8, 22, 44, 48], start=200, end=340, fill=color, width=3)

    img.save(output_path)
    print(f"Created: {output_path}")

def create_menu_folder_icon(output_path):
    """Create menu folder icon (outlined folder) - 52x52"""
    img = Image.new('RGBA', (MENU_SIZE, MENU_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    color = GRAY

    # Draw folder body - simplified, no rounded corners
    draw.rectangle([8, 16, 44, 44], outline=color, width=3)

    # Draw folder tab
    draw.line([8, 24, 44, 24], fill=color, width=3)
    draw.line([16, 16, 18, 8, 34, 8, 36, 16], fill=color, width=3)

    img.save(output_path)
    print(f"Created: {output_path}")

def create_menu_bell_icon(output_path):
    """Create menu notification bell icon - 52x52"""
    img = Image.new('RGBA', (MENU_SIZE, MENU_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    color = GRAY

    # Draw bell body (dome shape)
    draw.arc([10, 8, 42, 36], start=0, end=180, fill=color, width=3)

    # Draw bottom horizontal line
    draw.line([10, 36, 42, 36], fill=color, width=3)

    # Draw small clapper at bottom
    draw.ellipse([20, 38, 32, 48], outline=color, width=3)

    img.save(output_path)
    print(f"Created: {output_path}")

def create_menu_pomodoro_setting_icon(output_path):
    """Create menu pomodoro settings icon - 52x52"""
    img = Image.new('RGBA', (MENU_SIZE, MENU_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    color = GRAY

    # Draw timer outline
    draw.ellipse([12, 6, 40, 34], outline=color, width=3)

    # Draw clock hands
    draw.line([26, 20, 26, 12], fill=color, width=3)
    draw.line([26, 20, 34, 20], fill=color, width=3)

    # Draw simple settings bar at bottom (simplified)
    draw.rectangle([16, 38, 36, 42], fill=color)

    img.save(output_path)
    print(f"Created: {output_path}")

def create_menu_calendar_setting_icon(output_path):
    """Create menu calendar settings icon - 52x52 - SIMPLIFIED"""
    img = Image.new('RGBA', (MENU_SIZE, MENU_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    color = GRAY

    # Draw calendar outline - simple rectangle
    draw.rectangle([8, 10, 44, 46], outline=color, width=3)

    # Draw header line
    draw.line([8, 20, 44, 20], fill=color, width=3)

    # Draw top bindings (simple vertical lines)
    draw.line([18, 4, 18, 14], fill=color, width=3)
    draw.line([34, 4, 34, 14], fill=color, width=3)

    # Simplified: just a small dot to indicate settings
    draw.ellipse([24, 30, 28, 34], fill=color)

    img.save(output_path)
    print(f"Created: {output_path}")

def create_menu_info_icon(output_path):
    """Create menu info icon (i in circle) - 52x52"""
    img = Image.new('RGBA', (MENU_SIZE, MENU_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    color = GRAY

    # Draw circle - larger and clearer
    draw.ellipse([6, 6, 46, 46], outline=color, width=3)

    # Draw "i" - dot
    draw.ellipse([22, 14, 30, 22], fill=color)

    # Draw "i" - stem
    draw.line([26, 24, 26, 38], fill=color, width=3)

    img.save(output_path)
    print(f"Created: {output_path}")


# ============================================
# Create all icons
# ============================================
icons_dir = os.path.dirname(os.path.abspath(__file__))

# TabBar icons (40x40)
create_task_icon(os.path.join(icons_dir, 'tab-task.png'), is_active=False)
create_task_icon(os.path.join(icons_dir, 'tab-task-active.png'), is_active=True)

create_calendar_icon(os.path.join(icons_dir, 'tab-calendar.png'), is_active=False)
create_calendar_icon(os.path.join(icons_dir, 'tab-calendar-active.png'), is_active=True)

create_pomodoro_icon(os.path.join(icons_dir, 'tab-pomodoro.png'), is_active=False)
create_pomodoro_icon(os.path.join(icons_dir, 'tab-pomodoro-active.png'), is_active=True)

create_countdown_icon(os.path.join(icons_dir, 'tab-countdown.png'), is_active=False)
create_countdown_icon(os.path.join(icons_dir, 'tab-countdown-active.png'), is_active=True)

create_habit_icon(os.path.join(icons_dir, 'tab-habit.png'), is_active=False)
create_habit_icon(os.path.join(icons_dir, 'tab-habit-active.png'), is_active=True)

create_me_icon(os.path.join(icons_dir, 'tab-me.png'), is_active=False)
create_me_icon(os.path.join(icons_dir, 'tab-me-active.png'), is_active=True)

# Menu icons (52x52 - larger for better visibility)
create_menu_user_icon(os.path.join(icons_dir, 'menu-user.png'))
create_menu_folder_icon(os.path.join(icons_dir, 'menu-folder.png'))
create_menu_bell_icon(os.path.join(icons_dir, 'menu-bell.png'))
create_menu_pomodoro_setting_icon(os.path.join(icons_dir, 'menu-pomodoro.png'))
create_menu_calendar_setting_icon(os.path.join(icons_dir, 'menu-calendar.png'))
create_menu_info_icon(os.path.join(icons_dir, 'menu-info.png'))

print("\n✅ All 16 icons created successfully!")
print("TabBar icons: 40x40 pixels")
print("Menu icons: 52x52 pixels (larger for visibility)")
