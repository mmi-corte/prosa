/**
 * Préchargement des assets critiques pour la PWA
 * Système à 4 niveaux de priorité : critical, high, normal, lazy
 * Charge dynamiquement depuis assets-manifest.json
 */

// Toggle console.log output for this script
const SHOW_PRELOAD_LOGS = false; // Set to true or false to enable/disable detailed logs
const PRELOAD_LOG_PREFIX = '[PWA preload]';
const log = (...args) => {
  if (SHOW_PRELOAD_LOGS) console.log(PRELOAD_LOG_PREFIX, ...args);
};

class AssetPreloader {
  constructor() {
    this.stats = {
      critical: { loaded: 0, failed: 0 },
      high: { loaded: 0, failed: 0 },
      normal: { loaded: 0, failed: 0 },
      lazy: { loaded: 0, failed: 0 }
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
      log('📋 Manifest chargé:', {
        critical: this.manifest.critical.length,
        high: this.manifest.high.length,
        normal: this.manifest.normal.length,
        lazy: this.manifest.lazy.length
      });
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
      log(`✅ [${priority.toUpperCase()}] ${url}`);
      return true;
    } catch (error) {
      this.stats[priority].failed++;
      console.warn(`⚠️ [${priority.toUpperCase()}] Erreur ${url}:`, error.message);
      return false;
    }
  }

  /**
   * Précharge un groupe d'assets par paquets
   */
  async preloadBatch(assets, priority, batchSize = 5, delayBetweenBatches = 50) {
    if (!assets || assets.length === 0) {
      log(`⏭️ Aucun asset à charger pour la priorité ${priority}`);
      return;
    }

    log(`🚀 Chargement ${priority}: ${assets.length} assets (par ${batchSize})`);
    const startTime = Date.now();

    for (let i = 0; i < assets.length; i += batchSize) {
      const batch = assets.slice(i, i + batchSize);
      await Promise.all(batch.map(asset => this.preloadAsset(asset, priority)));
      
      // Petit délai entre les paquets pour ne pas saturer le réseau
      if (i + batchSize < assets.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    const duration = Date.now() - startTime;
    log(`✓ ${priority} terminé en ${duration}ms (${this.stats[priority].loaded}/${assets.length})`);
  }

  /**
   * Précharge tous les assets selon leur priorité
   */
  async preloadAll() {
    log('🎯 Démarrage du système de préchargement avec priorités...\n');
    
    // Charger le manifest
    const manifestLoaded = await this.loadManifest();
    if (!manifestLoaded) {
      console.error('❌ Impossible de charger le manifest, abandon du préchargement');
      return;
    }

    // CRITICAL: Chargé immédiatement (T=0s)
    log('\n🔥 Phase CRITICAL (T+0s)');
    await this.preloadBatch(this.manifest.critical, 'critical', 5, 0);

    // HIGH: Après 500ms
    await new Promise(resolve => setTimeout(resolve, 500));
    log('\n⚡ Phase HIGH (T+500ms)');
    await this.preloadBatch(this.manifest.high, 'high', 5, 50);

    // NORMAL: Après 2 secondes supplémentaires
    await new Promise(resolve => setTimeout(resolve, 2000));
    log('\n📦 Phase NORMAL (T+2.5s)');
    await this.preloadBatch(this.manifest.normal, 'normal', 3, 100);

    // LAZY: Jamais chargé automatiquement (uniquement à la demande)
    if (this.manifest.lazy.length > 0) {
      log(`\n💤 ${this.manifest.lazy.length} assets en mode LAZY (chargés à la demande)`);
    }

    this.logSummary();
  }

  /**
   * Charge les assets lazy à la demande
   */
  async preloadLazy(specificAssets = null) {
    const assetsToLoad = specificAssets || this.manifest.lazy;
    log(`\n🎯 Chargement LAZY à la demande: ${assetsToLoad.length} assets`);
    await this.preloadBatch(assetsToLoad, 'lazy', 5, 50);
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
    
    log(`\n${'='.repeat(60)}`);
    log(`📊 RÉSUMÉ DU PRÉCHARGEMENT`);
    log(`${'='.repeat(60)}`);
    log(`🔥 CRITICAL: ${this.stats.critical.loaded} chargés, ${this.stats.critical.failed} échoués`);
    log(`⚡ HIGH:     ${this.stats.high.loaded} chargés, ${this.stats.high.failed} échoués`);
    log(`📦 NORMAL:   ${this.stats.normal.loaded} chargés, ${this.stats.normal.failed} échoués`);
    log(`💤 LAZY:     ${this.stats.lazy.loaded} chargés, ${this.stats.lazy.failed} échoués`);
    log(`${'—'.repeat(60)}`);
    log(`✅ Total réussis: ${totalLoaded}/${total}`);
    log(`❌ Total échoués: ${totalFailed}/${total}`);
    log(`⏱️ Durée totale: ${(duration / 1000).toFixed(2)}s`);
    log(`📈 Taux de réussite: ${successRate}%`);
    log(`${'='.repeat(60)}\n`);
    
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
