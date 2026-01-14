# Character Card Scanner - Setup Guide

## Overview
This MindAR-based app scans physical character cards and displays AR content (3D models, 2D images, sounds) based on which character is detected.

## Quick Start
1. Start the server: `node server.js`
2. Go to `https://YOUR-IP:8443/cards` on your device
3. Point camera at a character card

---

## Adding New Characters

### Step 1: Create Card Image
Design your character card image (recommended 512x512px or larger, high contrast).

### Step 2: Compile Marker File
1. Go to: https://hiukim.github.io/mind-ar-js-doc/tools/compile
2. Upload ALL your card images at once (one per character)
3. Download the generated `.mind` file
4. Save it as `cards/assets/markers/cards.mind`

**Important**: The order you upload images = the marker index for each character.

### Step 3: Add Character to Config
Edit `cards/js/characters-config.js`:

```javascript
// Add to CHARACTERS array:
{
  id: 'my_character',           // Unique ID (no spaces)
  name: 'Character Name',       // Display name
  description: 'Description',   // Short description
  
  markerIndex: 3,               // Index in .mind file (0-based)
  
  stats: {                      // Game stats (customize)
    power: 75,
    defense: 60,
    magic: 40,
    speed: 80
  },
  
  // 3D Model (optional)
  model3D: {
    path: '../assets/3D/my_model.glb',
    scale: 0.2,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    animation: true
  },
  
  // 2D Images (optional, can have multiple)
  images2D: [
    {
      path: '../assets/img/characters/my_effect.png',
      scale: 1.5,
      position: { x: 0, y: 0, z: -0.1 },
      opacity: 0.8
    }
  ],
  
  // Sounds (optional)
  sounds: {
    intro: {
      path: '../assets/sound/my_intro.mp3',
      volume: 0.7,
      loop: false
    },
    ambient: {
      path: '../assets/sound/my_ambient.mp3',
      volume: 0.3,
      loop: true
    }
  },
  
  portrait: '../assets/img/characters/my_portrait.png',
  themeColor: '#FF5722'
}
```

### Quick Add Helper
You can also use the helper function:

```javascript
addCharacter({
  id: 'dragon',
  name: 'Fire Drake',
  description: 'A fearsome dragon.',
  markerIndex: 4,
  model3D: { path: '../assets/3D/dragon.glb', scale: 0.3 },
  themeColor: '#FF5722'
});
```

---

## Folder Structure
```
cards/
├── index.html              # Main HTML
├── css/
│   └── cards.css          # Styles
├── js/
│   ├── characters-config.js  # Character definitions (EDIT THIS)
│   └── card-scanner.js       # Main app logic
└── assets/
    ├── markers/
    │   └── cards.mind      # Compiled marker file
    ├── 3D/
    │   └── *.glb           # 3D models
    ├── img/
    │   └── characters/
    │       └── *.png       # Portraits, effects
    └── sound/
        └── *.mp3           # Sound effects
```

---

## Tips

### Marker Quality
- Use high-contrast images
- Avoid repetitive patterns
- Unique features help tracking
- Test with MindAR compiler's quality score

### 3D Models
- Use `.glb` format (compressed GLTF)
- Keep polygon count reasonable (<50k faces)
- Include animations in the GLB if needed

### Performance
- Limit `maxTrack` to 1-2 for better performance
- Use compressed textures
- Keep audio files small (MP3, 128kbps)

---

## Debugging
- Press 'D' key to toggle debug panel
- Check browser console for errors
- Status bar shows current state

---

## Multiple .mind Files
If you prefer separate marker files per character:

1. Compile each card separately
2. Update `MARKER_CONFIG.markerFile` per character
3. Modify `card-scanner.js` to load multiple marker files

Current setup assumes ONE compiled file with ALL cards for simplicity.
