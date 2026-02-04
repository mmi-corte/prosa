/**
 * Préchargement des assets critiques pour la PWA
 * Lancé dès le démarrage pour remplir le cache du navigateur
 */

class AssetPreloader {
  constructor() {
    this.preloadedCount = 0;
    this.failedCount = 0;
    this.startTime = Date.now();
  }

  /**
   * Liste des assets critiques à précharger
   */
  getCriticalAssets() {
    return {
      // Logos et branding
      logos: [
        './assets/logo/prosa-logo.png',
        './assets/logo/logo_prosa.svg',
        './assets/logo/prosa-o.svg',
        './assets/logo/chargement.png',
      ],
      
      // Images des joueurs
      playerCharacters: [
        './assets/playersCharacters/bastianu.webp',
        './assets/playersCharacters/leo.webp',
        './assets/playersCharacters/livia.webp',
        './assets/playersCharacters/marc.webp',
        './assets/playersCharacters/orsetta.webp',
        './assets/playersCharacters/valerie.webp',
        './assets/playersCharacters/wide_bastianu.webp',
        './assets/playersCharacters/wide_leo.webp',
        './assets/playersCharacters/wide_livia.webp',
        './assets/playersCharacters/wide_marc.webp',
        './assets/playersCharacters/wide_orsetta.webp',
        './assets/playersCharacters/wide_valerie.webp',
      ],
      
      // Personnages du jeu
      storyCharacters: [
        './assets/characters/AStrega.jpg',
        './assets/characters/Fulettu.jpg',
        './assets/characters/Mazzeru.jpg',
        './assets/characters/Orcu.jpg',
        './assets/characters/Signadora.jpg',
        './assets/characters/SquadradArozza.jpg',
        './assets/characters/UMagu.jpg',
        './assets/characters/UStrigone.jpg',
        './assets/characters/spallistu.jpg',
      ],
      
      // UI et icônes
      ui: [
        './assets/favicon/favicon.svg',
        './assets/drapeau/bandera.png',
        './assets/drapeau/france.png',
      ],
      
      // Animations Lottie
      animations: [
        './assets/lottie/prosa-o.json',
      ],
      
      // Données JSON
      data: [
        './data/characters.json',
        './data/choices.json',
        './data/cinematiques.json',
        './data/dialogs.json',
        './data/games.json',
        './data/playersCharacters.json',
        './data/riddles.json',
        './data/steps.json',
      ],
      
      // Styles
      styles: [
        './styles.css',
        './assets/styles.css',
      ],
    };
  }

  /**
   * Précharge un asset unique
   */
  async preloadAsset(url) {
    try {
      const response = await fetch(url, { 
        method: 'GET',
        cache: 'force-cache' 
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      // Consommer la réponse pour s'assurer qu'elle est complètement chargée
      await response.blob();
      
      this.preloadedCount++;
      console.log(`✅ Préchargé: ${url}`);
      return true;
    } catch (error) {
      this.failedCount++;
      console.warn(`⚠️ Erreur préchargement ${url}:`, error.message);
      return false;
    }
  }

  /**
   * Précharge tous les assets par catégorie
   */
  async preloadAll() {
    console.log('🚀 Démarrage du préchargement des assets...');
    
    const allAssets = this.getCriticalAssets();
    const flattenedAssets = Object.values(allAssets).flat();
    
    // Précharger par groupes (évite de surcharger le réseau)
    const batchSize = 5;
    
    for (let i = 0; i < flattenedAssets.length; i += batchSize) {
      const batch = flattenedAssets.slice(i, i + batchSize);
      await Promise.all(batch.map(asset => this.preloadAsset(asset)));
      
      // Petit délai entre les groupes
      if (i + batchSize < flattenedAssets.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    this.logSummary();
  }

  /**
   * Affiche un résumé du préchargement
   */
  logSummary() {
    const duration = Date.now() - this.startTime;
    const total = this.preloadedCount + this.failedCount;
    const successRate = ((this.preloadedCount / total) * 100).toFixed(1);
    
    console.log(`\n📊 Résumé du préchargement:`);
    console.log(`   ✅ Réussis: ${this.preloadedCount}/${total}`);
    console.log(`   ❌ Échoués: ${this.failedCount}/${total}`);
    console.log(`   ⏱️ Durée: ${duration}ms`);
    console.log(`   📈 Taux de réussite: ${successRate}%\n`);
    
    // Marquer le préchargement comme terminé
    window.assetPreloadComplete = true;
    window.dispatchEvent(new CustomEvent('assetPreloadComplete', { 
      detail: { 
        preloadedCount: this.preloadedCount,
        failedCount: this.failedCount,
        duration 
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
