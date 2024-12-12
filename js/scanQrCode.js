import QrScanner from 'https://cdn.jsdelivr.net/npm/qr-scanner@1.4.0/qr-scanner.min.js';

export function startQrScanner(scannerContainerId, expectedUrl) {
    return new Promise((resolve, reject) => {
        // Crée un élément vidéo dynamiquement
        const videoElement = document.createElement('video');
        videoElement.id = 'scanner-container';
        videoElement.style.width = '100%';
        videoElement.style.height = '100%';

        // Ajouter l'élément vidéo au conteneur spécifié
        const container = document.getElementById(scannerContainerId);
        if (!container) {
            console.error('Le conteneur spécifié n\'existe pas.');
            reject('Le conteneur est introuvable');
            return;
        }
        container.appendChild(videoElement);

        // Initialisation du scanner QR
        const qrScanner = new QrScanner(videoElement, (result) => {
            console.log('QR code détecté : ', result.data);

            // Vérifier si l'URL scannée correspond à l'URL attendue
            if (result.data.trim() === expectedUrl.trim()) {
                console.log('QR code valide!');
                qrScanner.stop(); // Arrêter le scanner immédiatement
                resolve(true); // Résoudre avec `true` si le QR code est valide
            } else {
                console.log('QR code invalide!');
                qrScanner.stop(); // Arrêter le scanner même si invalide
                resolve(false); // Résoudre avec `false` si le QR code est invalide
            }
        }, {
            // Paramètres supplémentaires si nécessaires
            highlightScanRegion: true, // Met en surbrillance la zone scannée
            highlightCodeOutline: true // Met en surbrillance les contours détectés
        });

        // Démarrer le scanner
        qrScanner.start().catch(err => {
            console.error('Erreur lors du démarrage du scanner :', err);
            reject(err); // Rejeter en cas d'erreur
        });

        // Nettoyage si nécessaire lorsque le scanner est arrêté
        qrScanner._onDecodeFailure = () => {
            console.log('Aucune détection de QR code pour le moment...');
        };
    });
}
