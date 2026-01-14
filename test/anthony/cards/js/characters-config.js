/**
 * CHARACTER CONFIGURATION
 * 
 * This file defines all scannable characters for the card game.
 * To add a new character:
 * 
 * 1. Create a .mind file for the card image using MindAR's image compiler:
 *    https://hiukim.github.io/mind-ar-js-doc/tools/compile
 * 
 * 2. Add the character to the CHARACTERS array below
 * 
 * 3. Place assets in the appropriate folders:
 *    - 3D models: ./assets/3D/
 *    - Images: ./assets/img/characters/
 *    - Sounds: ./assets/sound/
 *    - Markers: ./assets/markers/
 */

var CHARACTERS = [
  // ============================================
  // CHARACTER 1: Strega (Witch)
  // ============================================
  {
    id: 'strega',
    name: 'A Strega',
    description: "Prodige de l'île de Prosa, a Strega est chargée de maintenir l'infertilité des terres de Corse.",

    // Card marker - uses individual .mind file
    markerIndex: 0,
    markerFile: 'assets/markers/strega.mind',
    
    // Stats (customize as needed for your game)
    stats: {
      power: 85,
      defense: 40,
      magic: 95,
      speed: 60
    },
    
    // 3D Model (optional - set to null if no 3D model)
    model3D: {
      path: 'null',
      scale: 0.15,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      animation: false  // Play model animations if available
    },
    
    // 2D Images to display (optional - can have multiple)
    images2D: [
      {
        path: 'cards/assets/img/characters/strega_char.png',
        scale: 2,  // Larger size like main.js uses
        position: { x: 0, y: 0.5, z: 0 },  // Above the marker
        opacity: 1.0
      },
      {
        path: 'cards/assets/img/characters/strega_bg.png',
        scale: 3,  // Background larger
        position: { x: 0, y: 0.5, z: -0.1 },  // Behind char
        opacity: 0.8
      }
    ],
    
    // Sound effects
    sounds: {
      // Played when character is first detected
      intro: {
        path: 'assets/sound/SON1.mp3',  // Using existing sound
        volume: 0.7,
        loop: false
      }
      // No ambient sound for now
    },
    
    // Portrait for info panel
    portrait: 'cards/assets/img/characters/strega_char.png',
    
    // Custom color theme for UI
    themeColor: '#10032e'
  },

  // ============================================
  // CHARACTER 2: Knight
  // ============================================
  {
    id: 'knight',
    name: 'Sir Aldric',
    description: 'A noble knight sworn to protect the realm from darkness.',
    
    markerIndex: 1,
    
    stats: {
      power: 90,
      defense: 85,
      magic: 20,
      speed: 50
    },
    
    model3D: {
      path: 'assets/3D/character.glb',  // Replace with knight model
      scale: 0.2,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      animation: true
    },
    
    images2D: [
      {
        path: 'assets/img/characters/knight_shield.png',
        scale: 0.8,
        position: { x: 0.5, y: 0, z: 0 },
        opacity: 1
      }
    ],
    
    sounds: {
      intro: {
        path: 'assets/sound/sword_unsheath.mp3',
        volume: 0.8,
        loop: false
      },
      ambient: {
        path: 'assets/sound/armor_ambient.mp3',
        volume: 0.2,
        loop: true
      }
    },
    
    portrait: 'assets/img/characters/knight_portrait.png',
    themeColor: '#3B82F6'
  },

  // ============================================
  // CHARACTER 3: Forest Spirit
  // ============================================
  {
    id: 'spirit',
    name: 'Sylvan',
    description: 'An ancient forest spirit connected to all living things.',
    
    markerIndex: 2,
    
    stats: {
      power: 45,
      defense: 60,
      magic: 80,
      speed: 90
    },
    
    model3D: {
      path: 'assets/3D/conifer_tree.glb',
      scale: 0.5,
      position: { x: 0, y: -0.3, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      animation: false
    },
    
    images2D: [
      {
        path: 'assets/img/characters/spirit_glow.png',
        scale: 2,
        position: { x: 0, y: 0, z: -0.2 },
        opacity: 0.6
      }
    ],
    
    sounds: {
      intro: {
        path: 'assets/sound/forest_whisper.mp3',
        volume: 0.6,
        loop: false
      },
      ambient: {
        path: 'assets/sound/nature_ambient.mp3',
        volume: 0.25,
        loop: true
      }
    },
    
    portrait: 'assets/img/characters/spirit_portrait.png',
    themeColor: '#10B981'
  }
];

// ============================================
// MARKER FILE CONFIGURATION
// ============================================
// Option 1: Use individual .mind files per character
// Option 2: Use a single .mind file with all cards compiled together

// Set this to true to use the markerFile on each character
// Set to false to use MARKER_CONFIG.markerFile for all
var USE_INDIVIDUAL_MARKERS = true;

var MARKER_CONFIG = {
  // Default marker file (used when USE_INDIVIDUAL_MARKERS = false)
  markerFile: 'assets/markers/cards.mind',
  
  // Maximum number of simultaneous tracked targets
  maxTrack: 1,
  
  // Available individual marker files
  availableMarkers: {
    strega: 'assets/markers/strega.mind',
    marker: 'assets/markers/marker.mind',
    targets: 'assets/markers/targets.mind'
  }
};

// ============================================
// HELPER FUNCTION: Add a new character quickly
// ============================================
function addCharacter(config) {
  // Merge with defaults
  var defaultConfig = {
    markerIndex: CHARACTERS.length,
    stats: { power: 50, defense: 50, magic: 50, speed: 50 },
    model3D: null,
    images2D: [],
    sounds: {},
    portrait: null,
    themeColor: '#6366F1'
  };
  
  var character = Object.assign({}, defaultConfig, config);
  CHARACTERS.push(character);
  return character;
}

// Example: Quick way to add a character
// addCharacter({
//   id: 'dragon',
//   name: 'Fire Drake',
//   description: 'A fearsome dragon breathing eternal flames.',
//   model3D: { path: '../assets/3D/dragon.glb', scale: 0.3 }
// });

console.log('Character config loaded:', CHARACTERS.length, 'characters defined');
