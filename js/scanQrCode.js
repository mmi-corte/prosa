import QrScanner from 'https://cdn.jsdelivr.net/npm/qr-scanner@1.4.0/qr-scanner.min.js';

QrScanner.WORKER_PATH = 'https://cdn.jsdelivr.net/npm/qr-scanner@1.4.0/qr-scanner-worker.min.js';

export function startQrScanner(scannerContainerId, sceneUrl) {
    return new Promise((resolve, reject) => {
        const videoElement = document.createElement('video');
        videoElement.id = 'scanner-container';
        videoElement.style.width = '100%';
        videoElement.style.height = '100%';

        const container = document.getElementById(scannerContainerId);
        if (!container) {
            console.error('Le conteneur spécifié n\'existe pas.');
            reject('Le conteneur est introuvable');
            return;
        }
        container.appendChild(videoElement);

        const qrScanner = new QrScanner(videoElement, (result) => {
            console.log('QR code détecté : ', result.data);
            qrScanner.stop();

            if (result.data.trim() === sceneUrl.trim()) {
                console.log('Redirection vers la scène AR.');
                window.location.href = sceneUrl; // Redirige vers la scène AR
                resolve(true);
            } else {
                console.error('QR code invalide !');
                reject('URL invalide détectée.');
            }
        }, {
            highlightScanRegion: true,
            highlightCodeOutline: true,
        });

        qrScanner.start().catch(err => {
            console.error('Erreur lors du démarrage du scanner :', err);
            reject(err);
        });

        qrScanner._onDecodeFailure = () => {
            console.log('Aucune détection de QR code pour le moment...');
        };
    });
}