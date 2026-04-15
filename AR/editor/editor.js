/**
 * PROSA AR Scene Editor
 * A visual tool for editing AR character configurations
 */

// ============================================
// State Management
// ============================================

const state = {
  data: null, // Full JSON data
  characters: [], // Characters array
  settings: {}, // Global settings
  selectedCharacterId: null,
  previewMode: 'scan', // 'scan' or 'immersive'
  unsavedChanges: false
};

/**
 * Mark state as having unsaved changes and trigger auto-save
 */
function markUnsaved() {
  state.unsavedChanges = true;
  if (typeof debouncedAutoSave === 'function') {
    debouncedAutoSave();
  }
}

// ============================================
// DOM Elements
// ============================================

const elements = {
  // Lists
  characterList: document.getElementById('character-list'),
  
  // Editor containers
  emptyState: document.getElementById('empty-state'),
  editorContainer: document.getElementById('editor-container'),
  
  // Character info inputs
  charId: document.getElementById('char-id'),
  charName: document.getElementById('char-name'),
  charRegion: document.getElementById('char-region'),
  charArEnabled: document.getElementById('char-ar-enabled'),
  charColor: document.getElementById('char-color'),
  charColorText: document.getElementById('char-color-text'),
  charDescription: document.getElementById('char-description'),
  charDescriptionAlt: document.getElementById('char-description-alt'),
  charPortrait: document.getElementById('char-portrait'),
  charType: document.getElementById('char-type'),
  
  // Marker inputs
  markerFile: document.getElementById('marker-file'),
  markerIndex: document.getElementById('marker-index'),
  
  // Asset lists
  assets2dList: document.getElementById('assets-2d-list'),
  assets3dList: document.getElementById('assets-3d-list'),
  layersList: document.getElementById('layers-list'),
  soundsList: document.getElementById('sounds-list'),
  subtitlesList: document.getElementById('subtitles-list'),
  
  // Interaction inputs
  interactionProximity: document.getElementById('interaction-proximity'),
  interactionSubtitleDist: document.getElementById('interaction-subtitle-dist'),
  
  // Modals
  assetModal: document.getElementById('asset-modal'),
  importModal: document.getElementById('import-modal'),
  
  // Other
  jsonVersion: document.getElementById('json-version'),
  toastContainer: document.getElementById('toast-container'),
  
  // Filters
  searchCharacters: document.getElementById('search-characters'),
  filterRegion: document.getElementById('filter-region')
};

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', init);

async function init() {
  console.log('Initializing AR Scene Editor...');
  
  // Try to load data from the characters.json file
  await loadDataFromFile();
  
  // Setup event listeners
  setupEventListeners();
  
  // Render initial state
  renderCharacterList();
}

const LOCALSTORAGE_KEY = 'prosa_ar_editor_data';

async function loadDataFromFile() {
  // First check if there's data in localStorage (might have unsaved edits)
  const localData = localStorage.getItem(LOCALSTORAGE_KEY);
  
  try {
    const response = await fetch('../data/characters.json');
    if (response.ok) {
      const fileData = await response.json();
      
      // If localStorage has data, ask user which to use
      if (localData) {
        const parsedLocal = JSON.parse(localData);
        const localTime = parsedLocal._savedAt ? new Date(parsedLocal._savedAt).toLocaleString() : 'unknown time';
        
        if (confirm(`Found local edits from ${localTime}.\n\nClick OK to restore local edits, or Cancel to load from file (discards local changes).`)) {
          delete parsedLocal._savedAt;
          loadData(parsedLocal);
          showToast('Restored from local storage', 'info');
          return;
        } else {
          localStorage.removeItem(LOCALSTORAGE_KEY);
        }
      }
      
      loadData(fileData);
      showToast('Data loaded successfully', 'success');
    } else {
      // Server not available, try localStorage
      if (localData) {
        const parsedLocal = JSON.parse(localData);
        delete parsedLocal._savedAt;
        loadData(parsedLocal);
        showToast('Loaded from local storage (offline mode)', 'info');
      } else {
        console.log('Could not load characters.json, starting with empty state');
        loadData(getEmptyData());
      }
    }
  } catch (error) {
    console.log('Error loading data:', error);
    // Try localStorage as fallback
    if (localData) {
      const parsedLocal = JSON.parse(localData);
      delete parsedLocal._savedAt;
      loadData(parsedLocal);
      showToast('Loaded from local storage (offline mode)', 'info');
    } else {
      loadData(getEmptyData());
    }
  }
}

function getEmptyData() {
  return {
    version: '1.1',
    settings: {
      useIndividualMarkers: true,
      maxTrack: 1,
      defaultAssetScale: 2,
      defaultThemeColor: '#6366F1',
      defaultVisibility: ['scan', 'immersive']
    },
    characters: []
  };
}

function loadData(data) {
  state.data = data;
  state.settings = data.settings || {};
  state.characters = data.characters || [];
  
  elements.jsonVersion.textContent = 'v' + (data.version || '1.0');
  
  renderCharacterList();
}

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
  // Import/Export
  document.getElementById('import-btn').addEventListener('click', showImportModal);
  document.getElementById('export-btn').addEventListener('click', exportJSON);
  document.getElementById('save-btn').addEventListener('click', saveNow);
  document.getElementById('clear-local-btn').addEventListener('click', clearLocalStorage);
  
  // Preview
  document.getElementById('preview-btn').addEventListener('click', openPreview);
  document.getElementById('preview-close').addEventListener('click', closePreview);
  document.getElementById('preview-reset').addEventListener('click', resetPreviewCamera);
  document.getElementById('preview-save').addEventListener('click', saveNow);
  document.querySelectorAll('input[name="preview-mode"]').forEach(radio => {
    radio.addEventListener('change', (e) => updatePreviewMode(e.target.value));
  });
  
  // Mobile navigation
  setupMobileNav();
  
  // Add character
  document.getElementById('add-character-btn').addEventListener('click', addNewCharacter);
  document.getElementById('delete-character-btn').addEventListener('click', deleteSelectedCharacter);
  
  // Tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
  
  // Preview mode toggle (inline in tabs header)
  document.querySelectorAll('.mode-btn-inline').forEach(btn => {
    btn.addEventListener('click', () => setPreviewMode(btn.dataset.mode));
  });

  // Asset summary bar click-to-tab
  document.querySelectorAll('.summary-item[data-tab]').forEach(item => {
    item.addEventListener('click', () => switchTab(item.dataset.tab));
  });
  
  // Add asset buttons
  document.getElementById('add-2d-asset-btn').addEventListener('click', () => openAssetModal('2d'));
  document.getElementById('add-3d-asset-btn').addEventListener('click', () => openAssetModal('3d'));
  document.getElementById('add-layer-btn').addEventListener('click', () => openAssetModal('layer'));
  document.getElementById('add-sound-btn').addEventListener('click', () => openAssetModal('sound'));
  document.getElementById('add-subtitle-btn').addEventListener('click', () => openSubtitleModal());
  
  // Interaction settings (auto-save on change)
  ['interaction-proximity', 'interaction-subtitle-dist'].forEach(id => {
    document.getElementById(id).addEventListener('change', saveInteractionSettings);
  });
  
  // Modal controls
  document.getElementById('modal-close').addEventListener('click', closeAssetModal);
  document.getElementById('modal-cancel').addEventListener('click', closeAssetModal);
  document.getElementById('modal-save').addEventListener('click', saveAssetFromModal);
  
  // Import modal
  document.getElementById('import-modal-close').addEventListener('click', closeImportModal);
  document.getElementById('import-cancel').addEventListener('click', closeImportModal);
  document.getElementById('import-confirm').addEventListener('click', confirmImport);
  document.getElementById('import-file').addEventListener('change', handleFileImport);
  
  // Character info inputs (with debounce)
  const infoInputs = [
    'char-id', 'char-name', 'char-region', 'char-color', 'char-color-text',
    'char-description', 'char-description-alt', 'char-portrait', 'char-type',
    'marker-file', 'marker-index', 'char-ar-enabled'
  ];
  
  infoInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', debounce(saveCharacterInfo, 300));
      el.addEventListener('change', saveCharacterInfo);
    }
  });
  
  // Color picker sync
  elements.charColor.addEventListener('input', (e) => {
    elements.charColorText.value = e.target.value;
  });
  elements.charColorText.addEventListener('input', (e) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
      elements.charColor.value = e.target.value;
    }
  });
  
  // Search and filter
  elements.searchCharacters.addEventListener('input', renderCharacterList);
  elements.filterRegion.addEventListener('change', renderCharacterList);
  
  // Warn before leaving with unsaved changes
  window.addEventListener('beforeunload', (e) => {
    if (state.unsavedChanges) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
}

// ============================================
// Character List
// ============================================

function renderCharacterList() {
  const search = elements.searchCharacters.value.toLowerCase();
  const region = elements.filterRegion.value;
  
  let filtered = state.characters;
  
  if (search) {
    filtered = filtered.filter(c => 
      c.name?.toLowerCase().includes(search) ||
      c.id?.toLowerCase().includes(search)
    );
  }
  
  if (region) {
    filtered = filtered.filter(c => c.region === region);
  }
  
  elements.characterList.innerHTML = filtered.map(char => `
    <div class="character-item ${char.id === state.selectedCharacterId ? 'active' : ''}" 
         data-id="${char.id}">
      <div class="character-avatar" style="border-color: ${char.themeColor || '#6366F1'}">
        ${char.portrait ? `<img src="../${char.portrait}" alt="" onerror="this.style.display='none'">` : ''}
        <span>${getCharacterEmoji(char)}</span>
      </div>
      <div class="character-info">
        <div class="character-name">${char.name || 'Unnamed'}</div>
        <div class="character-region">${char.region || 'No region'}</div>
      </div>
    </div>
  `).join('');
  
  // Add click handlers
  elements.characterList.querySelectorAll('.character-item').forEach(item => {
    item.addEventListener('click', () => selectCharacter(item.dataset.id));
  });
}

function getCharacterEmoji(char) {
  if (char.characterType === 'player') return '🎮';
  if (char.region === 'PROVENCE') return '☀️';
  return '🏔️';
}

function selectCharacter(id) {
  state.selectedCharacterId = id;
  renderCharacterList();
  
  const char = getSelectedCharacter();
  if (char) {
    elements.emptyState.style.display = 'none';
    elements.editorContainer.style.display = 'block';
    populateEditor(char);
  } else {
    elements.emptyState.style.display = 'flex';
    elements.editorContainer.style.display = 'none';
  }
}

function getSelectedCharacter() {
  return state.characters.find(c => c.id === state.selectedCharacterId);
}

// ============================================
// Character Editor
// ============================================

function populateEditor(char) {
  // Basic info
  elements.charId.value = char.id || '';
  elements.charName.value = char.name || '';
  elements.charRegion.value = char.region || 'CORSE';
  elements.charColor.value = char.themeColor || '#6366F1';
  elements.charColorText.value = char.themeColor || '#6366F1';
  if (elements.charArEnabled) elements.charArEnabled.checked = !!char.arEnabled;
  elements.charDescription.value = char.description || '';
  elements.charDescriptionAlt.value = char.descriptionCorsican || char.descriptionProvencal || '';
  elements.charPortrait.value = char.portrait || '';
  elements.charType.value = char.characterType || '';
  
  // Marker
  elements.markerFile.value = char.marker?.file || '';
  elements.markerIndex.value = char.marker?.targetIndex || 0;
  
  // Render assets
  render2DAssets(char);
  render3DAssets(char);
  renderLayers(char);
  renderSounds(char);
  renderInteractionSettings(char);
  renderSubtitles(char);
  updatePreviewInfo(char);
}

function saveCharacterInfo() {
  const char = getSelectedCharacter();
  if (!char) return;
  
  const oldId = char.id;
  
  // Update basic info
  char.id = elements.charId.value || char.id;
  char.name = elements.charName.value;
  char.region = elements.charRegion.value;
  char.themeColor = elements.charColorText.value || elements.charColor.value;
  char.description = elements.charDescription.value;
  char.portrait = elements.charPortrait.value;
  char.characterType = elements.charType.value || undefined;
  char.arEnabled = elements.charArEnabled ? elements.charArEnabled.checked : !!char.arEnabled;
  
  // Handle regional description
  if (char.region === 'PROVENCE') {
    char.descriptionProvencal = elements.charDescriptionAlt.value;
    delete char.descriptionCorsican;
  } else {
    char.descriptionCorsican = elements.charDescriptionAlt.value;
    delete char.descriptionProvencal;
  }
  
  // Marker
  if (elements.markerFile.value) {
    char.marker = {
      file: elements.markerFile.value,
      targetIndex: parseInt(elements.markerIndex.value) || 0
    };
  } else {
    delete char.marker;
  }
  
  // Update selected ID if it changed
  if (oldId !== char.id) {
    state.selectedCharacterId = char.id;
  }
  
  markUnsaved();
  renderCharacterList();
  updatePreviewInfo(char);
}

// ============================================
// 2D Assets
// ============================================

function render2DAssets(char) {
  const assets = char.assets?.['2d'] || [];
  
  if (assets.length === 0) {
    elements.assets2dList.innerHTML = `
      <div class="empty-list">
        <div class="empty-list-icon">🖼️</div>
        <p>No 2D assets yet</p>
      </div>
    `;
    return;
  }
  
  // Check how many are visible in current mode
  const visibleCount = getVisibleCount(assets, state.previewMode);
  const hiddenCount = assets.length - visibleCount;
  const modeNotice = renderModeNotice(visibleCount, hiddenCount, assets.length, '2D assets');
  
  elements.assets2dList.innerHTML = modeNotice + assets.map((asset, index) => {
    const isVisible = isVisibleInCurrentMode(asset);
    return `
    <div class="asset-card ${!isVisible ? 'hidden-in-mode' : ''}" data-index="${index}" data-type="2d">
      <div class="asset-preview">
        <img src="../${asset.path}" alt="${asset.id}" onerror="this.parentElement.innerHTML='<span class=\\'asset-preview-icon\\'>🖼️</span>'">
      </div>
      <div class="asset-name">${asset.id || 'Asset ' + (index + 1)}</div>
      <div class="asset-path">${asset.path || 'No path'}</div>
      <div class="asset-visibility">
        ${renderVisibilityBadges(asset.visibleIn)}
      </div>
      <div class="asset-actions">
        <button class="btn btn-small btn-secondary edit-asset-btn">Edit</button>
        <button class="btn btn-small btn-danger delete-asset-btn">×</button>
      </div>
    </div>
  `}).join('');
  
  // Add event listeners
  elements.assets2dList.querySelectorAll('.edit-asset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.asset-card');
      openAssetModal('2d', parseInt(card.dataset.index));
    });
  });
  
  elements.assets2dList.querySelectorAll('.delete-asset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.asset-card');
      deleteAsset('2d', parseInt(card.dataset.index));
    });
  });
  
  // Visibility toggle listeners
  elements.assets2dList.querySelectorAll('.vis-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = e.target.closest('.asset-card');
      toggleAssetVisibility('2d', parseInt(card.dataset.index), btn.dataset.mode);
    });
  });
}

// ============================================
// 3D Assets
// ============================================

function render3DAssets(char) {
  const assets = char.assets?.['3d'] || [];
  
  if (assets.length === 0) {
    elements.assets3dList.innerHTML = `
      <div class="empty-list">
        <div class="empty-list-icon">📦</div>
        <p>No 3D models yet</p>
      </div>
    `;
    return;
  }
  
  // Check how many are visible in current mode
  const visibleCount = getVisibleCount(assets, state.previewMode);
  const hiddenCount = assets.length - visibleCount;
  const modeNotice = renderModeNotice(visibleCount, hiddenCount, assets.length, '3D models');
  
  elements.assets3dList.innerHTML = modeNotice + assets.map((asset, index) => {
    const isVisible = isVisibleInCurrentMode(asset);
    return `
    <div class="asset-card ${!isVisible ? 'hidden-in-mode' : ''}" data-index="${index}" data-type="3d">
      <div class="asset-preview asset-preview-3d" data-model-path="../${asset.path}" data-asset-index="${index}">
        <div class="thumbnail-loading">
          <div class="thumbnail-spinner"></div>
        </div>
      </div>
      <div class="asset-name">${asset.id || 'Model ' + (index + 1)}</div>
      <div class="asset-path">${asset.path || 'No path'}</div>
      <div class="asset-visibility">
        ${renderVisibilityBadges(asset.visibleIn)}
      </div>
      <div class="asset-actions">
        <button class="btn btn-small btn-secondary edit-asset-btn">Edit</button>
        <button class="btn btn-small btn-danger delete-asset-btn">×</button>
      </div>
    </div>
  `}).join('');
  
  // Load 3D thumbnails asynchronously
  elements.assets3dList.querySelectorAll('.asset-preview-3d').forEach(async (previewEl) => {
    const modelPath = previewEl.dataset.modelPath;
    if (modelPath) {
      try {
        const dataURL = await thumbnailRenderer.renderThumbnail(modelPath);
        previewEl.innerHTML = `<img src="${dataURL}" alt="3D Preview" class="thumbnail-img">`;
      } catch (err) {
        previewEl.innerHTML = `<span class="asset-preview-icon">📦</span>`;
      }
    }
  });
  
  // Add event listeners
  elements.assets3dList.querySelectorAll('.edit-asset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.asset-card');
      openAssetModal('3d', parseInt(card.dataset.index));
    });
  });
  
  elements.assets3dList.querySelectorAll('.delete-asset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.asset-card');
      deleteAsset('3d', parseInt(card.dataset.index));
    });
  });
  
  // Visibility toggle listeners
  elements.assets3dList.querySelectorAll('.vis-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = e.target.closest('.asset-card');
      toggleAssetVisibility('3d', parseInt(card.dataset.index), btn.dataset.mode);
    });
  });
}

// ============================================
// Layers
// ============================================

function renderLayers(char) {
  const layers = char.layers || {};
  const layerKeys = Object.keys(layers);
  
  if (layerKeys.length === 0) {
    elements.layersList.innerHTML = `
      <div class="empty-list">
        <div class="empty-list-icon">🎭</div>
        <p>No immersive layers yet</p>
      </div>
    `;
    return;
  }
  
  // Sort by order
  layerKeys.sort((a, b) => (layers[a].order || 0) - (layers[b].order || 0));
  
  // Check how many are visible in current mode
  const visibleCount = getVisibleCount(layers, state.previewMode);
  const hiddenCount = layerKeys.length - visibleCount;
  const modeNotice = renderModeNotice(visibleCount, hiddenCount, layerKeys.length, 'layers');
  
  elements.layersList.innerHTML = modeNotice + layerKeys.map(key => {
    const layer = layers[key];
    const isVisible = isVisibleInCurrentMode(layer);
    return `
      <div class="layer-item ${!isVisible ? 'hidden-in-mode' : ''}" data-key="${key}">
        <div class="layer-order">${layer.order || 0}</div>
        <div class="layer-info">
          <div class="layer-name">${key}</div>
          <div class="layer-type">${layer.type === 'video' ? '🎬 Video' : '🖼️ Image'}</div>
          <div class="layer-path">${layer.path || 'No path'}</div>
          <div class="asset-visibility" style="margin-top: 4px;">
            ${renderVisibilityBadges(layer.visibleIn)}
          </div>
        </div>
        <div class="asset-actions">
          <button class="btn btn-small btn-secondary edit-layer-btn">Edit</button>
          <button class="btn btn-small btn-danger delete-layer-btn">×</button>
        </div>
      </div>
    `;
  }).join('');
  
  // Add event listeners
  elements.layersList.querySelectorAll('.edit-layer-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const item = e.target.closest('.layer-item');
      openAssetModal('layer', item.dataset.key);
    });
  });
  
  elements.layersList.querySelectorAll('.delete-layer-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const item = e.target.closest('.layer-item');
      deleteLayer(item.dataset.key);
    });
  });
  
  // Visibility toggle listeners
  elements.layersList.querySelectorAll('.vis-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = e.target.closest('.layer-item');
      toggleAssetVisibility('layer', item.dataset.key, btn.dataset.mode);
    });
  });
}

// ============================================
// Sounds
// ============================================

function renderSounds(char) {
  const sounds = char.sounds || {};
  const soundKeys = Object.keys(sounds);
  
  if (soundKeys.length === 0) {
    elements.soundsList.innerHTML = `
      <div class="empty-list">
        <div class="empty-list-icon">🔊</div>
        <p>No sounds configured yet</p>
      </div>
    `;
    return;
  }
  
  // Check how many are visible in current mode
  const visibleCount = getVisibleCount(sounds, state.previewMode);
  const hiddenCount = soundKeys.length - visibleCount;
  const modeNotice = renderModeNotice(visibleCount, hiddenCount, soundKeys.length, 'sounds');
  
  elements.soundsList.innerHTML = modeNotice + soundKeys.map(key => {
    const sound = sounds[key];
    const isVisible = isVisibleInCurrentMode(sound);
    return `
      <div class="sound-item ${!isVisible ? 'hidden-in-mode' : ''}" data-key="${key}">
        <div class="layer-order">🔊</div>
        <div class="sound-info">
          <div class="sound-name">${key}</div>
          <div class="sound-type">
            ${sound.loop ? '🔁 Loop' : '▶️ One-shot'} • 
            Vol: ${Math.round((sound.volume || 1) * 100)}%
          </div>
          <div class="sound-path">${sound.path || 'No path'}</div>
          <div class="asset-visibility" style="margin-top: 4px;">
            ${renderVisibilityBadges(sound.visibleIn)}
          </div>
        </div>
        <div class="asset-actions">
          <button class="btn btn-small btn-secondary edit-sound-btn">Edit</button>
          <button class="btn btn-small btn-danger delete-sound-btn">×</button>
        </div>
      </div>
    `;
  }).join('');
  
  // Add event listeners
  elements.soundsList.querySelectorAll('.edit-sound-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const item = e.target.closest('.sound-item');
      openAssetModal('sound', item.dataset.key);
    });
  });
  
  elements.soundsList.querySelectorAll('.delete-sound-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const item = e.target.closest('.sound-item');
      deleteSound(item.dataset.key);
    });
  });
  
  // Visibility toggle listeners
  elements.soundsList.querySelectorAll('.vis-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = e.target.closest('.sound-item');
      toggleAssetVisibility('sound', item.dataset.key, btn.dataset.mode);
    });
  });
}

// ============================================
// Interaction Settings
// ============================================

function renderInteractionSettings(char) {
  const interaction = char.interaction || {};
  elements.interactionProximity.value = interaction.proximityDistance || 3;
  elements.interactionSubtitleDist.value = interaction.subtitleTriggerDistance || 2.5;
}

function saveInteractionSettings() {
  const char = getSelectedCharacter();
  if (!char) return;
  
  const proximity = parseFloat(elements.interactionProximity.value);
  const subtitleDist = parseFloat(elements.interactionSubtitleDist.value);
  
  // Only save if values are non-default
  if (proximity !== 3 || subtitleDist !== 2.5) {
    char.interaction = {
      proximityDistance: proximity,
      subtitleTriggerDistance: subtitleDist
    };
  } else {
    delete char.interaction;
  }
  
  markUnsaved();
}

// ============================================
// Subtitles
// ============================================

function renderSubtitles(char) {
  const subtitles = char.subtitles || {};
  const subtitleKeys = Object.keys(subtitles);
  
  if (subtitleKeys.length === 0) {
    elements.subtitlesList.innerHTML = `
      <div class="empty-list">
        <div class="empty-list-icon">💬</div>
        <p>No subtitles configured yet</p>
        <small>Add subtitles for immersive mode dialogues</small>
      </div>
    `;
    return;
  }
  
  elements.subtitlesList.innerHTML = subtitleKeys.map(key => {
    const subtitle = subtitles[key];
    const frPreview = subtitle.fr ? subtitle.fr.substring(0, 60) + (subtitle.fr.length > 60 ? '...' : '') : '';
    return `
      <div class="subtitle-item" data-key="${key}">
        <div class="subtitle-info">
          <div class="subtitle-key">${key}</div>
          <div class="subtitle-preview">${frPreview || 'No French text'}</div>
          <div class="subtitle-langs">
            ${subtitle.fr ? '<span class="lang-badge">🇫🇷 FR</span>' : ''}
            ${subtitle.co ? '<span class="lang-badge">🏴 CO</span>' : ''}
            ${subtitle.pr ? '<span class="lang-badge">🌿 PR</span>' : ''}
          </div>
        </div>
        <div class="asset-actions">
          <button class="btn btn-small btn-secondary edit-subtitle-btn">Edit</button>
          <button class="btn btn-small btn-danger delete-subtitle-btn">×</button>
        </div>
      </div>
    `;
  }).join('');
  
  // Add event listeners
  elements.subtitlesList.querySelectorAll('.edit-subtitle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const item = e.target.closest('.subtitle-item');
      openSubtitleModal(item.dataset.key);
    });
  });
  
  elements.subtitlesList.querySelectorAll('.delete-subtitle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const item = e.target.closest('.subtitle-item');
      deleteSubtitle(item.dataset.key);
    });
  });
}

function openSubtitleModal(key = null) {
  const char = getSelectedCharacter();
  if (!char) return;
  
  const data = key ? (char.subtitles?.[key] || {}) : {};
  const title = key ? `Edit Subtitle: ${key}` : 'Add Subtitle';
  
  currentModalContext = { type: 'subtitle', key };
  
  const content = `
    <div class="form-grid">
      <div class="form-group full-width">
        <label>Subtitle Key</label>
        <input type="text" id="modal-subtitle-key" class="form-input" value="${key || ''}" placeholder="greeting, lore, farewell, etc." ${key ? 'disabled' : ''}>
        <small class="help-text">Unique identifier for this subtitle trigger</small>
      </div>
      <div class="form-group full-width">
        <label>🇫🇷 French (FR)</label>
        <textarea id="modal-subtitle-fr" class="form-textarea" rows="3" placeholder="French text...">${data.fr || ''}</textarea>
      </div>
      <div class="form-group full-width">
        <label>🏴 Corsican (CO)</label>
        <textarea id="modal-subtitle-co" class="form-textarea" rows="3" placeholder="Corsican text...">${data.co || ''}</textarea>
      </div>
      <div class="form-group full-width">
        <label>🌿 Provençal (PR)</label>
        <textarea id="modal-subtitle-pr" class="form-textarea" rows="3" placeholder="Provençal text...">${data.pr || ''}</textarea>
      </div>
    </div>
  `;
  
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = content;
  elements.assetModal.classList.add('active');
}

function saveSubtitle(char, existingKey) {
  if (!char.subtitles) char.subtitles = {};
  
  const keyInput = document.getElementById('modal-subtitle-key');
  const key = existingKey || keyInput.value;
  
  if (!key) {
    showToast('Subtitle key is required', 'error');
    return;
  }
  
  const subtitle = {};
  const fr = document.getElementById('modal-subtitle-fr').value.trim();
  const co = document.getElementById('modal-subtitle-co').value.trim();
  const pr = document.getElementById('modal-subtitle-pr').value.trim();
  
  if (fr) subtitle.fr = fr;
  if (co) subtitle.co = co;
  if (pr) subtitle.pr = pr;
  
  if (Object.keys(subtitle).length === 0) {
    showToast('At least one language is required', 'error');
    return;
  }
  
  char.subtitles[key] = subtitle;
}

function deleteSubtitle(key) {
  const char = getSelectedCharacter();
  if (!char || !char.subtitles) return;
  
  if (confirm(`Delete subtitle "${key}"?`)) {
    delete char.subtitles[key];
    if (Object.keys(char.subtitles).length === 0) {
      delete char.subtitles;
    }
    markUnsaved();
    renderSubtitles(char);
    showToast('Subtitle deleted', 'info');
  }
}

// ============================================
// Visibility Helpers
// ============================================

function renderVisibilityBadges(visibleIn) {
  const visibility = visibleIn || state.settings.defaultVisibility || ['scan', 'immersive'];
  const scanActive = visibility.includes('scan');
  const immersiveActive = visibility.includes('immersive');
  const isDisabled = !scanActive && !immersiveActive;
  
  // Inline toggle buttons for quick mode switching
  return `
    <div class="visibility-toggles ${isDisabled ? 'all-disabled' : ''}">
      <button class="vis-toggle ${scanActive ? 'active' : ''}" data-mode="scan" title="Toggle Scan mode">
        📱
      </button>
      <button class="vis-toggle ${immersiveActive ? 'active' : ''}" data-mode="immersive" title="Toggle Immersive mode">
        🥽
      </button>
      ${isDisabled ? '<span class="disabled-label">🚫</span>' : ''}
    </div>
  `;
}

/**
 * Toggle visibility mode for an asset and save immediately
 */
function toggleAssetVisibility(assetType, key, mode) {
  const char = getSelectedCharacter();
  if (!char) return;
  
  let asset;
  const defaultVisibility = state.settings.defaultVisibility || ['scan', 'immersive'];
  
  // Get the asset
  if (assetType === '2d' || assetType === '3d') {
    asset = char.assets?.[assetType]?.[key];
  } else if (assetType === 'layer') {
    asset = char.layers?.[key];
  } else if (assetType === 'sound') {
    asset = char.sounds?.[key];
  }
  
  if (!asset) return;
  
  // Initialize visibleIn if not set
  if (!asset.visibleIn) {
    asset.visibleIn = [...defaultVisibility];
  }
  
  // Toggle the mode
  const index = asset.visibleIn.indexOf(mode);
  if (index > -1) {
    // Remove the mode (allow empty array for fully disabled assets)
    asset.visibleIn.splice(index, 1);
  } else {
    asset.visibleIn.push(mode);
  }
  
  markUnsaved();
  
  // Re-render the appropriate list
  if (assetType === '2d') render2DAssets(char);
  else if (assetType === '3d') render3DAssets(char);
  else if (assetType === 'layer') renderLayers(char);
  else if (assetType === 'sound') renderSounds(char);
  
  updatePreviewInfo(char);
}

/**
 * Check if an asset is visible in the current preview mode
 */
function isVisibleInCurrentMode(asset) {
  const defaultVisibility = state.settings.defaultVisibility || ['scan', 'immersive'];
  const visibility = asset.visibleIn || defaultVisibility;
  return visibility.includes(state.previewMode);
}

/**
 * Get count of visible assets for the current mode
 */
function getVisibleCount(assets, mode) {
  if (!assets) return 0;
  const defaultVisibility = state.settings.defaultVisibility || ['scan', 'immersive'];
  
  if (Array.isArray(assets)) {
    return assets.filter(a => {
      const vis = a.visibleIn || defaultVisibility;
      return vis.includes(mode);
    }).length;
  } else {
    // Object (layers/sounds)
    return Object.values(assets).filter(a => {
      const vis = a.visibleIn || defaultVisibility;
      return vis.includes(mode);
    }).length;
  }
}

/**
 * Render a notice banner when viewing a mode where some/all assets are hidden
 */
function renderModeNotice(visibleCount, hiddenCount, totalCount, assetType) {
  if (hiddenCount === 0) return '';
  
  const modeLabel = state.previewMode === 'scan' ? '📱 Scan' : '🥽 Immersive';
  const otherMode = state.previewMode === 'scan' ? '🥽 Immersive' : '📱 Scan';
  
  if (visibleCount === 0) {
    // All assets are in the other mode
    return `
      <div class="mode-notice mode-notice-info">
        <span class="mode-notice-icon">ℹ️</span>
        <span>All ${totalCount} ${assetType} are configured for <strong>${otherMode}</strong> mode only. They will appear in game but not in ${modeLabel} preview.</span>
      </div>
    `;
  } else {
    // Some assets hidden
    return `
      <div class="mode-notice mode-notice-subtle">
        <span>${visibleCount} visible in ${modeLabel}, ${hiddenCount} only in ${otherMode}</span>
      </div>
    `;
  }
}

// ============================================
// Asset Modal
// ============================================

let currentModalContext = { type: null, key: null };

function openAssetModal(type, key = null) {
  currentModalContext = { type, key };
  const char = getSelectedCharacter();
  if (!char) return;
  
  let title = '';
  let content = '';
  let data = {};
  
  switch (type) {
    case '2d':
      title = key !== null ? 'Edit 2D Asset' : 'Add 2D Asset';
      data = key !== null ? (char.assets?.['2d']?.[key] || {}) : {};
      content = render2DAssetForm(data);
      break;
    case '3d':
      title = key !== null ? 'Edit 3D Model' : 'Add 3D Model';
      data = key !== null ? (char.assets?.['3d']?.[key] || {}) : {};
      content = render3DAssetForm(data);
      break;
    case 'layer':
      title = key !== null ? `Edit Layer: ${key}` : 'Add Layer';
      data = key !== null ? (char.layers?.[key] || {}) : {};
      content = renderLayerForm(data, key);
      break;
    case 'sound':
      title = key !== null ? `Edit Sound: ${key}` : 'Add Sound';
      data = key !== null ? (char.sounds?.[key] || {}) : {};
      content = renderSoundForm(data, key);
      break;
  }
  
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = content;
  elements.assetModal.classList.add('active');
}

function closeAssetModal() {
  elements.assetModal.classList.remove('active');
  elements.assetModal.style.zIndex = '';
  currentModalContext = { type: null, key: null };
}

function render2DAssetForm(data) {
  const visibility = data.visibleIn || state.settings.defaultVisibility || ['scan', 'immersive'];
  
  return `
    <div class="form-grid">
      <div class="form-group">
        <label>Asset ID</label>
        <input type="text" id="modal-asset-id" class="form-input" value="${data.id || ''}" placeholder="background, character, etc.">
      </div>
      <div class="form-group">
        <label>Image Path</label>
        <input type="text" id="modal-asset-path" class="form-input" value="${data.path || ''}" placeholder="assets/img/...">
      </div>
      <div class="form-group">
        <label>Scale</label>
        <input type="number" id="modal-asset-scale" class="form-input" value="${data.scale || 1}" step="0.1">
      </div>
      <div class="form-group">
        <label>Opacity</label>
        <input type="number" id="modal-asset-opacity" class="form-input" value="${data.opacity !== undefined ? data.opacity : 1}" min="0" max="1" step="0.1">
      </div>
      <div class="form-group full-width">
        <label>Position (X, Y, Z)</label>
        <div class="position-editor">
          <div class="position-field">
            <label>X</label>
            <input type="number" id="modal-pos-x" class="form-input" value="${data.position?.x || 0}" step="0.1">
          </div>
          <div class="position-field">
            <label>Y</label>
            <input type="number" id="modal-pos-y" class="form-input" value="${data.position?.y || 0}" step="0.1">
          </div>
          <div class="position-field">
            <label>Z</label>
            <input type="number" id="modal-pos-z" class="form-input" value="${data.position?.z || 0}" step="0.1">
          </div>
        </div>
      </div>
      <div class="form-group full-width">
        <label>Rotation (X, Y, Z)</label>
        <div class="position-editor">
          <div class="position-field">
            <label>X</label>
            <input type="number" id="modal-rot-x" class="form-input" value="${data.rotation?.x || 0}" step="0.1">
          </div>
          <div class="position-field">
            <label>Y</label>
            <input type="number" id="modal-rot-y" class="form-input" value="${data.rotation?.y || 0}" step="0.1">
          </div>
          <div class="position-field">
            <label>Z</label>
            <input type="number" id="modal-rot-z" class="form-input" value="${data.rotation?.z || 0}" step="0.1">
          </div>
        </div>
      </div>
      <div class="form-group full-width">
        <label>Visible In</label>
        <div class="toggle-group">
          <label class="toggle-item">
            <input type="checkbox" id="modal-vis-scan" class="toggle-checkbox" ${visibility.includes('scan') ? 'checked' : ''}>
            <span class="toggle-label">📱 Scan Mode</span>
          </label>
          <label class="toggle-item">
            <input type="checkbox" id="modal-vis-immersive" class="toggle-checkbox" ${visibility.includes('immersive') ? 'checked' : ''}>
            <span class="toggle-label">🥽 Immersive Mode</span>
          </label>
        </div>
      </div>
    </div>
  `;
}

function render3DAssetForm(data) {
  const visibility = data.visibleIn || state.settings.defaultVisibility || ['scan', 'immersive'];
  const scale = data.scale || { x: 0.1, y: 0.1, z: 0.1 };
  
  return `
    <div class="form-grid">
      <div class="form-group">
        <label>Model ID</label>
        <input type="text" id="modal-asset-id" class="form-input" value="${data.id || ''}" placeholder="model_name">
      </div>
      <div class="form-group">
        <label>Model Path (.glb/.gltf)</label>
        <input type="text" id="modal-asset-path" class="form-input" value="${data.path || ''}" placeholder="assets/models/...">
      </div>
      <div class="form-group full-width">
        <label>Scale (X, Y, Z)</label>
        <div class="position-editor">
          <div class="position-field">
            <label>X</label>
            <input type="number" id="modal-scale-x" class="form-input" value="${scale.x || 0.1}" step="0.01">
          </div>
          <div class="position-field">
            <label>Y</label>
            <input type="number" id="modal-scale-y" class="form-input" value="${scale.y || 0.1}" step="0.01">
          </div>
          <div class="position-field">
            <label>Z</label>
            <input type="number" id="modal-scale-z" class="form-input" value="${scale.z || 0.1}" step="0.01">
          </div>
        </div>
      </div>
      <div class="form-group full-width">
        <label>Position (X, Y, Z)</label>
        <div class="position-editor">
          <div class="position-field">
            <label>X</label>
            <input type="number" id="modal-pos-x" class="form-input" value="${data.position?.x || 0}" step="0.1">
          </div>
          <div class="position-field">
            <label>Y</label>
            <input type="number" id="modal-pos-y" class="form-input" value="${data.position?.y || 0}" step="0.1">
          </div>
          <div class="position-field">
            <label>Z</label>
            <input type="number" id="modal-pos-z" class="form-input" value="${data.position?.z || 0}" step="0.1">
          </div>
        </div>
      </div>
      <div class="form-group">
        <label>Animation Clip Name</label>
        <input type="text" id="modal-anim-clip" class="form-input" value="${data.animation?.clipName || ''}" placeholder="Optional">
      </div>
      <div class="form-group">
        <label>Loop Animation</label>
        <select id="modal-anim-loop" class="form-input">
          <option value="true" ${data.animation?.loop !== false ? 'selected' : ''}>Yes</option>
          <option value="false" ${data.animation?.loop === false ? 'selected' : ''}>No</option>
        </select>
      </div>
      <div class="form-group full-width">
        <label>Visible In</label>
        <div class="toggle-group">
          <label class="toggle-item">
            <input type="checkbox" id="modal-vis-scan" class="toggle-checkbox" ${visibility.includes('scan') ? 'checked' : ''}>
            <span class="toggle-label">📱 Scan Mode</span>
          </label>
          <label class="toggle-item">
            <input type="checkbox" id="modal-vis-immersive" class="toggle-checkbox" ${visibility.includes('immersive') ? 'checked' : ''}>
            <span class="toggle-label">🥽 Immersive Mode</span>
          </label>
        </div>
      </div>
    </div>
  `;
}

function renderLayerForm(data, key) {
  const visibility = data.visibleIn || state.settings.defaultVisibility || ['scan', 'immersive'];
  const isVideo = data.type === 'video';
  
  return `
    <div class="form-grid">
      <div class="form-group">
        <label>Layer Key</label>
        <input type="text" id="modal-layer-key" class="form-input" value="${key || ''}" placeholder="background, character, etc." ${key ? 'disabled' : ''}>
      </div>
      <div class="form-group">
        <label>Type</label>
        <select id="modal-layer-type" class="form-input">
          <option value="image" ${!isVideo ? 'selected' : ''}>🖼️ Image</option>
          <option value="video" ${isVideo ? 'selected' : ''}>🎬 Video</option>
        </select>
      </div>
      <div class="form-group full-width">
        <label>File Path</label>
        <input type="text" id="modal-asset-path" class="form-input" value="${data.path || ''}" placeholder="assets/img/... or assets/video/...">
      </div>
      <div class="form-group">
        <label>Scale</label>
        <input type="number" id="modal-layer-scale" class="form-input" value="${data.scale || 2}" step="0.5">
      </div>
      <div class="form-group">
        <label>Order (0 = back)</label>
        <input type="number" id="modal-layer-order" class="form-input" value="${data.order || 0}" step="0.5">
      </div>
      <div class="form-group full-width">
        <label>Position (X, Y, Z)</label>
        <div class="position-editor">
          <div class="position-field">
            <label>X</label>
            <input type="number" id="modal-pos-x" class="form-input" value="${data.position?.x || 0}" step="0.5">
          </div>
          <div class="position-field">
            <label>Y</label>
            <input type="number" id="modal-pos-y" class="form-input" value="${data.position?.y || 0}" step="0.5">
          </div>
          <div class="position-field">
            <label>Z</label>
            <input type="number" id="modal-pos-z" class="form-input" value="${data.position?.z || -5}" step="0.5">
          </div>
        </div>
      </div>
      <div class="form-group">
        <label>Scale X (stretch)</label>
        <input type="number" id="modal-layer-scalex" class="form-input" value="${data.scaleX || 1}" step="0.1">
      </div>
      
      <!-- Video-specific options -->
      <div id="video-options" style="display: ${isVideo ? 'contents' : 'none'}">
        <div class="form-group full-width">
          <label>Chroma Key Color (for green screen)</label>
          <div class="color-input-wrapper">
            <input type="color" id="modal-chroma-color" class="color-picker" value="${data.chromaKey || '#00FF00'}">
            <input type="text" id="modal-chroma-text" class="form-input color-text" value="${data.chromaKey || ''}">
          </div>
        </div>
        <div class="form-group">
          <label>Tolerance</label>
          <input type="number" id="modal-chroma-tolerance" class="form-input" value="${data.tolerance || 0.4}" min="0" max="1" step="0.05">
        </div>
        <div class="form-group">
          <label>Smoothness</label>
          <input type="number" id="modal-chroma-smoothness" class="form-input" value="${data.smoothness || 0.08}" min="0" max="1" step="0.01">
        </div>
        <div class="form-group">
          <label>Spill Reduction</label>
          <input type="number" id="modal-chroma-spill" class="form-input" value="${data.spill || 0.5}" min="0" max="1" step="0.05">
        </div>
        <div class="form-group">
          <label>Loop Video</label>
          <select id="modal-video-loop" class="form-input">
            <option value="true" ${data.loop !== false ? 'selected' : ''}>Yes</option>
            <option value="false" ${data.loop === false ? 'selected' : ''}>No</option>
          </select>
        </div>
        <div class="form-group">
          <label>Muted</label>
          <select id="modal-video-muted" class="form-input">
            <option value="true" ${data.muted !== false ? 'selected' : ''}>Yes</option>
            <option value="false" ${data.muted === false ? 'selected' : ''}>No</option>
          </select>
        </div>
      </div>
      
      <div class="form-group full-width">
        <label>Visible In</label>
        <div class="toggle-group">
          <label class="toggle-item">
            <input type="checkbox" id="modal-vis-scan" class="toggle-checkbox" ${visibility.includes('scan') ? 'checked' : ''}>
            <span class="toggle-label">📱 Scan Mode</span>
          </label>
          <label class="toggle-item">
            <input type="checkbox" id="modal-vis-immersive" class="toggle-checkbox" ${visibility.includes('immersive') ? 'checked' : ''}>
            <span class="toggle-label">🥽 Immersive Mode</span>
          </label>
        </div>
      </div>
    </div>
  `;
}

function renderSoundForm(data, key) {
  const visibility = data.visibleIn || state.settings.defaultVisibility || ['scan', 'immersive'];
  
  return `
    <div class="form-grid">
      <div class="form-group">
        <label>Sound Key</label>
        <input type="text" id="modal-sound-key" class="form-input" value="${key || ''}" placeholder="ambient, intro, etc." ${key ? 'disabled' : ''}>
      </div>
      <div class="form-group">
        <label>Audio Path</label>
        <input type="text" id="modal-asset-path" class="form-input" value="${data.path || ''}" placeholder="assets/sound/...">
      </div>
      <div class="form-group">
        <label>Volume (0-1)</label>
        <input type="number" id="modal-sound-volume" class="form-input" value="${data.volume || 0.7}" min="0" max="1" step="0.1">
      </div>
      <div class="form-group">
        <label>Loop</label>
        <select id="modal-sound-loop" class="form-input">
          <option value="true" ${data.loop ? 'selected' : ''}>Yes</option>
          <option value="false" ${!data.loop ? 'selected' : ''}>No</option>
        </select>
      </div>
      
      <!-- Spatial audio options -->
      <div class="form-group full-width" style="margin-top: var(--spacing-md);">
        <label style="font-weight: 600;">Spatial Audio (Immersive Mode)</label>
      </div>
      <div class="form-group">
        <label>Ref Distance</label>
        <input type="number" id="modal-sound-refdist" class="form-input" value="${data.refDistance || 2}" min="0" step="0.5">
      </div>
      <div class="form-group">
        <label>Rolloff Factor</label>
        <input type="number" id="modal-sound-rolloff" class="form-input" value="${data.rolloffFactor || 1.5}" min="0" step="0.1">
      </div>
      <div class="form-group">
        <label>Max Distance</label>
        <input type="number" id="modal-sound-maxdist" class="form-input" value="${data.maxDistance || 15}" min="0">
      </div>
      
      <div class="form-group full-width">
        <label>Visible In</label>
        <div class="toggle-group">
          <label class="toggle-item">
            <input type="checkbox" id="modal-vis-scan" class="toggle-checkbox" ${visibility.includes('scan') ? 'checked' : ''}>
            <span class="toggle-label">📱 Scan Mode</span>
          </label>
          <label class="toggle-item">
            <input type="checkbox" id="modal-vis-immersive" class="toggle-checkbox" ${visibility.includes('immersive') ? 'checked' : ''}>
            <span class="toggle-label">🥽 Immersive Mode</span>
          </label>
        </div>
      </div>
    </div>
  `;
}

function saveAssetFromModal() {
  const char = getSelectedCharacter();
  if (!char) return;
  
  const { type, key } = currentModalContext;
  
  // Get visibility
  const visibleIn = [];
  if (document.getElementById('modal-vis-scan')?.checked) visibleIn.push('scan');
  if (document.getElementById('modal-vis-immersive')?.checked) visibleIn.push('immersive');
  
  switch (type) {
    case '2d':
      save2DAsset(char, key, visibleIn);
      break;
    case '3d':
      save3DAsset(char, key, visibleIn);
      break;
    case 'layer':
      saveLayer(char, key, visibleIn);
      break;
    case 'sound':
      saveSound(char, key, visibleIn);
      break;
    case 'subtitle':
      saveSubtitle(char, key);
      break;
  }
  
  markUnsaved();
  closeAssetModal();
  populateEditor(char);
  showToast('Asset saved', 'success');

  // Refresh preview if open
  const previewModal = document.getElementById('preview-modal');
  if (previewModal && previewModal.classList.contains('active')) {
    loadPreviewAssets(char);
  }
}

/**
 * Open asset modal from preview panel — brings modal on top of preview
 */
function openAssetModalFromPreview(type) {
  openAssetModal(type, null);
  // Ensure the modal is above the preview
  elements.assetModal.style.zIndex = '20000';
}


function save2DAsset(char, index, visibleIn) {
  if (!char.assets) char.assets = {};
  if (!char.assets['2d']) char.assets['2d'] = [];
  
  const asset = {
    id: document.getElementById('modal-asset-id').value,
    path: document.getElementById('modal-asset-path').value,
    scale: parseFloat(document.getElementById('modal-asset-scale').value) || 1,
    opacity: parseFloat(document.getElementById('modal-asset-opacity').value) || 1,
    position: {
      x: parseFloat(document.getElementById('modal-pos-x').value) || 0,
      y: parseFloat(document.getElementById('modal-pos-y').value) || 0,
      z: parseFloat(document.getElementById('modal-pos-z').value) || 0
    },
    rotation: {
      x: parseFloat(document.getElementById('modal-rot-x').value) || 0,
      y: parseFloat(document.getElementById('modal-rot-y').value) || 0,
      z: parseFloat(document.getElementById('modal-rot-z').value) || 0
    },
    visibleIn
  };
  
  if (index !== null) {
    char.assets['2d'][index] = asset;
  } else {
    char.assets['2d'].push(asset);
  }
}

function save3DAsset(char, index, visibleIn) {
  if (!char.assets) char.assets = {};
  if (!char.assets['3d']) char.assets['3d'] = [];
  
  const asset = {
    id: document.getElementById('modal-asset-id').value,
    path: document.getElementById('modal-asset-path').value,
    scale: {
      x: parseFloat(document.getElementById('modal-scale-x').value) || 0.1,
      y: parseFloat(document.getElementById('modal-scale-y').value) || 0.1,
      z: parseFloat(document.getElementById('modal-scale-z').value) || 0.1
    },
    position: {
      x: parseFloat(document.getElementById('modal-pos-x').value) || 0,
      y: parseFloat(document.getElementById('modal-pos-y').value) || 0,
      z: parseFloat(document.getElementById('modal-pos-z').value) || 0
    },
    visibleIn
  };
  
  const clipName = document.getElementById('modal-anim-clip').value;
  if (clipName) {
    asset.animation = {
      clipName,
      loop: document.getElementById('modal-anim-loop').value === 'true'
    };
  }
  
  if (index !== null) {
    char.assets['3d'][index] = asset;
  } else {
    char.assets['3d'].push(asset);
  }
}

function saveLayer(char, existingKey, visibleIn) {
  if (!char.layers) char.layers = {};
  
  const keyInput = document.getElementById('modal-layer-key');
  const key = existingKey || keyInput.value;
  
  if (!key) {
    showToast('Layer key is required', 'error');
    return;
  }
  
  const isVideo = document.getElementById('modal-layer-type').value === 'video';
  
  const layer = {
    path: document.getElementById('modal-asset-path').value,
    scale: parseFloat(document.getElementById('modal-layer-scale').value) || 2,
    order: parseFloat(document.getElementById('modal-layer-order').value) || 0,
    position: {
      x: parseFloat(document.getElementById('modal-pos-x').value) || 0,
      y: parseFloat(document.getElementById('modal-pos-y').value) || 0,
      z: parseFloat(document.getElementById('modal-pos-z').value) || -5
    },
    visibleIn
  };
  
  const scaleX = parseFloat(document.getElementById('modal-layer-scalex').value);
  if (scaleX && scaleX !== 1) {
    layer.scaleX = scaleX;
  }
  
  if (isVideo) {
    layer.type = 'video';
    const chromaKey = document.getElementById('modal-chroma-text').value;
    if (chromaKey) {
      layer.chromaKey = chromaKey;
      layer.tolerance = parseFloat(document.getElementById('modal-chroma-tolerance').value) || 0.4;
      layer.smoothness = parseFloat(document.getElementById('modal-chroma-smoothness').value) || 0.08;
      layer.spill = parseFloat(document.getElementById('modal-chroma-spill').value) || 0.5;
    }
    layer.loop = document.getElementById('modal-video-loop').value === 'true';
    layer.muted = document.getElementById('modal-video-muted').value === 'true';
  }
  
  char.layers[key] = layer;
}

function saveSound(char, existingKey, visibleIn) {
  if (!char.sounds) char.sounds = {};
  
  const keyInput = document.getElementById('modal-sound-key');
  const key = existingKey || keyInput.value;
  
  if (!key) {
    showToast('Sound key is required', 'error');
    return;
  }
  
  const sound = {
    path: document.getElementById('modal-asset-path').value,
    volume: parseFloat(document.getElementById('modal-sound-volume').value) || 0.7,
    loop: document.getElementById('modal-sound-loop').value === 'true',
    visibleIn
  };
  
  // Add spatial audio options if they have non-default values
  const refDistance = parseFloat(document.getElementById('modal-sound-refdist').value);
  const rolloffFactor = parseFloat(document.getElementById('modal-sound-rolloff').value);
  const maxDistance = parseFloat(document.getElementById('modal-sound-maxdist').value);
  
  if (refDistance) sound.refDistance = refDistance;
  if (rolloffFactor) sound.rolloffFactor = rolloffFactor;
  if (maxDistance) sound.maxDistance = maxDistance;
  
  char.sounds[key] = sound;
}

// ============================================
// Delete Operations
// ============================================

function deleteAsset(type, index) {
  const char = getSelectedCharacter();
  if (!char || !char.assets?.[type]) return;
  
  if (!confirm('Delete this asset?')) return;
  
  char.assets[type].splice(index, 1);
  markUnsaved();
  
  if (type === '2d') render2DAssets(char);
  else render3DAssets(char);
  
  updatePreviewInfo(char);
  showToast('Asset deleted', 'success');
}

function deleteLayer(key) {
  const char = getSelectedCharacter();
  if (!char || !char.layers?.[key]) return;
  
  if (!confirm(`Delete layer "${key}"?`)) return;
  
  delete char.layers[key];
  markUnsaved();
  renderLayers(char);
  updatePreviewInfo(char);
  showToast('Layer deleted', 'success');
}

function deleteSound(key) {
  const char = getSelectedCharacter();
  if (!char || !char.sounds?.[key]) return;
  
  if (!confirm(`Delete sound "${key}"?`)) return;
  
  delete char.sounds[key];
  markUnsaved();
  renderSounds(char);
  updatePreviewInfo(char);
  showToast('Sound deleted', 'success');
}

// ============================================
// Character Operations
// ============================================

function addNewCharacter() {
  const id = 'character_' + Date.now();
  const newChar = {
    id,
    name: 'New Character',
    description: '',
    region: 'CORSE',
    themeColor: '#6366F1',
    portrait: 'assets/img/characters/placeholder_char.png',
    assets: { '2d': [], '3d': [] },
    layers: {},
    sounds: {}
  };
  
  state.characters.push(newChar);
  markUnsaved();
  renderCharacterList();
  selectCharacter(id);
  showToast('Character created', 'success');
}

function deleteSelectedCharacter() {
  const char = getSelectedCharacter();
  if (!char) return;
  
  if (!confirm(`Delete "${char.name}"? This cannot be undone.`)) return;
  
  const index = state.characters.findIndex(c => c.id === char.id);
  if (index > -1) {
    state.characters.splice(index, 1);
    state.selectedCharacterId = null;
    markUnsaved();
    
    elements.emptyState.style.display = 'flex';
    elements.editorContainer.style.display = 'none';
    renderCharacterList();
    showToast('Character deleted', 'success');
  }
}

// ============================================
// Tabs
// ============================================

function switchTab(tabId) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
  document.getElementById('tab-' + tabId).classList.add('active');
}

// ============================================
// Preview
// ============================================

function setPreviewMode(mode) {
  state.previewMode = mode;
  document.querySelectorAll('.mode-btn-inline').forEach(b => b.classList.remove('active'));
  document.querySelectorAll(`.mode-btn-inline[data-mode="${mode}"]`).forEach(btn => btn.classList.add('active'));

  // Re-render asset lists to show filtered results
  const char = getSelectedCharacter();
  if (char) {
    render2DAssets(char);
    render3DAssets(char);
    renderLayers(char);
    renderSounds(char);
  }
}

function updatePreviewInfo(char) {
  document.getElementById('info-2d-count').textContent = char.assets?.['2d']?.length || 0;
  document.getElementById('info-3d-count').textContent = char.assets?.['3d']?.length || 0;
  document.getElementById('info-layers-count').textContent = Object.keys(char.layers || {}).length;
  document.getElementById('info-sounds-count').textContent = Object.keys(char.sounds || {}).length;
  document.getElementById('info-subtitles-count').textContent = Object.keys(char.subtitles || {}).length;
}

// ============================================
// Import / Export
// ============================================

function showImportModal() {
  document.getElementById('import-textarea').value = '';
  document.getElementById('import-file').value = '';
  elements.importModal.classList.add('active');
}

function closeImportModal() {
  elements.importModal.classList.remove('active');
}

function handleFileImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    document.getElementById('import-textarea').value = event.target.result;
  };
  reader.readAsText(file);
}

function confirmImport() {
  const jsonText = document.getElementById('import-textarea').value;
  
  try {
    const data = JSON.parse(jsonText);
    
    if (!data.characters || !Array.isArray(data.characters)) {
      throw new Error('Invalid format: missing characters array');
    }
    
    loadData(data);
    closeImportModal();
    markUnsaved();
    showToast('Data imported successfully', 'success');
    
  } catch (error) {
    showToast('Invalid JSON: ' + error.message, 'error');
  }
}

function exportJSON() {
  const data = {
    version: state.data?.version || '1.1',
    settings: state.settings,
    characters: state.characters
  };
  
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'characters.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  // Clear localStorage since user is explicitly saving
  localStorage.removeItem(LOCALSTORAGE_KEY);
  state.unsavedChanges = false;
  showToast('JSON exported - replace your characters.json file', 'success');
}

/**
 * Auto-save changes to the server (with localStorage fallback)
 */
async function autoSave() {
  if (!state.unsavedChanges) return;
  
  const statusEl = document.getElementById('save-status');
  if (statusEl) statusEl.textContent = '⚙️ Saving...';
  
  const data = {
    version: state.data?.version || '1.1',
    settings: state.settings,
    characters: state.characters
  };
  
  // Always save to localStorage as backup
  const localData = { ...data, _savedAt: new Date().toISOString() };
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(localData));
  
  try {
    const response = await fetch('/api/save-characters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      state.unsavedChanges = false;
      // Clear localStorage since server save succeeded
      localStorage.removeItem(LOCALSTORAGE_KEY);
      if (statusEl) {
        statusEl.textContent = '✅ Saved';
        setTimeout(() => { statusEl.textContent = ''; }, 2000);
      }
    } else {
      throw new Error('Server error');
    }
  } catch (error) {
    // Server not available (GitHub Pages) - localStorage already saved
    console.log('Server save unavailable, using localStorage');
    state.unsavedChanges = false;
    if (statusEl) {
      statusEl.textContent = '💾 Local';
      setTimeout(() => { statusEl.textContent = ''; }, 2000);
    }
  }
}

/**
 * Clear localStorage data (useful for resetting)
 */
function clearLocalStorage() {
  if (confirm('Clear all local edits? This will reload data from the original file.')) {
    localStorage.removeItem(LOCALSTORAGE_KEY);
    location.reload();
  }
}

/**
 * Immediate save triggered by Save button
 */
async function saveNow() {
  state.unsavedChanges = true; // force save even if already synced
  const btn = document.getElementById('save-btn');
  if (btn) btn.querySelector('.btn-text').textContent = ' Saving...';
  await autoSave();
  if (btn) {
    btn.querySelector('.btn-text').textContent = ' Saved!';
    setTimeout(() => { btn.querySelector('.btn-text').textContent = ' Save'; }, 2000);
  }
}

// Debounced auto-save (saves 1 second after last change)
const debouncedAutoSave = debounce(autoSave, 1000);

// ============================================
// Toast Notifications
// ============================================

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  toast.innerHTML = `<span>${icons[type] || icons.info}</span> ${message}`;
  elements.toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================
// Utilities
// ============================================

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ============================================
// Mobile Navigation
// ============================================

function setupMobileNav() {
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const mobileOverlay = document.getElementById('mobile-overlay');
  const sidebar = document.querySelector('.sidebar');
  
  if (!sidebarToggle || !sidebar) return;
  
  // Toggle sidebar
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    if (mobileOverlay) {
      mobileOverlay.classList.toggle('active');
    }
  });
  
  // Close sidebar when clicking overlay
  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', () => {
      closeMobileSidebar();
    });
  }
  
  // Close sidebar when selecting a character on mobile
  const originalSelectCharacter = selectCharacter;
  selectCharacter = function(id) {
    originalSelectCharacter(id);
    if (window.innerWidth <= 768) {
      closeMobileSidebar();
    }
  };
}

function closeMobileSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const mobileOverlay = document.getElementById('mobile-overlay');
  
  if (sidebar) sidebar.classList.remove('open');
  if (mobileOverlay) mobileOverlay.classList.remove('active');
}

// ============================================
// Layer Type Toggle (for modal)
// ============================================

document.addEventListener('change', (e) => {
  if (e.target.id === 'modal-layer-type') {
    const videoOptions = document.getElementById('video-options');
    if (videoOptions) {
      videoOptions.style.display = e.target.value === 'video' ? 'contents' : 'none';
    }
  }
  
  // Sync chroma color inputs
  if (e.target.id === 'modal-chroma-color') {
    const textInput = document.getElementById('modal-chroma-text');
    if (textInput) textInput.value = e.target.value;
  }
  if (e.target.id === 'modal-chroma-text') {
    const colorInput = document.getElementById('modal-chroma-color');
    if (colorInput && /^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
      colorInput.value = e.target.value;
    }
  }
});

// ============================================
// 3D Preview System
// ============================================

const preview = {
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  animationId: null,
  meshes: [],
  videos: [],
  audios: [],
  mixers: [],
  clock: null,
  animationData: {},
  sceneGroup: null,
  mode: 'scan'
};

// ============================================
// 3D Model Thumbnail Renderer
// ============================================
const thumbnailRenderer = {
  renderer: null,
  scene: null,
  camera: null,
  gltfLoader: null,
  
  init() {
    if (this.renderer) return; // Already initialized
    
    // Create off-screen renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      preserveDrawingBuffer: true 
    });
    this.renderer.setSize(120, 120);
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x1a1812, 1);
    
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x252218);
    
    // Camera for thumbnail view
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    this.camera.position.set(2, 1.5, 2);
    this.camera.lookAt(0, 0.5, 0);
    
    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambient);
    
    const directional = new THREE.DirectionalLight(0xffffff, 0.6);
    directional.position.set(3, 3, 3);
    this.scene.add(directional);
    
    // GLTF Loader
    this.gltfLoader = new THREE.GLTFLoader();
  },
  
  async renderThumbnail(modelPath) {
    this.init();
    
    return new Promise((resolve, reject) => {
      // Clear previous model with proper disposal
      const toRemove = [];
      this.scene.traverse(child => {
        if (child.userData.isModel || (child.parent && child.parent.userData.isModel)) {
          toRemove.push(child);
        }
      });
      toRemove.forEach(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
        this.scene.remove(obj);
      });
      
      // Load new model
      this.gltfLoader.load(
        modelPath,
        (gltf) => {
          const model = gltf.scene;
          model.userData.isModel = true;
          
          // Mark all children as part of the model for cleanup
          model.traverse(child => {
            child.userData.isModel = true;
          });
          
          // Center and fit model
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          
          // Scale to fit in view
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = maxDim > 0 ? 1.5 / maxDim : 1;
          model.scale.setScalar(scale);
          
          // Center model
          model.position.sub(center.multiplyScalar(scale));
          model.position.y += (size.y * scale) / 2;
          
          this.scene.add(model);
          
          // Render
          this.renderer.render(this.scene, this.camera);
          
          // Get data URL
          const dataURL = this.renderer.domElement.toDataURL('image/png');
          
          // Clean up model and dispose resources
          model.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(m => m.dispose());
              } else {
                child.material.dispose();
              }
            }
          });
          this.scene.remove(model);
          
          resolve(dataURL);
        },
        undefined,
        (error) => {
          console.error('Thumbnail load error:', error);
          reject(error);
        }
      );
    });
  }
};

// Chroma key shader for green screen removal in preview
const ChromaKeyShader = {
  uniforms: {
    tDiffuse: { value: null },
    keyColor: { value: new THREE.Color(0x00ff00) },
    similarity: { value: 0.4 },
    smoothness: { value: 0.08 },
    spill: { value: 0.1 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec3 keyColor;
    uniform float similarity;
    uniform float smoothness;
    uniform float spill;
    varying vec2 vUv;
    
    vec2 RGBtoUV(vec3 rgb) {
      return vec2(
        rgb.r * -0.169 + rgb.g * -0.331 + rgb.b * 0.5 + 0.5,
        rgb.r * 0.5 + rgb.g * -0.419 + rgb.b * -0.081 + 0.5
      );
    }
    
    void main() {
      vec4 texColor = texture2D(tDiffuse, vUv);
      float chromaDist = distance(RGBtoUV(texColor.rgb), RGBtoUV(keyColor));
      float alpha = smoothstep(similarity, similarity + smoothness, chromaDist);
      float convergence = abs(texColor.g - mix(texColor.r, texColor.b, 0.5));
      float spillMask = smoothstep(0.0, spill, convergence);
      texColor.g = mix(texColor.g, mix(texColor.r, texColor.b, 0.5), (1.0 - spillMask) * 0.5);
      gl_FragColor = vec4(texColor.rgb, texColor.a * alpha);
    }
  `
};

function openPreview() {
  const char = getSelectedCharacter();
  if (!char) {
    showToast('Select a character first', 'warning');
    return;
  }
  
  const modal = document.getElementById('preview-modal');
  modal.classList.add('active');
  
  // Set mode to match editor
  const currentMode = state.previewMode || 'scan';
  preview.mode = currentMode;
  preview.cameraInitialized = false;
  document.querySelector(`input[name="preview-mode"][value="${currentMode}"]`).checked = true;

  initPreviewScene();
  loadPreviewAssets(char);
}

function closePreview() {
  const modal = document.getElementById('preview-modal');
  modal.classList.remove('active');
  
  // Clean up
  if (preview.animationId) {
    cancelAnimationFrame(preview.animationId);
    preview.animationId = null;
  }
  
  // Stop videos
  preview.videos.forEach(v => {
    if (v.video && v.video.pause) v.video.pause();
  });
  preview.videos = [];
  
  // Stop audios
  preview.audios.forEach(a => {
    if (a.audio) {
      a.audio.pause();
      a.audio.currentTime = 0;
    }
  });
  preview.audios = [];
  
  // Dispose Three.js resources
  if (preview.renderer) {
    preview.renderer.dispose();
    const container = document.getElementById('preview-canvas-container');
    const canvas = container.querySelector('canvas');
    if (canvas) canvas.remove();
  }
  
  preview.meshes = [];
  preview.mixers = [];
  preview.scene = null;
  preview.camera = null;
  preview.renderer = null;
  preview.controls = null;
}

function initPreviewScene() {
  const container = document.getElementById('preview-canvas-container');
  const loading = document.getElementById('preview-loading');
  loading.classList.remove('hidden');
  
  // Scene
  preview.scene = new THREE.Scene();
  preview.scene.background = new THREE.Color(0x111111);
  
  // Camera - different setup for scan vs immersive
  const aspect = container.clientWidth / container.clientHeight;
  preview.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
  
  // Renderer
  preview.renderer = new THREE.WebGLRenderer({ antialias: true });
  preview.renderer.setSize(container.clientWidth, container.clientHeight);
  preview.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(preview.renderer.domElement);
  
  // OrbitControls
  preview.controls = new THREE.OrbitControls(preview.camera, preview.renderer.domElement);
  preview.controls.enableDamping = true;
  preview.controls.dampingFactor = 0.05;
  preview.controls.minDistance = 0.5;
  preview.controls.maxDistance = 50;
  
  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  preview.scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(5, 5, 5);
  preview.scene.add(directionalLight);
  
  // Grid helper for reference (horizontal ground plane)
  const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x333333);
  preview.scene.add(gridHelper);
  
  // Initialize animation clock
  preview.clock = new THREE.Clock();
  
  // Handle resize
  const handleResize = () => {
    if (!preview.renderer) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    preview.camera.aspect = w / h;
    preview.camera.updateProjectionMatrix();
    preview.renderer.setSize(w, h);
  };
  window.addEventListener('resize', handleResize);
  
  // Animation loop
  function animate() {
    preview.animationId = requestAnimationFrame(animate);
    if (preview.controls) preview.controls.update();
    
    // Update animation mixers
    if (preview.clock && preview.mixers.length > 0) {
      const delta = preview.clock.getDelta();
      preview.mixers.forEach(mixer => mixer.update(delta));
    }
    
    // Update video textures
    preview.videos.forEach(v => {
      if (v.texture && v.video.readyState >= v.video.HAVE_CURRENT_DATA) {
        v.texture.needsUpdate = true;
      }
    });
    
    // Update billboards - make meshes face camera if billboard is enabled
    // Skip billboard for meshes using wrapped geometry (non-plane shapes)
    preview.meshes.forEach(mesh => {
      if (mesh.userData.isSoundIndicator) return; // Sound indicators have fixed orientation
      if (mesh.userData.billboard !== false && !mesh.userData.wrapShape) {
        mesh.lookAt(preview.camera.position);
      } else if (mesh.userData.billboard === false && mesh.userData.needsRotationReset) {
        const rot = mesh.userData.baseRotation || { x: 0, y: 0, z: 0 };
        mesh.rotation.set(
          THREE.MathUtils.degToRad(rot.x),
          THREE.MathUtils.degToRad(rot.y),
          THREE.MathUtils.degToRad(rot.z)
        );
        mesh.userData.needsRotationReset = false;
      }
    });
    
    if (preview.renderer && preview.scene && preview.camera) {
      preview.renderer.render(preview.scene, preview.camera);
    }
  }
  animate();
}

function loadPreviewAssets(char) {
  const loading = document.getElementById('preview-loading');
  // Preserve camera position across reloads (only if already set for this mode)
  const savedCamPos = preview.cameraInitialized ? preview.camera.position.clone() : null;
  const savedTarget = preview.cameraInitialized ? preview.controls.target.clone() : null;
  preview.meshes = [];
  preview.mixers = [];
  preview.animationData = {};

  // Stop and clean up any existing videos
  if (preview.videos) {
    preview.videos.forEach(v => {
      if (v.video) { v.video.pause(); v.video.src = ''; }
    });
  }
  preview.videos = [];

  // Stop and clean up any existing audios
  if (preview.audios) {
    preview.audios.forEach(a => {
      if (a.audio) { a.audio.pause(); a.audio.src = ''; }
    });
  }
  preview.audios = [];

  // Clear existing meshes (except lights and grid)
  preview.scene.children = preview.scene.children.filter(obj =>
    obj.type === 'AmbientLight' ||
    obj.type === 'DirectionalLight' ||
    obj.type === 'GridHelper'
  );

  // Create scene group for collective transforms
  preview.sceneGroup = new THREE.Group();
  const sceneTransform = char.sceneTransform || {};
  const sPos = sceneTransform.position || { x: 0, y: 0, z: 0 };
  const sRot = sceneTransform.rotation || { x: 0, y: 0, z: 0 };
  const sScale = sceneTransform.scale ?? 1;
  preview.sceneGroup.position.set(sPos.x, sPos.y, sPos.z);
  preview.sceneGroup.rotation.set(
    THREE.MathUtils.degToRad(sRot.x),
    THREE.MathUtils.degToRad(sRot.y),
    THREE.MathUtils.degToRad(sRot.z)
  );
  preview.sceneGroup.scale.setScalar(sScale);
  preview.scene.add(preview.sceneGroup);

  const textureLoader = new THREE.TextureLoader();
  let loadPromises = [];
  
  if (preview.mode === 'scan') {
    // Add marker plane as reference (on ground, representing the AR marker)
    const markerGeo = new THREE.PlaneGeometry(1, 1);
    const markerMat = new THREE.MeshBasicMaterial({ 
      color: 0x6366f1, 
      transparent: true, 
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const markerPlane = new THREE.Mesh(markerGeo, markerMat);
    markerPlane.rotation.x = -Math.PI / 2; // Lay flat on ground
    markerPlane.position.y = 0.01;

    preview.scene.add(markerPlane);
    
    // Camera position for scan mode - viewing from front (only on first load)
    if (!savedCamPos) {
      preview.camera.position.set(0, 1, 4);
      preview.controls.target.set(0, 0.5, 0);
      preview.cameraInitialized = true;
    }
    
    // Load 2D assets - load ALL, control visibility via mesh.visible
    const assets2d = char.assets?.['2d'] || [];
    assets2d.forEach(asset => {
      const shouldBeVisible = !asset.visibleIn || asset.visibleIn.includes('scan');
      
      const promise = new Promise((resolve) => {
        const assetPath = '../' + asset.path;
        textureLoader.load(assetPath, (texture) => {
          const ratio = texture.image.width / texture.image.height;
          const scale = asset.scale || 1;
          const curvature = migrateCurvature(asset);
          const curveAxis = asset.curveAxis || 'x';
          const shape = curvature > 0.01 ? 'bend' : 'plane';
          const geo = buildWrapGeometry(shape, curvature, ratio, curveAxis);
          const mat = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: asset.opacity ?? 1,
            side: THREE.DoubleSide,
            depthWrite: false,
            depthTest: false,
            alphaTest: 0.01
          });
          const mesh = new THREE.Mesh(geo, mat);
          const scaleX = asset.scaleX || 1;
          const scaleY = asset.scaleY || 1;
          const scaleZ = asset.scaleZ || 1;
          mesh.scale.set(scale * scaleX, scale * scaleY, scaleZ);

          const pos = asset.position || { x: 0, y: 0, z: 0 };
          mesh.position.set(pos.x, pos.y, pos.z);

          mesh.userData.baseScale = scale;
          mesh.userData.scaleX = scaleX;
          mesh.userData.scaleY = scaleY;
          mesh.userData.scaleZ = scaleZ;
          mesh.userData.aspectRatio = ratio;
          mesh.userData.curveAxis = curveAxis;
          mesh.userData.wrapShape = curvature > 0.01 ? 'bend' : null;

          // Apply rotation (convert degrees to radians)
          const rot = asset.rotation || { x: 0, y: 0, z: 0 };
          mesh.rotation.set(
            THREE.MathUtils.degToRad(rot.x),
            THREE.MathUtils.degToRad(rot.y),
            THREE.MathUtils.degToRad(rot.z)
          );
          mesh.userData.baseRotation = rot;

          mesh.userData.assetId = asset.id;
          mesh.userData.visibleIn = asset.visibleIn || ['scan', 'immersive'];
          mesh.userData.billboard = asset.billboard !== false;
          mesh.renderOrder = Math.round((asset.order ?? 0) * 10);
          mesh.visible = shouldBeVisible;
          preview.sceneGroup.add(mesh);
          preview.meshes.push(mesh);
          resolve();
        }, undefined, resolve);
      });
      loadPromises.push(promise);
    });
    
    // Load 3D models - load ALL, control visibility via mesh.visible
    const assets3d = char.assets?.['3d'] || [];
    assets3d.forEach(asset => {
      const shouldBeVisible3d = !asset.visibleIn || asset.visibleIn.includes('scan');
      
      const promise = new Promise((resolve) => {
        const loader = new THREE.GLTFLoader();
        const assetPath = '../' + asset.path;
        loader.load(assetPath, (gltf) => {
          const model = gltf.scene;
          const scale = asset.scale || 1;
          model.scale.set(scale, scale, scale);
          
          // Same coordinate system as 2D assets
          const pos = asset.position || { x: 0, y: 0, z: 0 };
          model.position.set(pos.x, pos.y, pos.z);
          
          const rot = asset.rotation || { x: 0, y: 0, z: 0 };
          model.rotation.set(
            THREE.MathUtils.degToRad(rot.x),
            THREE.MathUtils.degToRad(rot.y),
            THREE.MathUtils.degToRad(rot.z)
          );
          
          // Store animation data for this asset
          if (gltf.animations && gltf.animations.length > 0) {
            console.log('📽️ Available animations for', asset.id + ':', gltf.animations.map(a => `"${a.name}" (${a.duration.toFixed(2)}s)`).join(', '));
            
            const mixer = new THREE.AnimationMixer(model);
            const clipName = asset.animation?.clipName;
            let clipIndex = 0;
            
            if (clipName) {
              const foundIndex = gltf.animations.findIndex(a => a.name === clipName);
              if (foundIndex >= 0) clipIndex = foundIndex;
            }
            
            const clip = gltf.animations[clipIndex];
            const action = mixer.clipAction(clip);
            const speed = asset.animation?.speed || 1;
            action.timeScale = speed;
            
            if (asset.animation?.loop !== false) {
              action.setLoop(THREE.LoopRepeat);
            } else {
              action.setLoop(THREE.LoopOnce);
              action.clampWhenFinished = true;
            }
            
            // Only play if animation is enabled
            if (asset.animation) {
              action.play();
            }
            
            preview.mixers.push(mixer);
            preview.animationData[asset.id] = {
              clips: gltf.animations.map((a, i) => ({ name: a.name || `Animation ${i}`, duration: a.duration, index: i })),
              currentClipIndex: clipIndex,
              action: action,
              mixer: mixer,
              model: model,
              allClips: gltf.animations,
              speed: speed,
              loop: asset.animation?.loop !== false,
              playing: !!asset.animation
            };
          } else {
            console.log('📽️ No animations found in', asset.id);
          }
          
          model.userData.assetId = asset.id;
          model.userData.visibleIn = asset.visibleIn || ['scan', 'immersive'];
          model.userData.billboard = asset.billboard !== false;
          model.visible = shouldBeVisible3d;
          preview.sceneGroup.add(model);
          preview.meshes.push(model);
          resolve();
        }, undefined, resolve);
      });
      loadPromises.push(promise);
    });
    
  } else {
    // Immersive mode (only set camera on first load)
    if (!savedCamPos) {
      preview.camera.position.set(0, 1.6, 2); // Slightly back from scene
      preview.controls.target.set(0, 0.5, -2);
      preview.cameraInitialized = true;
    }
    
    // Check for layers (legacy fata format) or assets.2d (newer format)
    const hasLayers = char.layers && Object.keys(char.layers).length > 0;
    const assets2dImmersive = char.assets?.['2d'] || [];
    
    if (hasLayers) {
      // Legacy format: load from layers object
      const layers = char.layers;
      const sortedLayers = Object.entries(layers)
        .map(([key, layer]) => ({ key, ...layer }))
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      sortedLayers.forEach(layer => {
        // Always load all layers - visibility is controlled via mesh.visible
        const shouldBeVisible = !layer.visibleIn || layer.visibleIn.includes('immersive');
        
        const isVideo = layer.type === 'video';
        
        const promise = new Promise((resolve) => {
          if (isVideo) {
            // Create video texture - wait for metadata before creating mesh
            const video = document.createElement('video');
            video.src = '../' + layer.path;
            video.crossOrigin = 'anonymous';
            video.loop = layer.loop ?? true;
            video.muted = true;
            video.playsInline = true;
            
            video.addEventListener('loadedmetadata', () => {
              const videoTexture = new THREE.VideoTexture(video);
              videoTexture.minFilter = THREE.LinearFilter;
              videoTexture.magFilter = THREE.LinearFilter;
              
              // Store video+texture for updates (with layerKey for volume control)
              preview.videos.push({ video, texture: videoTexture, layerKey: layer.key });
              
              // Use actual video dimensions - create at unit size, use mesh.scale
              const aspect = video.videoWidth / video.videoHeight;
              const scale = layer.scale || 1;
              const geo = new THREE.PlaneGeometry(aspect, 1);
              
              // Use chroma key shader if chromaKey is specified
              let mat;
              if (layer.chromaKey) {
                const keyColor = new THREE.Color(layer.chromaKey);
                mat = new THREE.ShaderMaterial({
                  uniforms: {
                    tDiffuse: { value: videoTexture },
                    keyColor: { value: keyColor },
                    similarity: { value: layer.tolerance || 0.4 },
                    smoothness: { value: layer.smoothness || 0.08 },
                    spill: { value: layer.spill || 0.1 }
                  },
                  vertexShader: ChromaKeyShader.vertexShader,
                  fragmentShader: ChromaKeyShader.fragmentShader,
                  transparent: true,
                  side: THREE.DoubleSide,
                  depthWrite: false,
                  depthTest: false
                });
              } else {
                mat = new THREE.MeshBasicMaterial({
                  map: videoTexture,
                  transparent: true,
                  side: THREE.DoubleSide,
                  depthWrite: false,
                  depthTest: false
                });
              }
              const mesh = new THREE.Mesh(geo, mat);
              // Apply scaleX/scaleY for stretch if specified (like in-game)
              const scaleX = layer.scaleX || 1;
              const scaleY = layer.scaleY || 1;
              mesh.scale.set(scale * scaleX, scale * scaleY, 1);

              mesh.userData.baseScale = scale;
              mesh.userData.scaleX = scaleX;
              mesh.userData.scaleY = scaleY;

              const pos = layer.position || { x: 0, y: 0, z: 0 };
              mesh.position.set(pos.x, pos.y, pos.z);
              const rot = layer.rotation || { x: 0, y: 0, z: 0 };
              mesh.rotation.set(
                THREE.MathUtils.degToRad(rot.x),
                THREE.MathUtils.degToRad(rot.y),
                THREE.MathUtils.degToRad(rot.z)
              );
              mesh.userData.baseRotation = rot;
              // Use layer order for stable render ordering (avoids distance-sort issues with curved geometry)
              mesh.renderOrder = Math.round((layer.order ?? 0) * 10);

              mesh.userData.layerKey = layer.key;
              mesh.userData.billboard = layer.billboard !== false; // default true
              mesh.userData.visibleIn = layer.visibleIn || ['scan', 'immersive'];
              // Set visibility based on current preview mode
              const currentMode = preview.mode || 'immersive';
              mesh.visible = mesh.userData.visibleIn.includes(currentMode);
              preview.sceneGroup.add(mesh);
              preview.meshes.push(mesh);

              video.play().catch(e => console.warn('Video autoplay blocked:', e));
              resolve();
            });
            
            video.addEventListener('error', (e) => {
              console.error('Video load error:', layer.path, e);
              resolve();
            });
            
            video.load();
            
          } else {
            const assetPath = '../' + layer.path;
            textureLoader.load(assetPath, (texture) => {
              const ratio = texture.image.width / texture.image.height;
              const scale = layer.scale || 1;
              const curvature = migrateCurvature(layer);
              const curveAxisL = layer.curveAxis || 'x';
              const lShape = curvature > 0.01 ? 'bend' : 'plane';
              const geo = buildWrapGeometry(lShape, curvature, ratio, curveAxisL);
              const mat = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide,
                depthWrite: false,
                depthTest: false,
                alphaTest: 0.01
              });
              const mesh = new THREE.Mesh(geo, mat);
              // Apply scaleX/scaleY for stretch if specified (like in-game)
              const scaleX = layer.scaleX || 1;
              const scaleY = layer.scaleY || 1;
              const scaleZ = layer.scaleZ || 1;
              mesh.scale.set(scale * scaleX, scale * scaleY, scaleZ);
              mesh.userData.baseScale = scale;
              mesh.userData.scaleX = scaleX;
              mesh.userData.scaleY = scaleY;
              mesh.userData.scaleZ = scaleZ;
              mesh.userData.aspectRatio = ratio;
              mesh.userData.wrapShape = curvature > 0.01 ? 'bend' : null;
              mesh.userData.curveAxis = curveAxisL;

              const pos = layer.position || { x: 0, y: 0, z: 0 };
              mesh.position.set(pos.x, pos.y, pos.z);
              const rot = layer.rotation || { x: 0, y: 0, z: 0 };
              mesh.rotation.set(
                THREE.MathUtils.degToRad(rot.x),
                THREE.MathUtils.degToRad(rot.y),
                THREE.MathUtils.degToRad(rot.z)
              );
              mesh.userData.baseRotation = rot;
              mesh.renderOrder = Math.round((layer.order ?? 0) * 10);

              mesh.userData.layerKey = layer.key;
              mesh.userData.billboard = layer.billboard !== false; // default true
              mesh.userData.visibleIn = layer.visibleIn || ['scan', 'immersive'];
              // Set visibility based on current preview mode
              const currentModeImg = preview.mode || 'immersive';
              mesh.visible = mesh.userData.visibleIn.includes(currentModeImg);
              preview.sceneGroup.add(mesh);
              preview.meshes.push(mesh);
              resolve();
            }, undefined, resolve);
          }
        });
        loadPromises.push(promise);
      });
    }
    if (assets2dImmersive.length > 0) {
      // Sort by z position (background first)
      const sortedAssets = [...assets2dImmersive].sort((a, b) => {
        const zA = a.position?.z ?? 0;
        const zB = b.position?.z ?? 0;
        return zA - zB;
      });
      
      sortedAssets.forEach(asset => {
        const shouldBeVisible = !asset.visibleIn || asset.visibleIn.includes('immersive');
        
        const promise = new Promise((resolve) => {
          const assetPath = '../' + asset.path;
          textureLoader.load(assetPath, (texture) => {
            const ratio = texture.image.width / texture.image.height;
            const scale = asset.scale || 1;
            const curvature = migrateCurvature(asset);
            const curveAxisI = asset.curveAxis || 'x';
            const iShape = curvature > 0.01 ? 'bend' : 'plane';
            const geo = buildWrapGeometry(iShape, curvature, ratio, curveAxisI);
            const mat = new THREE.MeshBasicMaterial({
              map: texture,
              transparent: true,
              opacity: asset.opacity ?? 1,
              side: THREE.DoubleSide,
              depthWrite: false,
              depthTest: false,
              alphaTest: 0.01
            });
            const mesh = new THREE.Mesh(geo, mat);
            const scaleX = asset.scaleX || 1;
            const scaleY = asset.scaleY || 1;
            const scaleZ = asset.scaleZ || 1;
            mesh.scale.set(scale * scaleX, scale * scaleY, scaleZ);

            const pos = asset.position || { x: 0, y: 0, z: 0 };
            mesh.position.set(pos.x, pos.y, pos.z);

            mesh.userData.baseScale = scale;
            mesh.userData.scaleX = scaleX;
            mesh.userData.scaleY = scaleY;
            mesh.userData.scaleZ = scaleZ;
            mesh.userData.aspectRatio = ratio;
            mesh.userData.wrapShape = curvature > 0.01 ? 'bend' : null;
            mesh.userData.curveAxis = curveAxisI;

            const rot = asset.rotation || { x: 0, y: 0, z: 0 };
            mesh.rotation.set(
              THREE.MathUtils.degToRad(rot.x),
              THREE.MathUtils.degToRad(rot.y),
              THREE.MathUtils.degToRad(rot.z)
            );
            mesh.userData.baseRotation = rot;

            mesh.userData.assetId = asset.id;
            mesh.userData.visibleIn = asset.visibleIn || ['scan', 'immersive'];
            mesh.userData.billboard = asset.billboard !== false;
            mesh.renderOrder = Math.round((asset.order ?? 0) * 10);
            mesh.visible = shouldBeVisible;
            preview.sceneGroup.add(mesh);
            preview.meshes.push(mesh);
            resolve();
          }, undefined, resolve);
        });
        loadPromises.push(promise);
      });
    }
    
    // Load 3D models for immersive mode - load ALL, control visibility via mesh.visible
    const assets3dImmersive = char.assets?.['3d'] || [];
    assets3dImmersive.forEach(asset => {
      const shouldBeVisible3d = !asset.visibleIn || asset.visibleIn.includes('immersive');
      
      const promise = new Promise((resolve) => {
        const loader = new THREE.GLTFLoader();
        const assetPath = '../' + asset.path;
        loader.load(assetPath, (gltf) => {
          const model = gltf.scene;
          const scale = asset.scale || 1;
          model.scale.set(scale, scale, scale);

          const pos = asset.position || { x: 0, y: 0, z: 0 };
          model.position.set(pos.x, pos.y, pos.z);


          const rot = asset.rotation || { x: 0, y: 0, z: 0 };
          model.rotation.set(
            THREE.MathUtils.degToRad(rot.x),
            THREE.MathUtils.degToRad(rot.y),
            THREE.MathUtils.degToRad(rot.z)
          );
          
          // Store animation data for this asset
          if (gltf.animations && gltf.animations.length > 0) {
            console.log('📽️ Available animations for', asset.id + ':', gltf.animations.map(a => `"${a.name}" (${a.duration.toFixed(2)}s)`).join(', '));
            
            const mixer = new THREE.AnimationMixer(model);
            const clipName = asset.animation?.clipName;
            let clipIndex = 0;
            
            if (clipName) {
              const foundIndex = gltf.animations.findIndex(a => a.name === clipName);
              if (foundIndex >= 0) clipIndex = foundIndex;
            }
            
            const clip = gltf.animations[clipIndex];
            const action = mixer.clipAction(clip);
            const speed = asset.animation?.speed || 1;
            action.timeScale = speed;
            
            if (asset.animation?.loop !== false) {
              action.setLoop(THREE.LoopRepeat);
            } else {
              action.setLoop(THREE.LoopOnce);
              action.clampWhenFinished = true;
            }
            
            // Only play if animation is enabled
            if (asset.animation) {
              action.play();
            }
            
            preview.mixers.push(mixer);
            preview.animationData[asset.id] = {
              clips: gltf.animations.map((a, i) => ({ name: a.name || `Animation ${i}`, duration: a.duration, index: i })),
              currentClipIndex: clipIndex,
              action: action,
              mixer: mixer,
              model: model,
              allClips: gltf.animations,
              speed: speed,
              loop: asset.animation?.loop !== false,
              playing: !!asset.animation
            };
          } else {
            console.log('📽️ No animations found in', asset.id);
          }
          
          model.userData.assetId = asset.id;
          model.userData.visibleIn = asset.visibleIn || ['scan', 'immersive'];
          model.userData.billboard = asset.billboard !== false;
          model.visible = shouldBeVisible3d;
          preview.sceneGroup.add(model);
          preview.meshes.push(model);
          resolve();
        }, undefined, resolve);
      });
      loadPromises.push(promise);
    });
  }
  
  // Add sound indicators to scene
  const sounds = char.sounds || {};
  Object.entries(sounds).forEach(([key, sound]) => {
    const visibleIn = sound.visibleIn || ['scan', 'immersive'];
    const indicator = buildSoundIndicator(sound, key);
    indicator.visible = visibleIn.includes(preview.mode);
    indicator.userData.visibleIn = visibleIn;
    preview.sceneGroup.add(indicator);
    preview.meshes.push(indicator);
  });

  // Hide loading when done
  Promise.all(loadPromises).then(() => {
    loading.classList.add('hidden');
    // Restore camera position if this was a reload (not first load)
    if (savedCamPos && savedTarget) {
      preview.camera.position.copy(savedCamPos);
      preview.controls.target.copy(savedTarget);
      preview.controls.update();
    }
    populatePreviewControls(char);
    populateAnimationControls();
    repositionGrid();
  });
}

function updatePreviewMode(mode) {
  preview.mode = mode;
  preview.cameraInitialized = false;
  const char = getSelectedCharacter();
  if (char) {
    loadPreviewAssets(char);
  }
}

function resetPreviewCamera() {
  if (!preview.camera || !preview.controls) return;
  
  if (preview.mode === 'scan') {
    preview.camera.position.set(0, 1, 4);
    preview.controls.target.set(0, 0.5, 0);
  } else {
    preview.camera.position.set(0, 1.6, 2);
    preview.controls.target.set(0, 0.5, -2);
  }
  preview.controls.update();
}

function deleteAssetFromPreview(assetType, index) {
  if (!confirm('Delete this asset?')) return;
  const char = getSelectedCharacter();
  if (!char || !char.assets?.[assetType]) return;
  char.assets[assetType].splice(index, 1);
  markUnsaved();
  loadPreviewAssets(char);
}

function deleteLayerFromPreview(key) {
  if (!confirm('Delete this layer?')) return;
  const char = getSelectedCharacter();
  if (!char || !char.layers) return;
  delete char.layers[key];
  markUnsaved();
  loadPreviewAssets(char);
}

function deleteSoundFromPreview(key) {
  if (!confirm('Delete this sound?')) return;
  const char = getSelectedCharacter();
  if (!char || !char.sounds) return;
  delete char.sounds[key];
  markUnsaved();
  loadPreviewAssets(char);
}

// ============================================
// Card Drag-and-Drop Reordering
// ============================================
let draggedCard = null;

function onCardDragStart(e) {
  draggedCard = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function initDragHandle(card) {
  card.draggable = false;
  const handle = card.querySelector('.drag-handle');
  if (!handle) return;
  handle.addEventListener('mousedown', () => { card.draggable = true; });
  handle.addEventListener('touchstart', () => { card.draggable = true; }, { passive: true });
  document.addEventListener('mouseup', () => { card.draggable = false; });
  document.addEventListener('touchend', () => { card.draggable = false; });
}

function onCardDragEnd() {
  this.classList.remove('dragging');
  document.querySelectorAll('.preview-asset-card.drag-over').forEach(c => c.classList.remove('drag-over'));
  draggedCard = null;
}

function onCardDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  if (this === draggedCard || !draggedCard) return;
  // Only allow reorder among same type group (skip scene card)
  if (this.classList.contains('scene-card')) return;
  document.querySelectorAll('.preview-asset-card.drag-over').forEach(c => c.classList.remove('drag-over'));
  this.classList.add('drag-over');
}

function onCardDrop(e) {
  e.preventDefault();
  if (!draggedCard || draggedCard === this) return;
  this.classList.remove('drag-over');

  const container = document.getElementById('preview-asset-list');
  // Get all draggable cards (exclude scene card and add buttons)
  const cards = [...container.querySelectorAll('.preview-asset-card:not(.scene-card)')];
  const fromIndex = cards.indexOf(draggedCard);
  const toIndex = cards.indexOf(this);
  if (fromIndex < 0 || toIndex < 0) return;

  // Move DOM element
  if (fromIndex < toIndex) {
    this.parentNode.insertBefore(draggedCard, this.nextSibling);
  } else {
    this.parentNode.insertBefore(draggedCard, this);
  }

  // Now read the new order from DOM and apply to data + meshes
  applyCardOrder();
}

function applyCardOrder() {
  const char = getSelectedCharacter();
  if (!char) return;

  const container = document.getElementById('preview-asset-list');
  // Only reorder visual cards (assets + layers), skip sound cards
  const cards = [...container.querySelectorAll('.preview-asset-card:not(.scene-card)')]
    .filter(c => c.dataset.orderType !== 'sound');

  cards.forEach((card, visualIndex) => {
    const orderValue = visualIndex;

    if (card.dataset.assetType && card.dataset.assetIndex != null) {
      const type = card.dataset.assetType;
      const idx = parseInt(card.dataset.assetIndex);
      const asset = char.assets?.[type]?.[idx];
      if (asset) asset.order = orderValue;
      const assetId = card.dataset.assetId;
      const mesh = preview.meshes.find(m => m.userData.assetId === assetId);
      if (mesh) mesh.renderOrder = orderValue * 10;
    } else if (card.dataset.layerKey) {
      const key = card.dataset.layerKey;
      if (char.layers?.[key]) char.layers[key].order = orderValue;
      const mesh = preview.meshes.find(m => m.userData.layerKey === key);
      if (mesh) mesh.renderOrder = orderValue * 10;
    }
  });

  markUnsaved();
}

function repositionGrid() {
  // Grid stays fixed at y=0 as a stable reference plane
}

// ============================================
// Preview Live Controls Panel
// ============================================

function populatePreviewControls(char) {
  const container = document.getElementById('preview-asset-list');
  if (!container) return;

  container.innerHTML = '';

  // Add asset buttons at the top
  const addBtnsRow = document.createElement('div');
  addBtnsRow.className = 'preview-add-btns';
  addBtnsRow.innerHTML = `
    <button class="btn btn-small btn-accent" id="preview-add-2d">+ 2D Asset</button>
    <button class="btn btn-small btn-accent" id="preview-add-3d">+ 3D Model</button>
    <button class="btn btn-small btn-accent" id="preview-add-sound">+ Sound</button>
    <button class="btn btn-small btn-accent" id="preview-add-layer">+ Layer</button>
  `;
  container.appendChild(addBtnsRow);

  const orderHint = document.createElement('div');
  orderHint.className = 'preview-order-hint';
  orderHint.textContent = 'Drag cards to reorder — bottom draws on top';
  container.appendChild(orderHint);

  addBtnsRow.querySelector('#preview-add-2d').addEventListener('click', () => openAssetModalFromPreview('2d'));
  addBtnsRow.querySelector('#preview-add-3d').addEventListener('click', () => openAssetModalFromPreview('3d'));
  addBtnsRow.querySelector('#preview-add-sound').addEventListener('click', () => openAssetModalFromPreview('sound'));
  addBtnsRow.querySelector('#preview-add-layer').addEventListener('click', () => openAssetModalFromPreview('layer'));

  // Scene-level transform card (always first)
  container.appendChild(createSceneControlCard(char));

  if (preview.mode === 'scan') {
    // 2D Assets - sorted by draw order, visibility checkboxes control which modes they appear in
    const assets2d = (char.assets?.['2d'] || [])
      .map((asset, idx) => ({ asset, idx }))
      .sort((a, b) => (a.asset.order ?? 0) - (b.asset.order ?? 0));
    assets2d.forEach(({ asset, idx }) => {
      container.appendChild(createAssetControlCard(asset, '2d', idx, '🖼️'));
    });

    // 3D Assets - sorted by draw order, visibility checkboxes control which modes they appear in
    const assets3d = (char.assets?.['3d'] || [])
      .map((asset, idx) => ({ asset, idx }))
      .sort((a, b) => (a.asset.order ?? 0) - (b.asset.order ?? 0));
    assets3d.forEach(({ asset, idx }) => {
      container.appendChild(createAssetControlCard(asset, '3d', idx, '📦'));
    });

    // Sounds section — separate from visual ordering
    const sounds = char.sounds || {};
    if (Object.keys(sounds).length) {
      const soundLabel = document.createElement('div');
      soundLabel.className = 'preview-order-hint';
      soundLabel.textContent = 'Sounds';
      container.appendChild(soundLabel);
      Object.entries(sounds).forEach(([key, sound]) => {
        container.appendChild(createSoundControlCard(key, sound));
      });
    }
  } else {
    // Merge all visual items (layers + 2d assets + 3d assets) into one sorted list
    const allVisuals = [];

    const layers = char.layers || {};
    Object.entries(layers).forEach(([key, layer]) => {
      allVisuals.push({ kind: 'layer', order: layer.order ?? 0, key, layer });
    });

    const assets2dImmersive = char.assets?.['2d'] || [];
    assets2dImmersive.forEach((asset, idx) => {
      allVisuals.push({ kind: '2d', order: asset.order ?? 0, asset, idx });
    });

    const assets3d = char.assets?.['3d'] || [];
    assets3d.forEach((asset, idx) => {
      allVisuals.push({ kind: '3d', order: asset.order ?? 0, asset, idx });
    });

    allVisuals.sort((a, b) => a.order - b.order);

    allVisuals.forEach(item => {
      if (item.kind === 'layer') {
        const icon = item.layer.type === 'video' ? '🎬' : '🖼️';
        container.appendChild(createLayerControlCard(item.key, item.layer, icon));
      } else if (item.kind === '2d') {
        container.appendChild(createAssetControlCard(item.asset, '2d', item.idx, '🖼️'));
      } else if (item.kind === '3d') {
        container.appendChild(createAssetControlCard(item.asset, '3d', item.idx, '📦'));
      }
    });

    // Sounds section — separate from visual ordering
    const sounds = char.sounds || {};
    if (Object.keys(sounds).length) {
      const soundLabel = document.createElement('div');
      soundLabel.className = 'preview-order-hint';
      soundLabel.textContent = 'Sounds';
      container.appendChild(soundLabel);
      Object.entries(sounds).forEach(([key, sound]) => {
        container.appendChild(createSoundControlCard(key, sound));
      });
    }
  }
}

function createSceneControlCard(char) {
  const st = char.sceneTransform || {};
  const pos = st.position || { x: 0, y: 0, z: 0 };
  const rot = st.rotation || { x: 0, y: 0, z: 0 };
  const scale = st.scale ?? 1;

  const card = document.createElement('div');
  card.className = 'preview-asset-card scene-card';
  card.innerHTML = `
    <div class="preview-asset-card-header" onclick="this.parentElement.classList.toggle('expanded')" style="background:var(--accent-primary);color:#fff;">
      <span class="preview-asset-name">🎬 Entire Scene</span>
      <span class="preview-asset-type">GROUP</span>
    </div>
    <div class="preview-asset-card-body">
      <div class="preview-control-group">
        <div class="preview-control-label">
          <span>Scale</span>
          <span class="preview-control-value" id="scene-scale-val">${scale.toFixed(2)}</span>
        </div>
        <input type="range" class="preview-slider"
          min="0.05" max="10" step="0.01"
          value="${scale}"
          data-prop="scale" data-scene="true"
          oninput="updateSceneTransform(this)">
      </div>

      <div class="preview-control-group">
        <div class="preview-control-label"><span>Position</span></div>
        <div class="preview-xyz-row">
          <div class="preview-xyz-input x">
            <label>X</label>
            <input type="number" step="0.1" value="${pos.x}"
              data-prop="position.x" data-scene="true"
              oninput="updateSceneTransform(this)">
          </div>
          <div class="preview-xyz-input y">
            <label>Y</label>
            <input type="number" step="0.1" value="${pos.y}"
              data-prop="position.y" data-scene="true"
              oninput="updateSceneTransform(this)">
          </div>
          <div class="preview-xyz-input z">
            <label>Z</label>
            <input type="number" step="0.1" value="${pos.z}"
              data-prop="position.z" data-scene="true"
              oninput="updateSceneTransform(this)">
          </div>
        </div>
      </div>

      <div class="preview-control-group">
        <div class="preview-control-label"><span>Rotation</span></div>
        <div class="preview-xyz-row">
          <div class="preview-xyz-input x">
            <label>X</label>
            <input type="number" step="1" value="${rot.x}"
              data-prop="rotation.x" data-scene="true"
              oninput="updateSceneTransform(this)">
          </div>
          <div class="preview-xyz-input y">
            <label>Y</label>
            <input type="number" step="1" value="${rot.y}"
              data-prop="rotation.y" data-scene="true"
              oninput="updateSceneTransform(this)">
          </div>
          <div class="preview-xyz-input z">
            <label>Z</label>
            <input type="number" step="1" value="${rot.z}"
              data-prop="rotation.z" data-scene="true"
              oninput="updateSceneTransform(this)">
          </div>
        </div>
      </div>
    </div>
  `;
  return card;
}

function updateSceneTransform(input) {
  const prop = input.dataset.prop;
  const value = parseFloat(input.value);
  const group = preview.sceneGroup;
  if (!group) return;

  if (prop === 'scale') {
    group.scale.setScalar(value);
    const valDisplay = document.getElementById('scene-scale-val');
    if (valDisplay) valDisplay.textContent = value.toFixed(2);
  } else if (prop.startsWith('position.')) {
    const axis = prop.split('.')[1];
    group.position[axis] = value;
  } else if (prop.startsWith('rotation.')) {
    const axis = prop.split('.')[1];
    group.rotation[axis] = THREE.MathUtils.degToRad(value);
  }

  // Auto-save
  if (document.getElementById('preview-autosave')?.checked) {
    const char = getSelectedCharacter();
    if (char) {
      if (!char.sceneTransform) char.sceneTransform = {};
      if (prop === 'scale') {
        char.sceneTransform.scale = value;
      } else if (prop.startsWith('position.')) {
        if (!char.sceneTransform.position) char.sceneTransform.position = { x: 0, y: 0, z: 0 };
        char.sceneTransform.position[prop.split('.')[1]] = value;
      } else if (prop.startsWith('rotation.')) {
        if (!char.sceneTransform.rotation) char.sceneTransform.rotation = { x: 0, y: 0, z: 0 };
        char.sceneTransform.rotation[prop.split('.')[1]] = value;
      }
      markUnsaved();
    }
  }
}

function createAssetControlCard(asset, assetType, index, icon) {
  const card = document.createElement('div');
  card.className = 'preview-asset-card';
  card.dataset.assetType = assetType;
  card.dataset.assetIndex = index;
  card.dataset.assetId = asset.id;
  
  // Check if asset is visible in current mode
  const currentMode = preview.mode || 'scan';
  const visibleIn = asset.visibleIn || ['scan', 'immersive'];
  const isHiddenInCurrentMode = !visibleIn.includes(currentMode);
  
  if (isHiddenInCurrentMode) {
    card.classList.add('hidden-in-mode');
  }
  
  card.dataset.orderType = assetType;
  card.dataset.orderKey = asset.id || String(index);
  card.addEventListener('dragstart', onCardDragStart);
  card.addEventListener('dragend', onCardDragEnd);
  card.addEventListener('dragover', onCardDragOver);
  card.addEventListener('drop', onCardDrop);

  card.innerHTML = `
    <div class="preview-asset-card-header" onclick="this.parentElement.classList.toggle('expanded')">
      <span class="drag-handle" title="Drag to reorder">⠿</span>
      <span class="preview-asset-name">${icon} ${asset.id || 'Asset ' + index} ${isHiddenInCurrentMode ? '<span class="hidden-indicator">👁️‍🗨️</span>' : ''}</span>
      <span class="preview-asset-header-actions">
        <span class="preview-asset-type">${assetType.toUpperCase()}</span>
        <button class="btn-delete-asset" data-type="${assetType}" data-index="${index}" title="Delete asset" onclick="event.stopPropagation(); deleteAssetFromPreview('${assetType}', ${index})">✕</button>
      </span>
    </div>
    <div class="preview-asset-card-body">
      <div class="preview-control-group">
        <div class="preview-control-label">
          <span>Scale</span>
          <span class="preview-control-value" id="scale-val-${assetType}-${index}">${(asset.scale || 1).toFixed(2)}</span>
        </div>
        <input type="range" class="preview-slider"
          min="0.05" max="10" step="0.01"
          value="${asset.scale || 1}"
          data-prop="scale" data-type="${assetType}" data-index="${index}"
          oninput="updatePreviewAsset(this)">
      </div>
      ${assetType === '2d' ? `
      <div class="preview-control-group">
        <div class="preview-control-label">
          <span>Scale X</span>
          <span class="preview-control-value" id="scaleX-val-${assetType}-${index}">${(asset.scaleX || 1).toFixed(2)}</span>
        </div>
        <input type="range" class="preview-slider"
          min="0.1" max="5" step="0.01"
          value="${asset.scaleX || 1}"
          data-prop="scaleX" data-type="${assetType}" data-index="${index}"
          oninput="updatePreviewAsset(this)">
      </div>
      <div class="preview-control-group">
        <div class="preview-control-label">
          <span>Scale Y</span>
          <span class="preview-control-value" id="scaleY-val-${assetType}-${index}">${(asset.scaleY || 1).toFixed(2)}</span>
        </div>
        <input type="range" class="preview-slider"
          min="0.1" max="5" step="0.01"
          value="${asset.scaleY || 1}"
          data-prop="scaleY" data-type="${assetType}" data-index="${index}"
          oninput="updatePreviewAsset(this)">
      </div>
      <div class="preview-control-group">
        <div class="preview-control-label">
          <span>Scale Z (Depth)</span>
          <span class="preview-control-value" id="scaleZ-val-${assetType}-${index}">${(asset.scaleZ || 1).toFixed(2)}</span>
        </div>
        <input type="range" class="preview-slider"
          min="0.1" max="5" step="0.01"
          value="${asset.scaleZ || 1}"
          data-prop="scaleZ" data-type="${assetType}" data-index="${index}"
          oninput="updatePreviewAsset(this)">
      </div>
      ` : ''}
      <div class="preview-control-group">
        <div class="preview-control-label"><span>Position</span></div>
        <div class="preview-xyz-row">
          <div class="preview-xyz-input x">
            <label>X</label>
            <input type="number" step="0.01" value="${asset.position?.x || 0}"
              data-prop="position.x" data-type="${assetType}" data-index="${index}"
              oninput="updatePreviewAsset(this)">
          </div>
          <div class="preview-xyz-input y">
            <label>Y</label>
            <input type="number" step="0.01" value="${asset.position?.y || 0}"
              data-prop="position.y" data-type="${assetType}" data-index="${index}"
              oninput="updatePreviewAsset(this)">
          </div>
          <div class="preview-xyz-input z">
            <label>Z</label>
            <input type="number" step="0.01" value="${asset.position?.z || 0}"
              data-prop="position.z" data-type="${assetType}" data-index="${index}"
              oninput="updatePreviewAsset(this)">
          </div>
        </div>
      </div>
      
      <div class="preview-control-group">
        <div class="preview-control-label"><span>Rotation (°)</span></div>
        <div class="preview-xyz-row">
          <div class="preview-xyz-input x">
            <label>X</label>
            <input type="number" step="1" value="${asset.rotation?.x || 0}"
              data-prop="rotation.x" data-type="${assetType}" data-index="${index}"
              oninput="updatePreviewAsset(this)">
          </div>
          <div class="preview-xyz-input y">
            <label>Y</label>
            <input type="number" step="1" value="${asset.rotation?.y || 0}"
              data-prop="rotation.y" data-type="${assetType}" data-index="${index}"
              oninput="updatePreviewAsset(this)">
          </div>
          <div class="preview-xyz-input z">
            <label>Z</label>
            <input type="number" step="1" value="${asset.rotation?.z || 0}"
              data-prop="rotation.z" data-type="${assetType}" data-index="${index}"
              oninput="updatePreviewAsset(this)">
          </div>
        </div>
      </div>
      ${assetType === '2d' ? `
      <div class="preview-control-group">
        <div class="preview-control-label">
          <span>Curvature</span>
          <span class="preview-control-value" id="curvature-val-${assetType}-${index}">${(asset.curvature || 0).toFixed(1)}</span>
        </div>
        <input type="range" class="preview-slider"
          min="0" max="6.28" step="0.1"
          value="${asset.curvature || 0}"
          data-prop="curvature" data-type="${assetType}" data-index="${index}"
          oninput="updatePreviewAsset(this)">
        <small style="color:var(--text-secondary);font-size:11px;">0 = flat · 3.14 = half-circle · 6.28 = full wrap</small>
      </div>
      <div class="preview-control-group">
        <div class="preview-control-label"><span>Curve Axis</span></div>
        <div class="preview-axis-toggle">
          <label><input type="radio" name="curveAxis-${assetType}-${index}" value="x" ${(asset.curveAxis || 'x') === 'x' ? 'checked' : ''}
            data-prop="curveAxis" data-type="${assetType}" data-index="${index}"
            onchange="updatePreviewAsset(this)"> Horizontal</label>
          <label><input type="radio" name="curveAxis-${assetType}-${index}" value="y" ${asset.curveAxis === 'y' ? 'checked' : ''}
            data-prop="curveAxis" data-type="${assetType}" data-index="${index}"
            onchange="updatePreviewAsset(this)"> Vertical</label>
        </div>
      </div>
      ` : ''}
      ${assetType === '3d' ? `
      <div class="preview-control-group animation-controls" id="anim-controls-${asset.id}">
        <div class="preview-control-label"><span>🎬 Animation</span></div>
        <div class="anim-controls-placeholder">Loading animations...</div>
      </div>
      ` : ''}
      <div class="preview-control-group">
        <div class="preview-control-label">
          <span>Opacity</span>
          <span class="preview-control-value" id="opacity-val-${assetType}-${index}">${(asset.opacity ?? 1).toFixed(2)}</span>
        </div>
        <input type="range" class="preview-slider" 
          min="0" max="1" step="0.01" 
          value="${asset.opacity ?? 1}"
          data-prop="opacity" data-type="${assetType}" data-index="${index}"
          oninput="updatePreviewAsset(this)">
      </div>

      <div class="preview-control-group">
        <label class="preview-checkbox-label">
          <input type="checkbox" ${asset.billboard !== false ? 'checked' : ''}
            data-prop="billboard" data-type="${assetType}" data-index="${index}"
            onchange="updatePreviewAsset(this)">
          <span>Always face camera (billboard)</span>
        </label>
      </div>
      
      <div class="preview-control-group">
        <div class="preview-control-label"><span>Visibility</span></div>
        <div class="preview-visibility-row">
          <label class="preview-checkbox-label small">
            <input type="checkbox" ${!asset.visibleIn || asset.visibleIn.includes('scan') ? 'checked' : ''}
              data-prop="visibleIn.scan" data-type="${assetType}" data-index="${index}"
              onchange="updatePreviewAsset(this)">
            <span>📱 Scan</span>
          </label>
          <label class="preview-checkbox-label small">
            <input type="checkbox" ${!asset.visibleIn || asset.visibleIn.includes('immersive') ? 'checked' : ''}
              data-prop="visibleIn.immersive" data-type="${assetType}" data-index="${index}"
              onchange="updatePreviewAsset(this)">
            <span>🥽 Immersive</span>
          </label>
        </div>
      </div>
    </div>
  `;

  initDragHandle(card);
  return card;
}

// Populate animation controls after models are loaded
function populateAnimationControls() {
  Object.entries(preview.animationData).forEach(([assetId, animData]) => {
    const container = document.getElementById(`anim-controls-${assetId}`);
    if (!container) return;
    
    const placeholder = container.querySelector('.anim-controls-placeholder');
    if (!placeholder) return;
    
    if (animData.clips.length === 0) {
      placeholder.textContent = 'No animations in model';
      return;
    }
    
    // Build animation clip options
    const clipOptions = animData.clips.map((clip, i) => 
      `<option value="${i}" ${i === animData.currentClipIndex ? 'selected' : ''}>${clip.name} (${clip.duration.toFixed(1)}s)</option>`
    ).join('');
    
    placeholder.outerHTML = `
      <label class="preview-checkbox-label">
        <input type="checkbox" ${animData.playing ? 'checked' : ''}
          data-anim-prop="enabled" data-asset-id="${assetId}"
          onchange="updateAnimationControl(this)">
        <span>Enable animation</span>
      </label>
      <div class="preview-control-subgroup">
        <label class="anim-select-label">Clip:</label>
        <select class="anim-clip-select" data-anim-prop="clip" data-asset-id="${assetId}"
          onchange="updateAnimationControl(this)">
          ${clipOptions}
        </select>
      </div>
      <div class="preview-control-subgroup">
        <div class="preview-control-label">
          <span>Speed</span>
          <span class="preview-control-value" id="speed-val-${assetId}">${animData.speed.toFixed(2)}x</span>
        </div>
        <input type="range" class="preview-slider" 
          min="0.1" max="3" step="0.1" 
          value="${animData.speed}"
          data-anim-prop="speed" data-asset-id="${assetId}"
          oninput="updateAnimationControl(this)">
      </div>
      <label class="preview-checkbox-label">
        <input type="checkbox" ${animData.loop ? 'checked' : ''}
          data-anim-prop="loop" data-asset-id="${assetId}"
          onchange="updateAnimationControl(this)">
        <span>Loop</span>
      </label>
    `;
  });
}

// Handle animation control changes
function updateAnimationControl(input) {
  const assetId = input.dataset.assetId;
  const prop = input.dataset.animProp;
  const animData = preview.animationData[assetId];
  
  if (!animData) return;
  
  switch (prop) {
    case 'enabled':
      animData.playing = input.checked;
      if (input.checked) {
        animData.action.play();
      } else {
        animData.action.stop();
      }
      break;
      
    case 'clip':
      const clipIndex = parseInt(input.value);
      if (clipIndex !== animData.currentClipIndex) {
        // Stop current action
        animData.action.stop();
        
        // Create new action for selected clip
        const newClip = animData.allClips[clipIndex];
        const newAction = animData.mixer.clipAction(newClip);
        newAction.timeScale = animData.speed;
        
        if (animData.loop) {
          newAction.setLoop(THREE.LoopRepeat);
        } else {
          newAction.setLoop(THREE.LoopOnce);
          newAction.clampWhenFinished = true;
        }
        
        if (animData.playing) {
          newAction.play();
        }
        
        animData.currentClipIndex = clipIndex;
        animData.action = newAction;
      }
      break;
      
    case 'speed':
      animData.speed = parseFloat(input.value);
      animData.action.timeScale = animData.speed;
      const speedLabel = document.getElementById(`speed-val-${assetId}`);
      if (speedLabel) speedLabel.textContent = animData.speed.toFixed(2) + 'x';
      break;
      
    case 'loop':
      animData.loop = input.checked;
      if (animData.loop) {
        animData.action.setLoop(THREE.LoopRepeat);
      } else {
        animData.action.setLoop(THREE.LoopOnce);
        animData.action.clampWhenFinished = true;
      }
      break;
  }
  
  // Update the JSON config for this asset
  updateAssetAnimationConfig(assetId);
}

// Update the character JSON with animation config
function updateAssetAnimationConfig(assetId) {
  const char = getSelectedCharacter();
  if (!char) return;
  
  const animData = preview.animationData[assetId];
  if (!animData) return;
  
  // Find the asset in the character's 3d assets
  const asset = char.assets?.['3d']?.find(a => a.id === assetId);
  if (!asset) return;
  
  if (animData.playing) {
    // Set or update animation config
    const clipName = animData.clips[animData.currentClipIndex]?.name;
    asset.animation = {
      clipName: clipName,
      speed: animData.speed,
      loop: animData.loop
    };
  } else {
    // Remove animation config if disabled
    delete asset.animation;
  }
  
  // Mark as modified
  markUnsaved();
}

function createLayerControlCard(key, layer, icon) {
  const card = document.createElement('div');
  card.className = 'preview-asset-card';
  card.dataset.layerKey = key;
  
  // Check if layer is visible in current mode
  const currentMode = preview.mode || 'immersive';
  const visibleIn = layer.visibleIn || ['scan', 'immersive'];
  const isHiddenInCurrentMode = !visibleIn.includes(currentMode);
  
  if (isHiddenInCurrentMode) {
    card.classList.add('hidden-in-mode');
  }
  
  card.dataset.orderType = 'layer';
  card.dataset.orderKey = key;
  card.addEventListener('dragstart', onCardDragStart);
  card.addEventListener('dragend', onCardDragEnd);
  card.addEventListener('dragover', onCardDragOver);
  card.addEventListener('drop', onCardDrop);

  card.innerHTML = `
    <div class="preview-asset-card-header" onclick="this.parentElement.classList.toggle('expanded')">
      <span class="drag-handle" title="Drag to reorder">⠿</span>
      <span class="preview-asset-name">${icon} ${key} ${isHiddenInCurrentMode ? '<span class="hidden-indicator">👁️‍🗨️</span>' : ''}</span>
      <span class="preview-asset-header-actions">
        <span class="preview-asset-type">${layer.type === 'video' ? 'VIDEO' : 'IMAGE'}</span>
        <button class="btn-delete-asset" data-layer="${key}" title="Delete layer" onclick="event.stopPropagation(); deleteLayerFromPreview('${key}')">✕</button>
      </span>
    </div>
    <div class="preview-asset-card-body">
      <div class="preview-control-group">
        <div class="preview-control-label">
          <span>Scale</span>
          <span class="preview-control-value" id="scale-val-layer-${key}">${(layer.scale || 1).toFixed(2)}</span>
        </div>
        <input type="range" class="preview-slider" 
          min="0.1" max="50" step="0.1" 
          value="${layer.scale || 1}"
          data-prop="scale" data-layer="${key}"
          oninput="updatePreviewLayer(this)">
      </div>
      
      <div class="preview-control-group">
        <div class="preview-control-label">
          <span>Scale X</span>
          <span class="preview-control-value" id="scaleX-val-layer-${key}">${(layer.scaleX || 1).toFixed(2)}</span>
        </div>
        <input type="range" class="preview-slider" 
          min="0.1" max="5" step="0.01" 
          value="${layer.scaleX || 1}"
          data-prop="scaleX" data-layer="${key}"
          oninput="updatePreviewLayer(this)">
      </div>
      
      <div class="preview-control-group">
        <div class="preview-control-label">
          <span>Scale Y</span>
          <span class="preview-control-value" id="scaleY-val-layer-${key}">${(layer.scaleY || 1).toFixed(2)}</span>
        </div>
        <input type="range" class="preview-slider"
          min="0.1" max="5" step="0.01"
          value="${layer.scaleY || 1}"
          data-prop="scaleY" data-layer="${key}"
          oninput="updatePreviewLayer(this)">
      </div>

      ${layer.type !== 'video' ? `
      <div class="preview-control-group">
        <div class="preview-control-label">
          <span>Scale Z (Depth)</span>
          <span class="preview-control-value" id="scaleZ-val-layer-${key}">${(layer.scaleZ || 1).toFixed(2)}</span>
        </div>
        <input type="range" class="preview-slider"
          min="0.1" max="5" step="0.01"
          value="${layer.scaleZ || 1}"
          data-prop="scaleZ" data-layer="${key}"
          oninput="updatePreviewLayer(this)">
      </div>
      ` : ''}
      
      <div class="preview-control-group">
        <div class="preview-control-label"><span>Position</span></div>
        <div class="preview-xyz-row">
          <div class="preview-xyz-input x">
            <label>X</label>
            <input type="number" step="0.01" value="${layer.position?.x || 0}"
              data-prop="position.x" data-layer="${key}"
              oninput="updatePreviewLayer(this)">
          </div>
          <div class="preview-xyz-input y">
            <label>Y</label>
            <input type="number" step="0.01" value="${layer.position?.y || 0}"
              data-prop="position.y" data-layer="${key}"
              oninput="updatePreviewLayer(this)">
          </div>
          <div class="preview-xyz-input z">
            <label>Z</label>
            <input type="number" step="0.01" value="${layer.position?.z || 0}"
              data-prop="position.z" data-layer="${key}"
              oninput="updatePreviewLayer(this)">
          </div>
        </div>
      </div>

      <div class="preview-control-group">
        <div class="preview-control-label"><span>Rotation (&deg;)</span></div>
        <div class="preview-xyz-row">
          <div class="preview-xyz-input x">
            <label>X</label>
            <input type="number" step="1" value="${layer.rotation?.x || 0}"
              data-prop="rotation.x" data-layer="${key}"
              oninput="updatePreviewLayer(this)">
          </div>
          <div class="preview-xyz-input y">
            <label>Y</label>
            <input type="number" step="1" value="${layer.rotation?.y || 0}"
              data-prop="rotation.y" data-layer="${key}"
              oninput="updatePreviewLayer(this)">
          </div>
          <div class="preview-xyz-input z">
            <label>Z</label>
            <input type="number" step="1" value="${layer.rotation?.z || 0}"
              data-prop="rotation.z" data-layer="${key}"
              oninput="updatePreviewLayer(this)">
          </div>
        </div>
      </div>

      ${layer.type !== 'video' ? `
      <div class="preview-control-group">
        <div class="preview-control-label">
          <span>Curvature</span>
          <span class="preview-control-value" id="curvature-val-layer-${key}">${(layer.curvature || 0).toFixed(1)}</span>
        </div>
        <input type="range" class="preview-slider"
          min="0" max="6.28" step="0.1"
          value="${layer.curvature || 0}"
          data-prop="curvature" data-layer="${key}"
          oninput="updatePreviewLayer(this)">
        <small style="color:var(--text-secondary);font-size:11px;">0 = flat · 3.14 = half-circle · 6.28 = full wrap</small>
      </div>
      <div class="preview-control-group">
        <div class="preview-control-label"><span>Curve Axis</span></div>
        <div class="preview-axis-toggle">
          <label><input type="radio" name="curveAxis-layer-${key}" value="x" ${(layer.curveAxis || 'x') === 'x' ? 'checked' : ''}
            data-prop="curveAxis" data-layer="${key}"
            onchange="updatePreviewLayer(this)"> Horizontal</label>
          <label><input type="radio" name="curveAxis-layer-${key}" value="y" ${layer.curveAxis === 'y' ? 'checked' : ''}
            data-prop="curveAxis" data-layer="${key}"
            onchange="updatePreviewLayer(this)"> Vertical</label>
        </div>
      </div>
      ` : ''}

      <div class="preview-control-group">
        <label class="preview-checkbox-label">
          <input type="checkbox" ${layer.billboard !== false ? 'checked' : ''}
            data-prop="billboard" data-layer="${key}"
            onchange="updatePreviewLayer(this)">
          <span>Always face camera (billboard)</span>
        </label>
      </div>
      
      <div class="preview-control-group">
        <div class="preview-control-label"><span>Visibility</span></div>
        <div class="preview-visibility-row">
          <label class="preview-checkbox-label small">
            <input type="checkbox" ${!layer.visibleIn || layer.visibleIn.includes('scan') ? 'checked' : ''}
              data-prop="visibleIn.scan" data-layer="${key}"
              onchange="updatePreviewLayer(this)">
            <span>📱 Scan</span>
          </label>
          <label class="preview-checkbox-label small">
            <input type="checkbox" ${!layer.visibleIn || layer.visibleIn.includes('immersive') ? 'checked' : ''}
              data-prop="visibleIn.immersive" data-layer="${key}"
              onchange="updatePreviewLayer(this)">
            <span>🥽 Immersive</span>
          </label>
        </div>
      </div>
      
      ${layer.type === 'video' ? `
      <div class="preview-control-group">
        <label class="preview-checkbox-label">
          <input type="checkbox" ${layer.loop !== false ? 'checked' : ''}
            data-prop="loop" data-layer="${key}"
            onchange="updatePreviewLayer(this)">
          <span>Loop</span>
        </label>
      </div>
      <div class="preview-control-group">
        <label class="preview-checkbox-label">
          <input type="checkbox" ${layer.muted !== false ? 'checked' : ''}
            data-prop="muted" data-layer="${key}"
            onchange="updatePreviewLayer(this)">
          <span>Muted</span>
        </label>
      </div>
      <div class="preview-control-group">
        <div class="preview-control-label">
          <span>Volume</span>
          <span class="preview-control-value" id="volume-val-${key}">${((layer.volume ?? 0) * 100).toFixed(0)}%</span>
        </div>
        <input type="range" class="preview-slider"
          min="0" max="1" step="0.01"
          value="${layer.volume ?? 0}"
          data-prop="volume" data-layer="${key}"
          oninput="updatePreviewLayer(this)">
      </div>
      <div class="preview-control-group">
        <div class="preview-control-label">
          <span>Chroma Key</span>
        </div>
        <div style="display:flex;gap:6px;align-items:center;">
          <input type="color" value="${layer.chromaKey || '#00FF00'}" style="width:36px;height:28px;border:none;padding:0;cursor:pointer;"
            data-prop="chromaKey" data-layer="${key}"
            oninput="updatePreviewLayer(this)">
          <input type="text" value="${layer.chromaKey || ''}" placeholder="none" style="flex:1;font-size:12px;"
            data-prop="chromaKeyText" data-layer="${key}"
            oninput="updatePreviewLayer(this)">
          <label class="preview-checkbox-label small" style="white-space:nowrap;">
            <input type="checkbox" ${layer.chromaKey ? 'checked' : ''}
              data-prop="chromaKeyEnabled" data-layer="${key}"
              onchange="updatePreviewLayer(this)">
            <span>On</span>
          </label>
        </div>
      </div>
      <div class="preview-control-group">
        <div class="preview-control-label">
          <span>Chroma Tolerance</span>
          <span class="preview-control-value" id="tolerance-val-${key}">${(layer.tolerance || 0.4).toFixed(2)}</span>
        </div>
        <input type="range" class="preview-slider"
          min="0.05" max="1" step="0.01"
          value="${layer.tolerance || 0.4}"
          data-prop="tolerance" data-layer="${key}"
          oninput="updatePreviewLayer(this)">
      </div>
      <div class="preview-control-group">
        <div class="preview-control-label">
          <span>Smoothness</span>
          <span class="preview-control-value" id="smoothness-val-${key}">${(layer.smoothness || 0.08).toFixed(2)}</span>
        </div>
        <input type="range" class="preview-slider"
          min="0.001" max="0.5" step="0.001"
          value="${layer.smoothness || 0.08}"
          data-prop="smoothness" data-layer="${key}"
          oninput="updatePreviewLayer(this)">
      </div>
      <div class="preview-control-group">
        <div class="preview-control-label">
          <span>Spill Suppression</span>
          <span class="preview-control-value" id="spill-val-${key}">${(layer.spill || 0.1).toFixed(2)}</span>
        </div>
        <input type="range" class="preview-slider"
          min="0" max="1" step="0.01"
          value="${layer.spill || 0.1}"
          data-prop="spill" data-layer="${key}"
          oninput="updatePreviewLayer(this)">
      </div>
      ` : ''}
    </div>
  `;

  initDragHandle(card);
  return card;
}

function createSoundControlCard(key, sound) {
  const card = document.createElement('div');
  card.className = 'preview-asset-card';
  card.dataset.soundKey = key;
  
  // Check if sound is visible in current mode
  const currentMode = preview.mode || 'scan';
  const visibleIn = sound.visibleIn || ['scan', 'immersive'];
  const isHiddenInCurrentMode = !visibleIn.includes(currentMode);
  
  if (isHiddenInCurrentMode) {
    card.classList.add('hidden-in-mode');
  }
  
  // Create audio element for preview
  let audioEl = preview.audios.find(a => a.key === key)?.audio;
  if (!audioEl) {
    audioEl = new Audio('../' + sound.path);
    audioEl.loop = sound.loop ?? true;
    audioEl.volume = sound.volume ?? 0.5;
    preview.audios.push({ key, audio: audioEl });
  }
  
  card.innerHTML = `
    <div class="preview-asset-card-header" onclick="this.parentElement.classList.toggle('expanded')">
      <span class="preview-asset-name">🔊 ${key} ${isHiddenInCurrentMode ? '<span class="hidden-indicator">👁️‍🗨️</span>' : ''}</span>
      <span class="preview-asset-header-actions">
        <span class="preview-asset-type">SOUND</span>
        <button class="btn-delete-asset" data-sound="${key}" title="Delete sound" onclick="event.stopPropagation(); deleteSoundFromPreview('${key}')">✕</button>
      </span>
    </div>
    <div class="preview-asset-card-body">
      <div class="preview-control-group">
        <div class="preview-control-label"><span>File Path</span></div>
        <input type="text" value="${sound.path || ''}" placeholder="assets/sound/..."
          style="width:100%;font-size:12px;"
          data-prop="path" data-sound="${key}"
          onchange="updatePreviewSound(this)">
      </div>

      <div class="preview-control-group">
        <label class="preview-checkbox-label">
          <input type="checkbox" ${sound.loop !== false ? 'checked' : ''}
            data-prop="loop" data-sound="${key}"
            onchange="updatePreviewSound(this)">
          <span>Loop</span>
        </label>
      </div>

      <div class="preview-control-group">
        <div class="preview-control-label">
          <span>Volume</span>
          <span class="preview-control-value" id="volume-val-sound-${key}">${((sound.volume ?? 0.5) * 100).toFixed(0)}%</span>
        </div>
        <input type="range" class="preview-slider"
          min="0" max="1" step="0.01"
          value="${sound.volume ?? 0.5}"
          data-prop="volume" data-sound="${key}"
          oninput="updatePreviewSound(this)">
      </div>

      <div class="preview-control-group">
        <div class="preview-control-label"><span>Position</span></div>
        <div class="preview-xyz-row">
          <div class="preview-xyz-input x">
            <label>X</label>
            <input type="number" step="0.1" value="${sound.position?.x || 0}"
              data-prop="position.x" data-sound="${key}"
              oninput="updatePreviewSound(this)">
          </div>
          <div class="preview-xyz-input y">
            <label>Y</label>
            <input type="number" step="0.1" value="${sound.position?.y || 1}"
              data-prop="position.y" data-sound="${key}"
              oninput="updatePreviewSound(this)">
          </div>
          <div class="preview-xyz-input z">
            <label>Z</label>
            <input type="number" step="0.1" value="${sound.position?.z || 0}"
              data-prop="position.z" data-sound="${key}"
              oninput="updatePreviewSound(this)">
          </div>
        </div>
      </div>

      <div class="preview-control-group">
        <div class="preview-control-label"><span>Rotation</span></div>
        <div class="preview-xyz-row">
          <div class="preview-xyz-input x">
            <label>X</label>
            <input type="number" step="1" value="${sound.rotation?.x || 0}"
              data-prop="rotation.x" data-sound="${key}"
              oninput="updatePreviewSound(this)">
          </div>
          <div class="preview-xyz-input y">
            <label>Y</label>
            <input type="number" step="1" value="${sound.rotation?.y || 0}"
              data-prop="rotation.y" data-sound="${key}"
              oninput="updatePreviewSound(this)">
          </div>
          <div class="preview-xyz-input z">
            <label>Z</label>
            <input type="number" step="1" value="${sound.rotation?.z || 0}"
              data-prop="rotation.z" data-sound="${key}"
              oninput="updatePreviewSound(this)">
          </div>
        </div>
      </div>

      <div class="preview-control-group">
        <div class="preview-control-label">
          <span>Cone Angle</span>
          <span class="preview-control-value" id="coneAngle-val-sound-${key}">${(sound.coneAngle || 60)}°</span>
        </div>
        <input type="range" class="preview-slider"
          min="10" max="360" step="5"
          value="${sound.coneAngle || 60}"
          data-prop="coneAngle" data-sound="${key}"
          oninput="updatePreviewSound(this)">
      </div>

      <div class="preview-control-group">
        <div class="preview-control-label">
          <span>Range</span>
          <span class="preview-control-value" id="maxDistance-val-sound-${key}">${(sound.maxDistance || 5).toFixed(1)}</span>
        </div>
        <input type="range" class="preview-slider"
          min="0.5" max="30" step="0.5"
          value="${sound.maxDistance || 5}"
          data-prop="maxDistance" data-sound="${key}"
          oninput="updatePreviewSound(this)">
      </div>

      <div class="preview-control-group">
        <div class="preview-control-label">
          <span>Ref Distance</span>
          <span class="preview-control-value" id="refDistance-val-sound-${key}">${(sound.refDistance || 1).toFixed(1)}</span>
        </div>
        <input type="range" class="preview-slider"
          min="0.1" max="10" step="0.1"
          value="${sound.refDistance || 1}"
          data-prop="refDistance" data-sound="${key}"
          oninput="updatePreviewSound(this)">
      </div>

      <div class="preview-control-group">
        <div class="preview-control-label">
          <span>Rolloff Factor</span>
          <span class="preview-control-value" id="rolloffFactor-val-sound-${key}">${(sound.rolloffFactor || 1).toFixed(1)}</span>
        </div>
        <input type="range" class="preview-slider"
          min="0.1" max="10" step="0.1"
          value="${sound.rolloffFactor || 1}"
          data-prop="rolloffFactor" data-sound="${key}"
          oninput="updatePreviewSound(this)">
      </div>

      <div class="preview-control-group">
        <div class="preview-control-label"><span>Visibility</span></div>
        <div class="preview-visibility-row">
          <label class="preview-checkbox-label small">
            <input type="checkbox" ${!sound.visibleIn || sound.visibleIn.includes('scan') ? 'checked' : ''}
              data-prop="visibleIn.scan" data-sound="${key}"
              onchange="updatePreviewSound(this)">
            <span>📱 Scan</span>
          </label>
          <label class="preview-checkbox-label small">
            <input type="checkbox" ${!sound.visibleIn || sound.visibleIn.includes('immersive') ? 'checked' : ''}
              data-prop="visibleIn.immersive" data-sound="${key}"
              onchange="updatePreviewSound(this)">
            <span>🥽 Immersive</span>
          </label>
        </div>
      </div>
      <div class="preview-control-group" style="flex-direction: row; gap: 8px;">
        <button class="preview-sound-btn" onclick="togglePreviewSound('${key}')" id="sound-toggle-${key}">
          ▶️ Play
        </button>
        <button class="preview-sound-btn" onclick="stopPreviewSound('${key}')">
          ⏹️ Stop
        </button>
      </div>
    </div>
  `;

  return card;
}

function updatePreviewSound(input) {
  const prop = input.dataset.prop;
  const soundKey = input.dataset.sound;
  const isCheckbox = input.type === 'checkbox';
  const isText = input.type === 'text';
  const value = isCheckbox ? input.checked : (isText ? input.value : parseFloat(input.value));

  // Update value displays
  if (!isCheckbox && !isText) {
    if (prop === 'volume') {
      const valDisplay = document.getElementById(`volume-val-sound-${soundKey}`);
      if (valDisplay) valDisplay.textContent = (value * 100).toFixed(0) + '%';
    } else if (prop === 'coneAngle') {
      const valDisplay = document.getElementById(`coneAngle-val-sound-${soundKey}`);
      if (valDisplay) valDisplay.textContent = value + '°';
    } else if (prop === 'maxDistance') {
      const valDisplay = document.getElementById(`maxDistance-val-sound-${soundKey}`);
      if (valDisplay) valDisplay.textContent = value.toFixed(1);
    } else if (prop === 'refDistance') {
      const valDisplay = document.getElementById(`refDistance-val-sound-${soundKey}`);
      if (valDisplay) valDisplay.textContent = value.toFixed(1);
    } else if (prop === 'rolloffFactor') {
      const valDisplay = document.getElementById(`rolloffFactor-val-sound-${soundKey}`);
      if (valDisplay) valDisplay.textContent = value.toFixed(1);
    }
  }

  // Update audio element
  const audioInfo = preview.audios.find(a => a.key === soundKey);
  if (audioInfo?.audio) {
    if (prop === 'volume') audioInfo.audio.volume = value;
    else if (prop === 'loop') audioInfo.audio.loop = value;
    else if (prop === 'path') { audioInfo.audio.src = '../' + value; }
  }

  // Update 3D sound indicator mesh
  const indicator = preview.meshes.find(m => m.userData.soundKey === soundKey);
  if (indicator) {
    if (prop.startsWith('position.')) {
      const axis = prop.split('.')[1];
      indicator.position[axis] = value;
    } else if (prop.startsWith('rotation.')) {
      const axis = prop.split('.')[1];
      indicator.rotation[axis] = THREE.MathUtils.degToRad(value);
    } else if (prop === 'coneAngle' || prop === 'maxDistance') {
      // Rebuild cone with new parameters
      const char = getSelectedCharacter();
      const soundData = char?.sounds?.[soundKey];
      const angle = prop === 'coneAngle' ? value : (soundData?.coneAngle || 60);
      const range = prop === 'maxDistance' ? value : (soundData?.maxDistance || 5);
      const oldCone = indicator.userData.cone;
      if (oldCone) {
        oldCone.geometry.dispose();
        oldCone.material.dispose();
        indicator.remove(oldCone);
      }
      const newCone = buildSoundCone(angle, range);
      newCone.userData.isSoundCone = true;
      indicator.add(newCone);
      indicator.userData.cone = newCone;
    }
  }

  // Auto-save to data if enabled
  if (document.getElementById('preview-autosave')?.checked) {
    const char = getSelectedCharacter();
    if (char?.sounds?.[soundKey]) {
      if (prop === 'volume') {
        char.sounds[soundKey].volume = value;
      } else if (prop.startsWith('position.')) {
        if (!char.sounds[soundKey].position) {
          char.sounds[soundKey].position = { x: 0, y: 1, z: 0 };
        }
        const axis = prop.split('.')[1];
        char.sounds[soundKey].position[axis] = value;
      } else if (prop.startsWith('rotation.')) {
        if (!char.sounds[soundKey].rotation) {
          char.sounds[soundKey].rotation = { x: 0, y: 0, z: 0 };
        }
        const axis = prop.split('.')[1];
        char.sounds[soundKey].rotation[axis] = value;
      } else if (prop === 'coneAngle') {
        char.sounds[soundKey].coneAngle = value;
      } else if (prop === 'maxDistance') {
        char.sounds[soundKey].maxDistance = value;
      } else if (prop === 'refDistance') {
        char.sounds[soundKey].refDistance = value;
      } else if (prop === 'rolloffFactor') {
        char.sounds[soundKey].rolloffFactor = value;
      } else if (prop === 'loop') {
        char.sounds[soundKey].loop = value;
      } else if (prop === 'path') {
        char.sounds[soundKey].path = value;
      } else if (prop.startsWith('visibleIn.')) {
        const mode = prop.split('.')[1];
        let currentVisibleIn = char.sounds[soundKey].visibleIn;
        if (!currentVisibleIn) {
          currentVisibleIn = ['scan', 'immersive'];
          char.sounds[soundKey].visibleIn = currentVisibleIn;
        }

        if (value && !currentVisibleIn.includes(mode)) {
          currentVisibleIn.push(mode);
        } else if (!value) {
          const idx = currentVisibleIn.indexOf(mode);
          if (idx > -1) currentVisibleIn.splice(idx, 1);
        }

        // Update indicator visibility
        if (indicator) {
          indicator.visible = currentVisibleIn.includes(preview.mode);
          indicator.userData.visibleIn = [...currentVisibleIn];
        }

        // Update card visual indicator
        const currentMode = preview.mode || 'scan';
        const newVisible = currentVisibleIn.includes(currentMode);
        const card = document.querySelector(`.preview-asset-card[data-sound-key="${soundKey}"]`);
        if (card) {
          if (newVisible) {
            card.classList.remove('hidden-in-mode');
          } else {
            card.classList.add('hidden-in-mode');
          }
          const nameSpan = card.querySelector('.preview-asset-name');
          if (nameSpan) {
            const indicator = nameSpan.querySelector('.hidden-indicator');
            if (!newVisible && !indicator) {
              nameSpan.insertAdjacentHTML('beforeend', '<span class="hidden-indicator">👁️‍🗨️</span>');
            } else if (newVisible && indicator) {
              indicator.remove();
            }
          }
        }
      }
      markUnsaved();
    }
  }
}

function togglePreviewSound(key) {
  const audioInfo = preview.audios.find(a => a.key === key);
  if (!audioInfo?.audio) return;
  
  const btn = document.getElementById(`sound-toggle-${key}`);
  
  if (audioInfo.audio.paused) {
    audioInfo.audio.play().then(() => {
      if (btn) btn.textContent = '⏸️ Pause';
    }).catch(e => console.warn('Audio play failed:', e));
  } else {
    audioInfo.audio.pause();
    if (btn) btn.textContent = '▶️ Play';
  }
}

function stopPreviewSound(key) {
  const audioInfo = preview.audios.find(a => a.key === key);
  if (!audioInfo?.audio) return;
  
  audioInfo.audio.pause();
  audioInfo.audio.currentTime = 0;
  
  const btn = document.getElementById(`sound-toggle-${key}`);
  if (btn) btn.textContent = '▶️ Play';
}

/**
 * Build a 3D sound indicator: a speaker icon (canvas sprite) + wireframe cone showing direction.
 * Returns a THREE.Group with .userData.cone for live updates.
 */
function buildSoundIndicator(sound, key) {
  const group = new THREE.Group();
  group.userData.soundKey = key;
  group.userData.isSoundIndicator = true;

  // --- Speaker icon as a canvas sprite ---
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  // Circle background
  ctx.fillStyle = '#6366f1';
  ctx.beginPath();
  ctx.arc(64, 64, 56, 0, Math.PI * 2);
  ctx.fill();
  // Speaker body
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(36, 46, 18, 36);
  // Speaker cone
  ctx.beginPath();
  ctx.moveTo(54, 46);
  ctx.lineTo(76, 28);
  ctx.lineTo(76, 100);
  ctx.lineTo(54, 82);
  ctx.closePath();
  ctx.fill();
  // Sound waves
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(76, 64, 8 + i * 8, -Math.PI * 0.35, Math.PI * 0.35);
    ctx.stroke();
  }

  const spriteTex = new THREE.CanvasTexture(canvas);
  const spriteMat = new THREE.SpriteMaterial({ map: spriteTex, depthTest: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(0.4, 0.4, 0.4);
  group.add(sprite);

  // --- Wireframe cone showing sound direction ---
  const coneAngle = sound.coneAngle || 60;
  const coneRange = sound.maxDistance || 5;
  const cone = buildSoundCone(coneAngle, coneRange);
  cone.userData.isSoundCone = true;
  group.add(cone);
  group.userData.cone = cone;

  // Always render on top of visual assets
  group.renderOrder = 9999;
  sprite.renderOrder = 9999;
  cone.renderOrder = 9998;

  // Position & rotation
  const pos = sound.position || { x: 0, y: 1, z: 0 };
  group.position.set(pos.x, pos.y, pos.z);
  const rot = sound.rotation || { x: 0, y: 0, z: 0 };
  group.rotation.set(
    THREE.MathUtils.degToRad(rot.x),
    THREE.MathUtils.degToRad(rot.y),
    THREE.MathUtils.degToRad(rot.z)
  );

  return group;
}

/**
 * Build a wireframe cone mesh representing sound spread.
 * Opens along -Z (forward direction).
 */
function buildSoundCone(angleDeg, range) {
  const halfAngle = THREE.MathUtils.degToRad(angleDeg / 2);
  const radius = Math.tan(halfAngle) * range;
  const segments = 24;
  const geo = new THREE.ConeGeometry(radius, range, segments, 1, true);
  // ConeGeometry points along +Y by default; rotate so it points along -Z
  geo.rotateX(Math.PI / 2);
  // Shift so apex is at origin (the sound source)
  geo.translate(0, 0, -range / 2);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x6366f1,
    wireframe: true,
    transparent: true,
    opacity: 0.35,
    depthTest: false
  });
  return new THREE.Mesh(geo, mat);
}

/**
 * Migrate old wrapShape/wrapRadius values to the new curvature model.
 * Returns curvature in radians (0 = flat).
 */
function migrateCurvature(obj) {
  if (obj.curvature != null) return obj.curvature;
  // Migrate from old shape-based system
  const shape = obj.wrapShape || 'plane';
  if (shape === 'plane' || !shape) return 0;
  if (shape === 'half-cylinder') return Math.PI;
  if (shape === 'cylinder-270') return Math.PI * 1.5;
  if (shape === 'cylinder') return Math.PI * 2;
  if (shape === 'bend') return obj.wrapRadius || 2;
  return 0;
}

/**
 * Build a geometry for a 2D asset based on its wrap/bend settings.
 * shape: 'plane' or 'bend'
 * radius: bend amount — 0 = flat, higher = more curved (acts as arc angle in radians, e.g. 1 = ~57°, 3.14 = 180°, 6.28 = 360°)
 * aspectRatio: width/height of the texture
 */
function buildWrapGeometry(shape, radius, aspectRatio, curveAxis) {
  if (shape === 'plane' || !shape) {
    return new THREE.PlaneGeometry(aspectRatio, 1);
  }
  return buildBentPlane(aspectRatio, 1, radius, curveAxis);
}

/**
 * Creates a subdivided plane bent into a circular arc.
 * width/height: plane dimensions before bending
 * bendAngle: total arc angle in radians (0 = flat, PI = half-circle, 2*PI = full circle)
 * curveAxis: 'x' (horizontal bend, default) or 'y' (vertical bend)
 */
function buildBentPlane(width, height, bendAngle, curveAxis) {
  if (bendAngle <= 0.01) return new THREE.PlaneGeometry(width, height);

  const isVertical = curveAxis === 'y';
  const span = isVertical ? height : width;
  const segments = Math.max(32, Math.round(bendAngle * 16));
  const segX = isVertical ? 1 : segments;
  const segY = isVertical ? segments : 1;
  const geo = new THREE.PlaneGeometry(width, height, segX, segY);
  const pos = geo.attributes.position;

  const R = span / (2 * Math.sin(bendAngle / 2));

  for (let i = 0; i < pos.count; i++) {
    const coord = isVertical ? pos.getY(i) : pos.getX(i);
    const angle = (coord / span) * bendAngle;
    const newCoord = R * Math.sin(angle);
    const newZ = R * (1 - Math.cos(angle));
    if (isVertical) {
      pos.setY(i, newCoord);
    } else {
      pos.setX(i, newCoord);
    }
    pos.setZ(i, newZ);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

function updatePreviewAsset(input) {
  const prop = input.dataset.prop;
  const assetType = input.dataset.type;
  const index = parseInt(input.dataset.index);
  const isCheckbox = input.type === 'checkbox';
  const isRadio = input.type === 'radio';
  const isSelect = input.tagName === 'SELECT';
  const value = isCheckbox ? input.checked : (isSelect || isRadio ? input.value : parseFloat(input.value));

  // Update value display (skip for checkboxes and selects)
  if (!isCheckbox && !isSelect) {
    const propName = prop.split('.')[0];
    const valDisplay = document.getElementById(`${propName}-val-${assetType}-${index}`);
    if (valDisplay) valDisplay.textContent = typeof value === 'number' ? value.toFixed(2) : value;
  }

  // Find the mesh
  const char = getSelectedCharacter();
  const assetId = char?.assets?.[assetType]?.[index]?.id;
  const mesh = preview.meshes.find(m => m.userData.assetId === assetId);

  if (!mesh) {
    console.warn('Mesh not found for asset:', assetType, index, assetId);
    return;
  }

  // Update mesh
  if (prop === 'scale') {
    mesh.userData.baseScale = value;
    if (assetType === '3d') {
      mesh.scale.set(value, value, value);
    } else {
      const sx = mesh.userData.scaleX || 1;
      const sy = mesh.userData.scaleY || 1;
      const sz = mesh.userData.scaleZ || 1;
      mesh.scale.set(value * sx, value * sy, sz);
    }
  } else if (prop === 'scaleX') {
    mesh.userData.scaleX = value;
    const base = mesh.userData.baseScale || 1;
    mesh.scale.x = base * value;
  } else if (prop === 'scaleY') {
    mesh.userData.scaleY = value;
    const base = mesh.userData.baseScale || 1;
    mesh.scale.y = base * value;
  } else if (prop === 'scaleZ') {
    mesh.scale.z = value;
    mesh.userData.scaleZ = value;
  } else if (prop.startsWith('position.')) {
    const axis = prop.split('.')[1];
    if (axis === 'x') mesh.position.x = value;
    else if (axis === 'y') mesh.position.y = value;
    else if (axis === 'z') mesh.position.z = value;
  } else if (prop.startsWith('rotation.')) {
    const axis = prop.split('.')[1];
    const radians = THREE.MathUtils.degToRad(value);
    if (axis === 'x') mesh.rotation.x = radians;
    else if (axis === 'y') mesh.rotation.y = radians;
    else if (axis === 'z') mesh.rotation.z = radians;
    if (!mesh.userData.baseRotation) mesh.userData.baseRotation = { x: 0, y: 0, z: 0 };
    mesh.userData.baseRotation[axis] = value;
  } else if (prop === 'opacity') {
    if (mesh.material) mesh.material.opacity = value;
  } else if (prop === 'order') {
    mesh.renderOrder = Math.round(value * 10);
  } else if (prop === 'billboard') {
    mesh.userData.billboard = value;
    if (!value) mesh.userData.needsRotationReset = true;
  } else if (prop === 'curveAxis') {
    mesh.userData.curveAxis = value;
    // Rebuild geometry if currently curved
    const curCurvature = migrateCurvature(char?.assets?.[assetType]?.[index] || {});
    if (curCurvature > 0.01) {
      const aspect = mesh.userData.aspectRatio || 1;
      const oldGeo = mesh.geometry;
      mesh.geometry = buildWrapGeometry('bend', curCurvature, aspect, value);
      oldGeo.dispose();
    }
  } else if (prop === 'curvature') {
    // Rebuild geometry with new curvature
    const aspect = mesh.userData.aspectRatio || 1;
    const cAxis = mesh.userData.curveAxis || 'x';
    const shape = value > 0.01 ? 'bend' : 'plane';
    const oldGeo = mesh.geometry;
    const newGeo = buildWrapGeometry(shape, value, aspect, cAxis);
    mesh.geometry = newGeo;
    oldGeo.dispose();
    mesh.userData.wrapShape = value > 0.01 ? 'bend' : null;
    // Auto-disable billboard when curved
    if (value > 0.01) {
      mesh.userData.billboard = false;
      const card = document.querySelector(`.preview-asset-card[data-asset-id="${assetId}"]`);
      if (card) {
        const bbCheckbox = card.querySelector('[data-prop="billboard"]');
        if (bbCheckbox) bbCheckbox.checked = false;
      }
    }
    const valDisplay = document.getElementById(`curvature-val-${assetType}-${index}`);
    if (valDisplay) valDisplay.textContent = value.toFixed(1);
  } else if (prop.startsWith('visibleIn.')) {
    // Handle visibility toggle for scan/immersive mode
    const mode = prop.split('.')[1]; // 'scan' or 'immersive'
    let currentVisibleIn = mesh.userData.visibleIn;
    if (!currentVisibleIn) {
      currentVisibleIn = ['scan', 'immersive'];
      mesh.userData.visibleIn = currentVisibleIn;
    }
    
    if (value && !currentVisibleIn.includes(mode)) {
      currentVisibleIn.push(mode);
    } else if (!value) {
      const idx = currentVisibleIn.indexOf(mode);
      if (idx > -1) currentVisibleIn.splice(idx, 1);
    }
    
    // Update mesh visibility based on current preview mode
    const currentMode = preview.mode || 'scan';
    const newVisible = currentVisibleIn.includes(currentMode);
    mesh.visible = newVisible;
    
    // Update card visual indicator
    const card = document.querySelector(`.preview-asset-card[data-asset-id="${assetId}"]`);
    if (card) {
      if (newVisible) {
        card.classList.remove('hidden-in-mode');
      } else {
        card.classList.add('hidden-in-mode');
      }
      const nameSpan = card.querySelector('.preview-asset-name');
      if (nameSpan) {
        const indicator = nameSpan.querySelector('.hidden-indicator');
        if (!newVisible && !indicator) {
          nameSpan.insertAdjacentHTML('beforeend', '<span class="hidden-indicator">👁️‍🗨️</span>');
        } else if (newVisible && indicator) {
          indicator.remove();
        }
      }
    }
  }
  
  // Auto-save to data if enabled
  if (document.getElementById('preview-autosave')?.checked) {
    if (char?.assets?.[assetType]?.[index]) {
      if (prop === 'scale') {
        char.assets[assetType][index].scale = value;
      } else if (prop === 'scaleX') {
        char.assets[assetType][index].scaleX = value;
      } else if (prop === 'scaleY') {
        char.assets[assetType][index].scaleY = value;
      } else if (prop === 'scaleZ') {
        char.assets[assetType][index].scaleZ = value;
      } else if (prop.startsWith('position.')) {
        if (!char.assets[assetType][index].position) {
          char.assets[assetType][index].position = { x: 0, y: 0, z: 0 };
        }
        const axis = prop.split('.')[1];
        char.assets[assetType][index].position[axis] = value;
      } else if (prop.startsWith('rotation.')) {
        if (!char.assets[assetType][index].rotation) {
          char.assets[assetType][index].rotation = { x: 0, y: 0, z: 0 };
        }
        const axis = prop.split('.')[1];
        char.assets[assetType][index].rotation[axis] = value;
      } else if (prop === 'opacity') {
        char.assets[assetType][index].opacity = value;
      } else if (prop === 'order') {
        char.assets[assetType][index].order = value;
      } else if (prop === 'billboard') {
        char.assets[assetType][index].billboard = value;
      } else if (prop.startsWith('visibleIn.')) {
        // Save visibleIn array from mesh userData
        if (mesh?.userData.visibleIn) {
          char.assets[assetType][index].visibleIn = [...mesh.userData.visibleIn];
        }
      } else if (prop === 'curveAxis') {
        char.assets[assetType][index].curveAxis = value;
      } else if (prop === 'curvature') {
        char.assets[assetType][index].curvature = value;
        // Clean up old properties if present
        delete char.assets[assetType][index].wrapShape;
        delete char.assets[assetType][index].wrapRadius;
      }
      markUnsaved();
    }
  }
}

function updatePreviewLayer(input) {
  const prop = input.dataset.prop;
  const layerKey = input.dataset.layer;
  const isCheckbox = input.type === 'checkbox';
  const isRadio = input.type === 'radio';
  const isSelect = input.tagName === 'SELECT';
  const value = isCheckbox ? input.checked : (isSelect || isRadio ? input.value : parseFloat(input.value));

  // Update value display (skip for checkboxes and selects)
  if (!isCheckbox && !isSelect) {
    const propName = prop.split('.')[0];
    const valDisplay = document.getElementById(`${propName}-val-${layerKey}`) || 
                       document.getElementById(`${propName}-val-layer-${layerKey}`);
    if (valDisplay) {
      if (prop === 'volume') {
        valDisplay.textContent = (value * 100).toFixed(0) + '%';
      } else {
        valDisplay.textContent = value.toFixed(2);
      }
    }
  }
  
  // Find the mesh
  const mesh = preview.meshes.find(m => m.userData.layerKey === layerKey);
  
  if (!mesh) {
    console.warn('Mesh not found for layer:', layerKey, 'Available:', preview.meshes.map(m => m.userData.layerKey));
    return;
  }
  
  // Update mesh
  if (prop === 'scale') {
    // Preserve scaleX/scaleY/scaleZ when updating scale
    const scaleX = mesh.userData.scaleX || 1;
    const scaleY = mesh.userData.scaleY || 1;
    mesh.scale.set(value * scaleX, value * scaleY, mesh.userData.scaleZ || 1);
    mesh.userData.baseScale = value;
  } else if (prop === 'scaleX') {
    const baseScale = mesh.userData.baseScale || 1;
    const scaleY = mesh.userData.scaleY || 1;
    mesh.scale.set(baseScale * value, baseScale * scaleY, mesh.userData.scaleZ || 1);
    mesh.userData.scaleX = value;
  } else if (prop === 'scaleY') {
    // Update scaleY while preserving base scale and scaleX
    const baseScale = mesh.userData.baseScale || 1;
    const scaleX = mesh.userData.scaleX || 1;
    mesh.scale.set(baseScale * scaleX, baseScale * value, mesh.userData.scaleZ || 1);
    mesh.userData.scaleY = value;
  } else if (prop === 'scaleZ') {
    mesh.scale.z = value;
    mesh.userData.scaleZ = value;
  } else if (prop.startsWith('position.')) {
    const axis = prop.split('.')[1];
    if (axis === 'x') mesh.position.x = value;
    else if (axis === 'y') mesh.position.y = value;
    else if (axis === 'z') mesh.position.z = value;
  } else if (prop.startsWith('rotation.')) {
    const axis = prop.split('.')[1];
    const radians = THREE.MathUtils.degToRad(value);
    if (axis === 'x') mesh.rotation.x = radians;
    else if (axis === 'y') mesh.rotation.y = radians;
    else if (axis === 'z') mesh.rotation.z = radians;
    if (!mesh.userData.baseRotation) mesh.userData.baseRotation = { x: 0, y: 0, z: 0 };
    mesh.userData.baseRotation[axis] = value;
  } else if (prop === 'curveAxis') {
    mesh.userData.curveAxis = value;
    const curCurvature = migrateCurvature(char?.layers?.[layerKey] || {});
    if (curCurvature > 0.01) {
      const aspect = mesh.userData.aspectRatio || 1;
      const oldGeo = mesh.geometry;
      mesh.geometry = buildWrapGeometry('bend', curCurvature, aspect, value);
      oldGeo.dispose();
    }
  } else if (prop === 'curvature') {
    const aspect = mesh.userData.aspectRatio || 1;
    const cAxis = mesh.userData.curveAxis || 'x';
    const shape = value > 0.01 ? 'bend' : 'plane';
    const oldGeo = mesh.geometry;
    const newGeo = buildWrapGeometry(shape, value, aspect, cAxis);
    mesh.geometry = newGeo;
    oldGeo.dispose();
    mesh.userData.wrapShape = value > 0.01 ? 'bend' : null;
    if (value > 0.01) {
      mesh.userData.billboard = false;
      const card = document.querySelector(`.preview-asset-card[data-layer-key="${layerKey}"]`);
      if (card) {
        const bbCheckbox = card.querySelector('[data-prop="billboard"]');
        if (bbCheckbox) bbCheckbox.checked = false;
      }
    }
    const valDisplay = document.getElementById(`curvature-val-layer-${layerKey}`);
    if (valDisplay) valDisplay.textContent = value.toFixed(1);
  } else if (prop === 'order') {
    mesh.renderOrder = Math.round(value * 10);
  } else if (prop === 'billboard') {
    // Store billboard setting on mesh userData for preview render loop
    mesh.userData.billboard = value;
    if (!value) mesh.userData.needsRotationReset = true;
  } else if (prop.startsWith('visibleIn.')) {
    // Handle visibility toggle for scan/immersive mode
    const mode = prop.split('.')[1]; // 'scan' or 'immersive'
    let currentVisibleIn = mesh.userData.visibleIn;
    if (!currentVisibleIn) {
      currentVisibleIn = ['scan', 'immersive'];
      mesh.userData.visibleIn = currentVisibleIn;
    }
    if (value && !currentVisibleIn.includes(mode)) {
      currentVisibleIn.push(mode);
    } else if (!value) {
      const idx = currentVisibleIn.indexOf(mode);
      if (idx > -1) currentVisibleIn.splice(idx, 1);
    }
    // Update mesh visibility based on current preview mode
    const currentMode = preview.mode || state.previewMode || 'immersive';
    const newVisible = currentVisibleIn.includes(currentMode);
    mesh.visible = newVisible;
    
    // Update card visual indicator
    const card = document.querySelector(`.preview-asset-card[data-layer-key="${layerKey}"]`);
    if (card) {
      if (newVisible) {
        card.classList.remove('hidden-in-mode');
      } else {
        card.classList.add('hidden-in-mode');
      }
      // Update hidden indicator in header
      const nameSpan = card.querySelector('.preview-asset-name');
      if (nameSpan) {
        const indicator = nameSpan.querySelector('.hidden-indicator');
        if (!newVisible && !indicator) {
          nameSpan.insertAdjacentHTML('beforeend', '<span class="hidden-indicator">👁️‍🗨️</span>');
        } else if (newVisible && indicator) {
          indicator.remove();
        }
      }
    }
  } else if (prop === 'volume') {
    // Update video volume
    const videoInfo = preview.videos?.find(v => v.layerKey === layerKey);
    if (videoInfo?.video) {
      videoInfo.video.muted = value === 0;
      videoInfo.video.volume = value;
    }
  } else if (prop === 'tolerance' || prop === 'smoothness' || prop === 'spill') {
    // Update shader uniform
    if (mesh.material?.uniforms) {
      if (prop === 'tolerance') mesh.material.uniforms.similarity.value = value;
      else if (prop === 'smoothness') mesh.material.uniforms.smoothness.value = value;
      else if (prop === 'spill') mesh.material.uniforms.spill.value = value;
    }
  } else if (prop === 'loop') {
    const videoInfo = preview.videos?.find(v => v.layerKey === layerKey);
    if (videoInfo?.video) videoInfo.video.loop = value;
  } else if (prop === 'muted') {
    const videoInfo = preview.videos?.find(v => v.layerKey === layerKey);
    if (videoInfo?.video) videoInfo.video.muted = value;
  } else if (prop === 'chromaKey' || prop === 'chromaKeyText') {
    // Sync color picker and text input
    const card = input.closest('.preview-asset-card');
    if (prop === 'chromaKey') {
      const textInput = card.querySelector('[data-prop="chromaKeyText"]');
      if (textInput) textInput.value = input.value;
    } else {
      const colorInput = card.querySelector('[data-prop="chromaKey"]');
      if (colorInput && /^#[0-9a-fA-F]{6}$/.test(input.value)) colorInput.value = input.value;
    }
    // Update shader uniform (uniform is named keyColor, not chromaKey)
    if (mesh.material?.uniforms?.keyColor) {
      const hex = input.value;
      if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        mesh.material.uniforms.keyColor.value.set(r, g, b);
      }
    }
  } else if (prop === 'chromaKeyEnabled') {
    // Toggle chroma keying — requires scene reload to swap material
    const char = getSelectedCharacter();
    if (char?.layers?.[layerKey]) {
      if (value) {
        const card = input.closest('.preview-asset-card');
        const colorInput = card.querySelector('[data-prop="chromaKey"]');
        char.layers[layerKey].chromaKey = colorInput?.value || '#00FF00';
        char.layers[layerKey].tolerance = char.layers[layerKey].tolerance ?? 0.4;
        char.layers[layerKey].smoothness = char.layers[layerKey].smoothness ?? 0.08;
        char.layers[layerKey].spill = char.layers[layerKey].spill ?? 0.5;
      } else {
        delete char.layers[layerKey].chromaKey;
        delete char.layers[layerKey].tolerance;
        delete char.layers[layerKey].smoothness;
        delete char.layers[layerKey].spill;
      }
      markUnsaved();
      loadPreviewAssets(char);
      return;
    }
  }
  
  // Auto-save to data if enabled
  if (document.getElementById('preview-autosave')?.checked) {
    const char = getSelectedCharacter();
    if (char?.layers?.[layerKey]) {
      if (prop === 'scale') {
        char.layers[layerKey].scale = value;
      } else if (prop === 'scaleX') {
        char.layers[layerKey].scaleX = value;
      } else if (prop === 'scaleY') {
        char.layers[layerKey].scaleY = value;
      } else if (prop === 'scaleZ') {
        char.layers[layerKey].scaleZ = value;
      } else if (prop.startsWith('position.')) {
        if (!char.layers[layerKey].position) {
          char.layers[layerKey].position = { x: 0, y: 0, z: 0 };
        }
        const axis = prop.split('.')[1];
        char.layers[layerKey].position[axis] = value;
      } else if (prop.startsWith('rotation.')) {
        if (!char.layers[layerKey].rotation) {
          char.layers[layerKey].rotation = { x: 0, y: 0, z: 0 };
        }
        const axis = prop.split('.')[1];
        char.layers[layerKey].rotation[axis] = value;
      } else if (prop === 'curveAxis') {
        char.layers[layerKey].curveAxis = value;
      } else if (prop === 'curvature') {
        char.layers[layerKey].curvature = value;
        // Clean up old properties if present
        delete char.layers[layerKey].wrapShape;
        delete char.layers[layerKey].wrapRadius;
      } else if (prop === 'order') {
        char.layers[layerKey].order = value;
      } else if (prop === 'billboard') {
        char.layers[layerKey].billboard = value;
      } else if (prop === 'volume') {
        char.layers[layerKey].volume = value;
      } else if (prop === 'loop') {
        char.layers[layerKey].loop = value;
      } else if (prop === 'muted') {
        char.layers[layerKey].muted = value;
      } else if (prop === 'chromaKey' || prop === 'chromaKeyText') {
        const hex = input.value;
        if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
          char.layers[layerKey].chromaKey = hex;
        }
      } else if (prop === 'tolerance') {
        char.layers[layerKey].tolerance = value;
      } else if (prop === 'smoothness') {
        char.layers[layerKey].smoothness = value;
      } else if (prop === 'spill') {
        char.layers[layerKey].spill = value;
      } else if (prop.startsWith('visibleIn.')) {
        // Save visibleIn array from mesh userData
        const mesh = preview.meshes.find(m => m.userData.layerKey === layerKey);
        if (mesh?.userData.visibleIn) {
          char.layers[layerKey].visibleIn = [...mesh.userData.visibleIn];
        }
      }
      markUnsaved();
    }
  }
}

// Panel toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('preview-panel-toggle');
  const panel = document.getElementById('preview-panel');
  
  if (toggleBtn && panel) {
    toggleBtn.addEventListener('click', () => {
      panel.classList.toggle('collapsed');
    });
  }
});
