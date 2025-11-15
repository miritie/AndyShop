/**
 * Service Google Drive
 * Gestion de la capture photo et upload sur Google Drive
 */

window.GoogleDriveService = {
  apiKey: null,
  clientId: null,
  accessToken: null,
  folderId: null,
  isInitialized: false,

  /**
   * Initialise le service Google Drive
   */
  async init() {
    this.apiKey = AppConfig.googleDrive.apiKey;
    this.clientId = AppConfig.googleDrive.clientId;
    this.folderId = AppConfig.googleDrive.folderId;

    if (!this.apiKey || !this.clientId) {
      throw new Error('Configuration Google Drive manquante');
    }

    // Charger les bibliothèques Google API
    await this.loadGoogleAPI();
    this.isInitialized = true;
  },

  /**
   * Charge les bibliothèques Google API
   */
  async loadGoogleAPI() {
    return new Promise((resolve, reject) => {
      // Si déjà chargé
      if (window.gapi && window.google) {
        resolve();
        return;
      }

      // Charger gapi
      const gapiScript = document.createElement('script');
      gapiScript.src = 'https://apis.google.com/js/api.js';
      gapiScript.onload = () => {
        window.gapi.load('client:auth2', () => {
          window.gapi.client.init({
            apiKey: this.apiKey,
            clientId: this.clientId,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
            scope: 'https://www.googleapis.com/auth/drive.file'
          }).then(() => {
            resolve();
          }).catch(reject);
        });
      };
      gapiScript.onerror = reject;
      document.head.appendChild(gapiScript);
    });
  },

  /**
   * Autorise l'accès à Google Drive
   */
  async authorize() {
    if (!this.isInitialized) {
      await this.init();
    }

    const authInstance = window.gapi.auth2.getAuthInstance();

    if (authInstance.isSignedIn.get()) {
      this.accessToken = authInstance.currentUser.get().getAuthResponse().access_token;
      return true;
    }

    try {
      await authInstance.signIn();
      this.accessToken = authInstance.currentUser.get().getAuthResponse().access_token;
      return true;
    } catch (error) {
      console.error('Erreur autorisation Google Drive:', error);
      throw new Error('Autorisation Google Drive refusée');
    }
  },

  /**
   * Upload un fichier sur Google Drive
   */
  async uploadFile(blob, filename, folderId = null) {
    if (!this.accessToken) {
      await this.authorize();
    }

    const metadata = {
      name: filename,
      mimeType: blob.type
    };

    if (folderId) {
      metadata.parents = [folderId];
    }

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      },
      body: form
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Erreur upload: ${error.error.message}`);
    }

    const file = await response.json();

    // Rendre le fichier public
    await this.makeFilePublic(file.id);

    // Retourner le lien de visualisation directe
    return `https://drive.google.com/uc?export=view&id=${file.id}`;
  },

  /**
   * Rend un fichier public
   */
  async makeFilePublic(fileId) {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone'
      })
    });

    if (!response.ok) {
      console.error('Impossible de rendre le fichier public');
    }
  },

  /**
   * Capture une photo et l'upload sur Google Drive
   * Retourne l'URL du fichier
   */
  async captureAndUpload() {
    try {
      // Demander l'accès à la caméra
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Caméra arrière par défaut
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      // Créer le modal de capture
      const modal = this.createCameraModal(stream);
      document.body.appendChild(modal);

      // Retourner une promesse qui se résoudra avec l'URL
      return new Promise((resolve, reject) => {
        modal.dataset.resolve = 'resolve';
        modal.dataset.reject = 'reject';

        // Stocker les callbacks
        window._cameraResolve = resolve;
        window._cameraReject = reject;
      });

    } catch (error) {
      console.error('Erreur accès caméra:', error);

      if (error.name === 'NotAllowedError') {
        throw new Error('Accès à la caméra refusé. Veuillez autoriser l\'accès dans les paramètres.');
      } else if (error.name === 'NotFoundError') {
        throw new Error('Aucune caméra trouvée sur cet appareil.');
      } else {
        throw new Error('Impossible d\'accéder à la caméra: ' + error.message);
      }
    }
  },

  /**
   * Crée le modal de capture photo
   */
  createCameraModal(stream) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';

    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content" style="max-width: 600px; height: auto;">
        <div class="modal-header">
          <h3>Capturer la preuve de paiement</h3>
        </div>
        <div class="modal-body" style="padding: 0; position: relative;">
          <video id="camera-preview" autoplay playsinline style="width: 100%; max-height: 60vh; background: #000;"></video>
          <canvas id="camera-canvas" style="display: none;"></canvas>

          <div style="position: absolute; bottom: 20px; left: 0; right: 0; text-align: center;">
            <button id="capture-btn" class="btn btn-primary" style="border-radius: 50%; width: 70px; height: 70px; font-size: 2rem;">
              📷
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="cancel-camera-btn">Annuler</button>
        </div>
      </div>
    `;

    const video = modal.querySelector('#camera-preview');
    video.srcObject = stream;

    // Bouton capturer
    modal.querySelector('#capture-btn').onclick = () => {
      this.capturePhoto(modal, video, stream);
    };

    // Bouton annuler
    modal.querySelector('#cancel-camera-btn').onclick = () => {
      stream.getTracks().forEach(track => track.stop());
      modal.remove();
      if (window._cameraReject) {
        window._cameraReject(new Error('Capture annulée'));
      }
    };

    return modal;
  },

  /**
   * Capture la photo et l'upload
   */
  async capturePhoto(modal, video, stream) {
    try {
      UIComponents.showToast('Capture en cours...', 'info');

      const canvas = modal.querySelector('#camera-canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      // Convertir en blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.85);
      });

      // Arrêter la caméra
      stream.getTracks().forEach(track => track.stop());

      // Remplacer le contenu du modal par un aperçu
      const modalBody = modal.querySelector('.modal-body');
      modalBody.innerHTML = `
        <div style="padding: var(--spacing-md); text-align: center;">
          <img src="${canvas.toDataURL()}" style="max-width: 100%; max-height: 50vh; border-radius: 8px;" />
          <p style="margin-top: var(--spacing-md); color: var(--color-text-secondary);">
            Upload en cours sur Google Drive...
          </p>
        </div>
      `;

      // Upload sur Google Drive
      const filename = `preuve_paiement_${Date.now()}.jpg`;
      const url = await this.uploadFile(blob, filename, this.folderId);

      UIComponents.showToast('Photo uploadée avec succès', 'success');

      // Fermer le modal
      modal.remove();

      // Résoudre la promesse avec l'URL
      if (window._cameraResolve) {
        window._cameraResolve(url);
      }

    } catch (error) {
      console.error('Erreur capture photo:', error);

      // Arrêter la caméra
      stream.getTracks().forEach(track => track.stop());
      modal.remove();

      if (window._cameraReject) {
        window._cameraReject(error);
      }

      throw error;
    }
  }
};
