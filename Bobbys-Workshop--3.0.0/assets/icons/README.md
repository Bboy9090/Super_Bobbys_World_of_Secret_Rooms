# App Icons

Place your app icon images here.

## Required Files

- `app-icon.ico` - Windows icon file (256x256 or larger, recommended)
- `app-icon.png` - PNG version (for cross-platform compatibility)

## Icon Specifications

For best results:
- **Size**: 256x256 pixels minimum (512x512 recommended)
- **Format**: ICO format for Windows shortcuts
- **Format**: PNG format for general use

## Converting Images

If you have a PNG/JPG image and need to convert to ICO:

1. Use an online converter: https://convertio.co/png-ico/
2. Or use ImageMagick: `magick convert app-icon.png -resize 256x256 app-icon.ico`

## Current Status

⚠️ **Logo image needs to be added**
- Please save your logo as `app-icon.ico` or `app-icon.png` in this directory
- Then run: `.\scripts\create-desktop-shortcut.ps1`
