#!/usr/bin/env python3
"""
Create simple PNG icons for WeChat miniprogram tabBar.
Each icon is 40x40 pixels with transparent background.
"""

from PIL import Image, ImageDraw
import os

# Icon dimensions
SIZE = 40
CENTER = SIZE // 2

# Colors
GRAY = (128, 128, 128, 255)      # Normal state
BLUE = (59, 130, 246, 255)       # Active state (theme color)

def create_task_icon(output_path, is_active=False):
    """Create a checkbox/task list icon"""
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    color = BLUE if is_active else GRAY

    # Draw checkbox outline
    x1, y1 = 8, 8
    x2, y2 = 20, 20
    draw.rectangle([x1, y1, x2, y2], outline=color, width=2)

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
    """Create a calendar icon"""
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    color = BLUE if is_active else GRAY

    # Draw calendar outline
    draw.rectangle([6, 7, 34, 34], outline=color, width=2)

    # Draw header line
    draw.line([6, 14, 34, 14], fill=color, width=2)

    # Draw top bindings
    draw.line([12, 5, 12, 11], fill=color, width=2)
    draw.line([28, 5, 28, 11], fill=color, width=2)

    # Draw date block
    draw.rectangle([14, 20, 26, 32], outline=color, width=2)

    img.save(output_path)
    print(f"Created: {output_path}")

def create_pomodoro_icon(output_path, is_active=False):
    """Create a timer/clock icon"""
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    color = BLUE if is_active else GRAY

    # Draw clock circle
    bbox = [6, 6, 34, 34]
    draw.ellipse(bbox, outline=color, width=2)

    # Draw hour hand
    draw.line([20, 20, 20, 14], fill=color, width=2)

    # Draw minute hand
    draw.line([20, 20, 26, 20], fill=color, width=2)

    # Draw center dot
    center_bbox = [18, 18, 22, 22]
    draw.ellipse(center_bbox, fill=color)

    img.save(output_path)
    print(f"Created: {output_path}")

def create_countdown_icon(output_path, is_active=False):
    """Create a countdown/hourglass icon"""
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
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
    """Create a habit/tracking icon (star)"""
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
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

    # Draw filled star with outline
    for i in range(len(points) - 1):
        draw.line([points[i], points[i + 1]], fill=color, width=2)

    img.save(output_path)
    print(f"Created: {output_path}")

def create_me_icon(output_path, is_active=False):
    """Create a user/profile icon"""
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    color = BLUE if is_active else GRAY

    # Draw head (circle)
    head_bbox = [14, 6, 26, 18]
    draw.ellipse(head_bbox, outline=color, width=2)

    # Draw body (semicircle)
    body_bbox = [8, 18, 32, 38]
    draw.ellipse(body_bbox, outline=color, width=2)

    img.save(output_path)
    print(f"Created: {output_path}")

# Create all icons
icons_dir = os.path.dirname(os.path.abspath(__file__))

# Task icons
create_task_icon(os.path.join(icons_dir, 'tab-task.png'), is_active=False)
create_task_icon(os.path.join(icons_dir, 'tab-task-active.png'), is_active=True)

# Calendar icons
create_calendar_icon(os.path.join(icons_dir, 'tab-calendar.png'), is_active=False)
create_calendar_icon(os.path.join(icons_dir, 'tab-calendar-active.png'), is_active=True)

# Pomodoro icons
create_pomodoro_icon(os.path.join(icons_dir, 'tab-pomodoro.png'), is_active=False)
create_pomodoro_icon(os.path.join(icons_dir, 'tab-pomodoro-active.png'), is_active=True)

# Countdown icons
create_countdown_icon(os.path.join(icons_dir, 'tab-countdown.png'), is_active=False)
create_countdown_icon(os.path.join(icons_dir, 'tab-countdown-active.png'), is_active=True)

# Habit icons
create_habit_icon(os.path.join(icons_dir, 'tab-habit.png'), is_active=False)
create_habit_icon(os.path.join(icons_dir, 'tab-habit-active.png'), is_active=True)

# Me icons
create_me_icon(os.path.join(icons_dir, 'tab-me.png'), is_active=False)
create_me_icon(os.path.join(icons_dir, 'tab-me-active.png'), is_active=True)

print("\n✅ All 10 tabBar icons created successfully!")
