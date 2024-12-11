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
        if (container) {
            container.appendChild(videoElement);
        } else {
            console.error('Le conteneur spécifié n\'existe pas.');
            reject('Le conteneur est introuvable');
            return;
        }

        // Initialisation du scanner QR
        const qrScanner = new QrScanner(videoElement, (result) => {
            console.log('QR code détecté : ', result.data);
            // Si l'URL scannée correspond à l'URL attendue
            if (result.data === expectedUrl) {
                console.log('QR code valide!');
                resolve(true);  // Résoudre avec `true` si QR code valide
            } else {
                console.log('QR code invalide!');
                resolve(false);  // Résoudre avec `false` si QR code invalide
            }
            qrScanner.stop(); // Arrêter le scanner après avoir trouvé un QR code
        });

        // Démarrer le scanner
        qrScanner.start().catch(err => {
            console.error('Erreur lors du démarrage du scanner :', err);
            reject(err); // Rejeter en cas d'erreur
        });
    });
}
