# PROSA AR Project - Context Summary & Architecture

**Project**: PROSA AR - Mythical Character Encounters in Augmented Reality  
**Last Updated**: March 2026  
**Stack**: Vanilla JavaScript, Three.js 0.169, WebXR, MindAR, Lottie animations

---

## Recent Work Summary (Current Chat Session)

### 1. **Character AR Button Integration**
- Added AR button to character encyclopedia detail pages (`js/views/main/charactersView.js`)
- Button links to immersive WebXR experience: `./AR/immersif/index.html?character={key}`

### 2. **Character ID Mismatch Fixes**
**Problem**: Data inconsistencies between main app and AR system
- Main app JSON keys vs AR-specific character IDs didn't match
- Caused wrong character to load in WebXR experiences

**Fixed IDs in AR/data/characters.json**:
```
fulettu ← fullettu
squadra_darozza ← squadra
lou_garagai ← garagaï
cabro_dor ← cabrodor
fada_lavandula ← lavandula
gyptis_e_protis ← gyptisprotis
lou_drape ← drape
```

### 3. **WebXR Pre-loading Fix**
- Made `init()` async in `immersive-webxr.js`
- Pre-loads character data before WebXR support check
- **Result**: Correct character displays on incompatible devices instead of default "A Fata"

### 4. **Navigation Improvements**
- "Choisir un autre personnage" button now redirects to main app encyclopedia
- Redirect: `../../index.html#univers-prosa/encyclopedie`
- Back button in AR experience goes to: `../../index.html#univers-prosa/encyclopedie`

### 5. **Loading Screen UI Enhancements**
- **Removed emojis** from AR loading screens
- **Replaced with animated Prosa Lottie logo** (`prosa-o.json`)
- Added Lottie initialization directly in JS instead of relying on global handlers
- Fixed positioning:
  - Made `ar-loading-icon` `position: relative` to override inherited `.logo-o-lottie` absolute positioning
  - Logo now centers properly in loading overlay

### 6. **AR Menu Icon Modernization**
**Replaced emojis with SVG icons** in start screen (`AR/immersif/index.html`):

| Element | Before | After |
|---------|--------|-------|
| À propos | 🧚 | Person/profile icon |
| Comment interagir | 🎮 | Compass/cursor icon |
| Phone movement | 📱 | Phone with arrow |
| Walking | 🚶 | Movement arrows |
| Sound | 🔊 | Speaker with waves |
| Subtitles | 💬 | Speech bubble |
| Conseils | 💡 | Lightbulb |
| Button | 🚀 | Play triangle |

**CSS Changes**:
- Section headings use `display: flex` with `gap: 8px` for icon spacing
- List items: `.info-section ul li` now `display: flex` with inline SVG icons
- Button (`.start-btn`): `display: inline-flex` with icon alignment
- All SVG icons sized appropriately (16-20px)

### 7. **UI Button Cleanup**
- Removed "Rencontrez A Fata" demo link from scan AR (`AR/index.html`)
- Previously in top-left, now removed to reduce clutter

---

## Application Architecture

### Directory Structure

```
prosa/
├── index.html                    # Main app entry
├── app.js                        # Main app logic
├── router.js                     # Hash-based routing
├── styles.css                    # Main styles
│
├── data/                         # Main app data
│   ├── characters.json           # Character encyclopedia
│   ├── characters_details.json
│   ├── dialogs.json
│   ├── steps.json
│   └── ...other game data
│
├── js/
│   ├── initGame.js              # Game initialization
│   ├── loadData.js              # Data loading
│   ├── views/
│   │   ├── main/
│   │   │   └── charactersView.js # Encyclopedia with AR button
│   │   ├── actions/
│   │   ├── components/
│   │   └── Temp/
│   └── ...other utilities
│
├── assets/                       # Game assets
│   ├── logo/
│   ├── lottie/
│   │   ├── prosa-o.json         # Animated logo (used in loading)
│   │   ├── prosa-o-clair.json
│   │   └── ...
│   ├── characters/              # Character images
│   ├── fonts/
│   └── ...
│
├── AR/                           # AR Module (Card Scanning)
│   ├── index.html               # AR entry point
│   ├── server.js                # AR server
│   ├── package.json
│   │
│   ├── data/
│   │   └── characters.json       # AR-specific character data
│   │
│   ├── js/
│   │   └── card-scanner.js       # MindAR scanning logic
│   │
│   ├── css/
│   │   └── cards.css            # Scanning UI styles
│   │
│   ├── assets/
│   │   ├── markers/             # .mind marker files
│   │   ├── 3D/                  # 3D model assets
│   │   ├── img/
│   │   │   └── characters/
│   │   ├── sound/
│   │   └── video/
│   │
│   ├── editor/                  # AR Editor tool
│   │   ├── index.html
│   │   ├── editor.js
│   │   └── style.css
│   │
│   └── immersif/                # WebXR Immersive Experience
│       ├── index.html           # Immersive entry point
│       ├── test-ar.html
│       │
│       ├── js/
│       │   ├── immersive-webxr.js    # Main WebXR logic
│       │   ├── GLTFLoader.js         # 3D model loading
│       │   └── three.min.js          # Three.js library
│       │
│       ├── css/
│       │   ├── immersive.css         # All immersive styles
│       │   └── ...
│       │
│       └── style.css
│
└── games-playtests/             # Location-based AR experiences
    ├── corte/
    ├── prosa/
    └── toulon/
```

---

## Core Systems

### 1. Main Application Flow

**Entry**: `index.html` → `app.js`

**Routing** (`router.js`):
- Hash-based routing: `#univers-prosa/encyclopedie`
- Main views: encyclopedie, minigame, cinematique, actions

**Character Encyclopedia** (`charactersView.js`):
```javascript
// generates character cards with:
- Portrait image
- Character name & description
- AR button → immersive-webxr.js?character={key}
```

### 2. AR System: Two Modes

#### **Mode 1: Scan AR (Card Scanning)**
**File**: `AR/js/card-scanner.js`  
**Library**: MindAR for image recognition

**Flow**:
1. User opens `AR/index.html`
2. MindARThree loads `.mind` marker files from `assets/markers/`
3. Camera shows live feed with character cards overlaid
4. On card detection: Loads and renders 3D model at anchor point
5. UI buttons: back, mute, zoom, more info

**Key Code**:
```javascript
const mindarThree = new MindARThree({
  container: document.getElementById('ar-container'),
  imageTargetSrc: markerFile,  // .mind file
  maxTrack: 1,
  uiLoading: 'no',
  uiScanning: 'no',
  uiError: 'no'
});
await mindarThree.start();  // Requests camera permission
```

#### **Mode 2: Immersive WebXR**
**File**: `AR/immersif/js/immersive-webxr.js`  
**Libraries**: Three.js 0.169, WebXR API

**Flow**:
1. User clicks AR button → `immersif/index.html?character={id}`
2. **Pre-loading**: Loads character data BEFORE WebXR check
3. **Start Screen**: Shows character info + instructions
4. **XR Session**: User initiates AR → character appears in real world
5. **Interaction**: Move phone/walk to approach character, listen for audio

**URL Parameter**: `?character=fulettu` → loads that character

**WebXR Setup**:
```javascript
const session = await navigator.xr.requestSession('immersive-ar', options);
// DOM Overlay for UI elements visible during AR
const overlay = await session.requestDOMOverlay({ root: document.body });
```

---

### 3. Character Data System

**Main App** (`data/characters.json`):
```json
{
  "fulettu": {
    "name": "A Fulettu",
    "description": "...",
    "themeColor": "#...",
    "sound": "path/to/audio.mp3",
    "type": "phantome"
  },
  "squadra_darozza": { ... },
  ...
}
```

**AR System** (`AR/data/characters.json`):
```json
{
  "id": "fulettu",
  "name": "A Fulettu",
  "model": "path/to/model.gltf",
  "scale": 1.0,
  "position": { "x": 0, "y": 0, "z": 0 },
  "sound": "path/to/audio.mp3",
  "ambient": "path/to/ambient.mp3"
}
```

**Critical**: IDs must match between both files!

---

### 4. UI Components & Styling

#### **Loading Screen** (`immersive.css`):
```css
#ar-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  z-index: 10000;
  pointer-events: none;  /* UI buttons below override with pointer-events: auto */
}

.ar-loading {
  position: absolute;
  display: none;
  background: linear-gradient(135deg, #1a1812, #252218);
  z-index: 200;
}

.ar-loading.visible { display: flex; opacity: 1; }

.ar-loading-icon {
  width: 80px; height: 80px;
  animation: float 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

#### **Start Screen Buttons**:
```css
.start-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--primary);
  padding: 18px 48px;
}

.section-icon { width: 20px; height: 20px; }
.list-icon { width: 16px; height: 16px; }
.btn-icon { width: 18px; height: 18px; }
```

---

### 5. Lottie Animation Integration

**Global Initialization** (`immersif/index.html`):
```javascript
<script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.logo-o-lottie').forEach(function(el) {
      window.lottie.loadAnimation({
        container: el,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: window.resolvePath(el.getAttribute('data-lottie'))
      });
    });
  });
</script>
```

**AR Loading Lottie** (`immersive-webxr.js`):
```javascript
if (arLoadingIcon && !arLoadingIcon.dataset.lottieInit && window.lottie) {
  window.lottie.loadAnimation({
    container: arLoadingIcon,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: window.resolvePath('../../assets/lottie/prosa-o.json')
  });
  arLoadingIcon.dataset.lottieInit = 'true';
}
```

---

### 6. Back Button Navigation System

**All Back Buttons → Main App Encyclopedia**:
```javascript
// Card Scanner (AR/index.html)
backBtn.addEventListener('click', () => {
  window.location.href = '../index.html#univers-prosa/encyclopedie';
});

// Immersive (AR/immersif/index.html)
// During start screen
backToMenuBtn.addEventListener('click', () => {
  window.location.href = '../../index.html#univers-prosa/encyclopedie';
});

// During AR session (ar-back-btn)
arBackBtn.addEventListener('click', () => {
  xrSession.end();  // End AR session
  window.location.href = '../../index.html#univers-prosa/encyclopedie';
});
```

---

## Key Technical Details

### Three.js & WebXR Integration

**Model Loading**:
```javascript
const gltf = await gltfLoader.loadAsync(modelPath);
const model = gltf.scene;
model.scale.set(scale.x, scale.y, scale.z);
model.position.set(x, y, z);
scene.add(model);
```

**Audio Spatialization**:
- Uses Web Audio API for 3D positional audio
- Sound follows character position in 3D space
- Ambient sounds for environment

### WebXR Overlay

Only DOM elements below `#ar-overlay` are interactive during AR:
- Language toggle button
- Back button (ar-back-btn)
- Subtitle display

Loading screen and menus hidden when AR session active.

### Performance Optimizations

**card-scanner.js**:
```javascript
- filterMinCF: 0.0001  // Confidence filter
- filterBeta: 0.001   // Tracking smoothing
- warmupTolerance: 5  // Tracking startup tolerance
- missTolerance: 5    // Loss of tracking tolerance
```

**immersive-webxr.js**:
- Async initialization
- Conditional visibility classes for UI
- Efficient memory cleanup on session end

---

## Known Limitations & Workarounds

1. **Camera Permission**: MindAR requests on `mindarThree.start()` manually - check browser settings to reset camera permissions if not prompted

2. **Character ID Matching**: Always verify IDs between `data/characters.json` and `AR/data/characters.json`

3. **Marker Files**: `.mind` files in `AR/assets/markers/` must match configured character markers

4. **WebXR Support**: 
   - Chrome: Android only
   - Safari: iOS 15.4+ only
   - Requires HTTPS in production

5. **3D Models**: Must be optimized GLB/GLTF with embedded textures

---

## Environment Setup

**Main App** (Vanilla JS):
- No build step required
- HTTP server for local dev

**AR Module**:
```bash
cd AR
npm install
npm start  # Runs on port 8000
```

**Assets**:
- Lottie files: `assets/lottie/prosa-o.json`
- Marker files: `AR/assets/markers/*.mind`
- 3D models: `AR/assets/3D/*.gltf` or `.glb`
- Audio: `AR/assets/sound/*.mp3`

---

## Future Enhancement Ideas

1. **Dialog System**: Interactive conversations in immersive mode
2. **Gesture Recognition**: Hand tracking for interactions
3. **Multiplayer**: Multiple users in same AR space (Croquet.io)
4. **Analytics**: Track which characters are most viewed
5. **Localization**: Support for multiple languages (Corsican, French, Italian)

---

## Contact & Notes

- **App Style**: Dark theme with warm earth tones (`#ece4cb` foreground)
- **Animations**: Smooth 0.2s transitions, float animations for emphasis
- **Accessibility**: SVG icons with semantic HTML, proper ARIA labels
- **Responsive**: Mobile-first design for AR viewing

