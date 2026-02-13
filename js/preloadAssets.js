/**
 * Préchargement des assets critiques pour la PWA
 * Système à 4 niveaux de priorité : critical, high, normal, low
 * Charge dynamiquement depuis assets-manifest.json
 * Utilise le système centralisé de debug logging
 */

// PWA Debug Logger System
// Debug mode is OFF by default - enable with toggleDebug(true) in console
const storedDebugMode = localStorage.getItem('DEBUG_MODE');
let DEBUG_MODE = storedDebugMode === 'true';

const COLORS = {
  APP: '#4a90e2',
  SW: '#7ed321',
  PRELOAD: '#f5a623',
  ROUTING: '#bd10e0',
  DATA: '#50e3c2',
  OFFLINE: '#d0021b',
  PERF: '#7ed321',
};

const createLogger = (module) => {
  const color = COLORS[module] || '#999999';

  return {
    log: (...args) => {
      if (DEBUG_MODE) {
        console.log(
          `%c[${module}]`,
          `color: ${color}; font-weight: bold;`,
          ...args
        );
      }
    },
    warn: (...args) => {
      console.warn(
        `%c[${module}]`,
        `color: #f5a623; font-weight: bold;`,
        ...args
      );
    },
    error: (...args) => {
      console.error(
        `%c[${module}]`,
        `color: #d0021b; font-weight: bold;`,
        ...args
      );
    },
    perf: (label, duration) => {
      if (DEBUG_MODE) {
        console.log(
          `%c[${module}] ⏱️ ${label}`,
          `color: #7ed321; font-weight: bold;`,
          `${duration.toFixed(2)}ms`
        );
      }
    },
  };
};

const toggleDebug = (enabled) => {
  DEBUG_MODE = enabled; // Update global DEBUG_MODE
  localStorage.setItem('DEBUG_MODE', enabled ? 'true' : 'false');
  console.log(
    `%c🐛 Debug mode: ${enabled ? '✅ ON' : '❌ OFF'}`,
    'color: #f5a623; font-size: 14px; font-weight: bold;'
  );
  if (enabled) {
    console.log(
      '%cAvailable: logger("APP"), logger("SW"), logger("PRELOAD"), logger("ROUTING"), logger("DATA"), logger("OFFLINE")',
      'color: #4a90e2; font-size: 12px;'
    );
  }
};

// Pre-instantiate common loggers to avoid duplication
const preloadLog = createLogger('PRELOAD');
const appLog = createLogger('APP');
const swLog = createLogger('SW');

if (DEBUG_MODE) {
  console.log(
    '%c🐛 DEBUG MODE ENABLED - Type toggleDebug(false) to disable',
    'color: #f5a623; font-size: 14px; font-weight: bold;'
  );
}

// Export for module use
window.logger = createLogger;
window.preloadLog = preloadLog;
window.appLog = appLog;
window.swLog = swLog;
window.toggleDebug = toggleDebug;
window.DEBUG_MODE = DEBUG_MODE;

// Log resource loads (JS, CSS, images, media, etc.)
const startResourceLogging = (loggerInstance) => {
  if (window.__resourceLoggingStarted) return;
  window.__resourceLoggingStarted = true;

  const loggerToUse = loggerInstance || createLogger('PRELOAD');
  const priorityIcons = {
    critical: '🔥',
    high: '⚡',
    normal: '📦',
    low: '🧊',
    unknown: '❔'
  };
  const priorityOrder = ['critical', 'high', 'normal', 'low', 'unknown'];
  const counts = {
    critical: 0,
    high: 0,
    normal: 0,
    low: 0,
    unknown: 0
  };
  const typeCounts = {};
  const loggedResources = new Set();
  const grouped = {
    critical: [],
    high: [],
    normal: [],
    low: [],
    unknown: []
  };
  let manifestMap = null;

  const normalizePath = (url) => {
    try {
      const parsed = new URL(url, window.location.href);
      return parsed.pathname.replace(/^\//, '');
    } catch (err) {
      return String(url).replace(/^\.\//, '').replace(/^\//, '');
    }
  };

  const buildManifestMap = (manifest) => {
    const map = new Map();
    Object.keys(manifest).forEach((priority) => {
      (manifest[priority] || []).forEach((item) => {
        map.set(normalizePath(item), priority);
      });
    });
    return map;
  };

  const resolvePriority = (name, fetchPriority) => {
    if (manifestMap) {
      const normalized = normalizePath(name);
      const mapped = manifestMap.get(normalized);
      if (mapped) return mapped;
    }
    if (fetchPriority === 'high') return 'high';
    if (fetchPriority === 'low') return 'low';
    return 'unknown';
  };

  const resolveType = (entryName, rawType) => {
    if (rawType !== 'fetch') return rawType;

    const normalized = normalizePath(entryName);
    const isManifestAsset = manifestMap ? manifestMap.has(normalized) : false;
    const isJson = /\.json($|[?#])/.test(entryName) || entryName.includes('/data/');

    if (isManifestAsset) return 'preload';
    if (isJson) return 'data';
    return 'request';
  };

  const logHeader = () => {
    // Header supprimé - seulement le résumé final
  };

  const logSummary = () => {
    // Résumé partiellement supprimé - garder seulement les alertes si needed
  };

  const initManifest = async () => {
    if (window.__assetManifest) {
      manifestMap = buildManifestMap(window.__assetManifest);
      if (DEBUG_MODE) loggerToUse.log('📋 Manifest reused for priority mapping.');
      return;
    }
    try {
      const response = await fetch('./assets-manifest.json', { cache: 'force-cache' });
      if (!response.ok) return;
      const manifest = await response.json();
      window.__assetManifest = manifest;
      manifestMap = buildManifestMap(manifest);
      if (DEBUG_MODE) loggerToUse.log('📋 Manifest loaded for priority mapping.');
    } catch (err) {
      loggerToUse.warn('Manifest not available for priority mapping.', err);
    }
  };

  initManifest();

  if (!('PerformanceObserver' in window)) {
    loggerToUse.warn('PerformanceObserver not supported; resource timing unavailable.');
    return;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const normalizedName = normalizePath(entry.name);
        if (loggedResources.has(normalizedName)) return;
        loggedResources.add(normalizedName);

        const priority = resolvePriority(entry.name, 'auto');
        const displayType = resolveType(entry.name, entry.initiatorType);
        counts[priority] += 1;
        typeCounts[displayType] = (typeCounts[displayType] || 0) + 1;
        grouped[priority].push({
          name: entry.name,
          type: displayType,
          duration: entry.duration
        });
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  } catch (err) {
    loggerToUse.error('Failed to start resource observer', err);
  }

  window.addEventListener('load', () => {
    setTimeout(() => {
      if (DEBUG_MODE) {
        priorityOrder.forEach((priority) => {
          const list = grouped[priority];
          if (!list || list.length === 0) return;
          loggerToUse.log(`\n${priorityIcons[priority]} Phase ${priority.toUpperCase()}`);
          list
            .sort((a, b) => a.duration - b.duration)
            .forEach((item) => {
              loggerToUse.log(
                `✅ [${priority.toUpperCase()}] ${item.type}`,
                {
                  name: item.name,
                  duration: `${item.duration.toFixed(2)}ms`
                }
              );
            });
        });
      }
      logSummary();
    }, 0);
  }, { once: true });
};

// Créer un logger centralisé pour le preload
const preloadLogger = createLogger('PRELOAD');
const log = (...args) => {
  preloadLogger.log(...args);
};

class AssetPreloader {
  constructor() {
    this.stats = {
      critical: { loaded: 0, failed: 0 },
      high: { loaded: 0, failed: 0 },
      normal: { loaded: 0, failed: 0 },
      low: { loaded: 0, failed: 0 }
    };
    this.startTime = Date.now();
    this.manifest = null;
  }

  /**
   * Charge le manifest des assets
   */
  async loadManifest() {
    try {
      const response = await fetch('./assets-manifest.json', { cache: 'force-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this.manifest = await response.json();
      this.manifest.critical = this.manifest.critical || [];
      this.manifest.high = this.manifest.high || [];
      this.manifest.normal = this.manifest.normal || [];
      this.manifest.low = this.manifest.low || [];
      window.__assetManifest = this.manifest;
      return true;
    } catch (error) {
      console.error('❌ Erreur chargement manifest:', error);
      return false;
    }
  }

  /**
   * Précharge un asset unique
   */
  async preloadAsset(url, priority) {
    try {
      const response = await fetch(url, { 
        method: 'GET',
        cache: 'force-cache' 
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      // Consommer la réponse pour s'assurer qu'elle est mise en cache
      await response.blob();
      
      this.stats[priority].loaded++;
      return true;
    } catch (error) {
      this.stats[priority].failed++;
      // Only log errors if DEBUG_MODE is enabled
      if (DEBUG_MODE) {
        console.warn(`⚠️ [${priority.toUpperCase()}] Erreur ${url}:`, error.message);
      }
      return false;
    }
  }

  /**
   * Précharge un groupe d'assets par paquets
   */
  async preloadBatch(assets, priority, batchSize = 5, delayBetweenBatches = 50) {
    if (!assets || assets.length === 0) {
      return;
    }

    const startTime = Date.now();

    for (let i = 0; i < assets.length; i += batchSize) {
      const batch = assets.slice(i, i + batchSize);
      await Promise.all(batch.map(asset => this.preloadAsset(asset, priority)));
      
      // Petit délai entre les paquets pour ne pas saturer le réseau
      if (i + batchSize < assets.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }
  }

  /**
   * Précharge tous les assets selon leur priorité
   */
  async preloadAll() {
    // Charger le manifest
    const manifestLoaded = await this.loadManifest();
    if (!manifestLoaded) {
      console.error('❌ Impossible de charger le manifest, abandon du préchargement');
      return;
    }

    // CRITICAL: Chargé immédiatement (T=0s)
    await this.preloadBatch(this.manifest.critical, 'critical', 5, 0);

    // HIGH: Après 500ms
    await new Promise(resolve => setTimeout(resolve, 500));
    await this.preloadBatch(this.manifest.high, 'high', 5, 50);

    // NORMAL: Après 2 secondes supplémentaires
    await new Promise(resolve => setTimeout(resolve, 2000));
    await this.preloadBatch(this.manifest.normal, 'normal', 3, 100);

    // LOW: Chargement en arriere-plan, un par un
    if (this.manifest.low.length > 0) {
      await this.preloadBatch(this.manifest.low, 'low', 1, 50);
    }

    this.logSummary();
  }

  /**
   * Charge les assets low à la demande
   */
  async preloadLow(specificAssets = null) {
    const assetsToLoad = specificAssets || this.manifest.low;
    await this.preloadBatch(assetsToLoad, 'low', 1, 50);
  }

  /**
   * Affiche un résumé complet du préchargement
   */
  logSummary() {
    const duration = Date.now() - this.startTime;
    const totalLoaded = Object.values(this.stats).reduce((sum, s) => sum + s.loaded, 0);
    const totalFailed = Object.values(this.stats).reduce((sum, s) => sum + s.failed, 0);
    const total = totalLoaded + totalFailed;
    const successRate = total > 0 ? ((totalLoaded / total) * 100).toFixed(1) : 0;
    
    if (DEBUG_MODE) {
      log(`\n${'='.repeat(60)}`);
      log(`📊 RÉSUMÉ DU PRÉCHARGEMENT`);
      log(`${'='.repeat(60)}`);
      log(`🔥 CRITICAL: ${this.stats.critical.loaded} chargés, ${this.stats.critical.failed} échoués`);
      log(`⚡ HIGH:     ${this.stats.high.loaded} chargés, ${this.stats.high.failed} échoués`);
      log(`📦 NORMAL:   ${this.stats.normal.loaded} chargés, ${this.stats.normal.failed} échoués`);
      log(`🧊 LOW:      ${this.stats.low.loaded} chargés, ${this.stats.low.failed} échoués`);
      log(`${'—'.repeat(60)}`);
      log(`✅ Total réussis: ${totalLoaded}/${total}`);
      log(`❌ Total échoués: ${totalFailed}/${total}`);
      log(`⏱️ Durée totale: ${(duration / 1000).toFixed(2)}s`);
      log(`📈 Taux de réussite: ${successRate}%`);
      log(`${'='.repeat(60)}\n`);
    }
    
    // Marquer le préchargement comme terminé
    window.assetPreloadComplete = true;
    window.assetPreloader = this; // Rendre le preloader accessible globalement
    window.dispatchEvent(new CustomEvent('assetPreloadComplete', { 
      detail: { 
        stats: this.stats,
        totalLoaded,
        totalFailed,
        duration,
        successRate: parseFloat(successRate)
      } 
    }));
  }
}

/**
 * Lance le préchargement dès que le DOM est prêt
 */
function initPreloader() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const preloader = new AssetPreloader();
      preloader.preloadAll();
    });
  } else {
    const preloader = new AssetPreloader();
    preloader.preloadAll();
  }
}

// Démarrer immédiatement
initPreloader();

export { createLogger, toggleDebug, DEBUG_MODE, startResourceLogging };
