/**
 * Service d'upload d'images
 * Gère l'upload d'images vers un service externe ou base64
 */

window.ImageUploadService = {
  /**
   * Upload une image (routeur principal)
   * @param {File} file - Fichier image à uploader
   * @returns {Promise<string>} URL de l'image uploadée
   */
  async upload(file) {
    const provider = AppConfig?.storage?.provider || 'local';

    // Choisir le provider d'upload
    switch (provider) {
      case 'googledrive':
        return this.uploadToGoogleDrive(file);
      case 'onedrive':
        return this.uploadToOneDrive(file);
      case 'cloudinary':
        return this.uploadToCloudinary(file);
      case 'local':
      default:
        return this.uploadAsBase64(file);
    }
  },

  /**
   * Upload en base64 (fallback local)
   * @param {File} file - Fichier image à uploader
   * @returns {Promise<string>} Data URL base64
   */
  async uploadAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Redimensionner l'image si nécessaire
          const maxWidth = 800;
          const maxHeight = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          // Créer un canvas pour redimensionner
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convertir en base64
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(dataUrl);
        };

        img.onerror = () => {
          reject(new Error('Erreur lors du chargement de l\'image'));
        };

        img.src = e.target.result;
      };

      reader.onerror = () => {
        reject(new Error('Erreur lors de la lecture du fichier'));
      };

      reader.readAsDataURL(file);
    });
  },

  /**
   * Upload vers Cloudinary (si configuré)
   * @param {File} file - Fichier image
   * @returns {Promise<string>} URL de l'image sur Cloudinary
   */
  async uploadToCloudinary(file) {
    const cloudinaryConfig = AppConfig?.cloudinary;

    if (!cloudinaryConfig?.cloudName || !cloudinaryConfig?.uploadPreset) {
      throw new Error('Cloudinary n\'est pas configuré');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload vers Cloudinary');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Erreur upload Cloudinary:', error);
      throw error;
    }
  },

  /**
   * Upload vers Google Drive
   * @param {File} file - Fichier image
   * @returns {Promise<string>} URL de l'image sur Google Drive
   */
  async uploadToGoogleDrive(file) {
    const config = AppConfig?.storage?.googledrive;

    if (!config?.apiKey || !config?.clientId || !config?.folderId) {
      console.warn('Google Drive non configuré, fallback vers base64');
      return this.uploadAsBase64(file);
    }

    try {
      // Charger l'API Google si pas déjà chargée
      if (!window.gapi) {
        await this.loadGoogleAPI();
      }

      // Initialiser l'API Google Drive
      await this.initGoogleDrive();

      // Redimensionner l'image avant upload
      const blob = await this.resizeImageToBlob(file);

      // Créer le metadata du fichier
      const metadata = {
        name: `${Date.now()}_${file.name}`,
        mimeType: 'image/jpeg',
        parents: [config.folderId]
      };

      // Upload vers Google Drive
      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', blob);

      const accessToken = gapi.auth.getToken().access_token;

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload vers Google Drive');
      }

      const data = await response.json();

      // Rendre le fichier public
      await this.makeGoogleDriveFilePublic(data.id);

      // Retourner l'URL publique
      return `https://drive.google.com/uc?export=view&id=${data.id}`;

    } catch (error) {
      console.error('Erreur upload Google Drive:', error);
      console.warn('Fallback vers base64');
      return this.uploadAsBase64(file);
    }
  },

  /**
   * Upload vers OneDrive
   * @param {File} file - Fichier image
   * @returns {Promise<string>} URL de l'image sur OneDrive
   */
  async uploadToOneDrive(file) {
    const config = AppConfig?.storage?.onedrive;

    if (!config?.clientId) {
      console.warn('OneDrive non configuré, fallback vers base64');
      return this.uploadAsBase64(file);
    }

    try {
      // Initialiser OneDrive (nécessite MSAL.js)
      if (!window.msal) {
        throw new Error('MSAL.js non chargé');
      }

      // Redimensionner l'image
      const blob = await this.resizeImageToBlob(file);

      // TODO: Implémenter l'authentification MSAL et l'upload OneDrive
      // Pour l'instant, fallback vers base64
      console.warn('Upload OneDrive pas encore implémenté, fallback vers base64');
      return this.uploadAsBase64(file);

    } catch (error) {
      console.error('Erreur upload OneDrive:', error);
      return this.uploadAsBase64(file);
    }
  },

  /**
   * Charge l'API Google dynamiquement
   */
  async loadGoogleAPI() {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        gapi.load('client:auth2', resolve);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  },

  /**
   * Initialise Google Drive API
   */
  async initGoogleDrive() {
    const config = AppConfig?.storage?.googledrive;

    if (gapi.client.drive) {
      return; // Déjà initialisé
    }

    await gapi.client.init({
      apiKey: config.apiKey,
      clientId: config.clientId,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
      scope: 'https://www.googleapis.com/auth/drive.file'
    });

    // Authentifier l'utilisateur si nécessaire
    if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
      await gapi.auth2.getAuthInstance().signIn();
    }
  },

  /**
   * Rend un fichier Google Drive public
   */
  async makeGoogleDriveFilePublic(fileId) {
    const accessToken = gapi.auth.getToken().access_token;

    await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: 'reader',
          type: 'anyone'
        })
      }
    );
  },

  /**
   * Redimensionne une image et retourne un Blob
   */
  async resizeImageToBlob(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 800;
          const maxHeight = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', 0.85);
        };

        img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'));
        img.src = e.target.result;
      };

      reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
      reader.readAsDataURL(file);
    });
  },

  /**
   * Prévisualise une image avant upload
   * @param {File} file - Fichier image
   * @param {HTMLElement} element - Element où afficher la preview
   */
  preview(file, element) {
    const reader = new FileReader();

    reader.onload = (e) => {
      if (element.tagName === 'IMG') {
        element.src = e.target.result;
      } else {
        element.style.backgroundImage = `url(${e.target.result})`;
        element.style.backgroundSize = 'cover';
        element.style.backgroundPosition = 'center';
      }
    };

    reader.readAsDataURL(file);
  },

  /**
   * Valide un fichier image
   * @param {File} file - Fichier à valider
   * @returns {Object} {valid: boolean, error: string}
   */
  validate(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!file) {
      return { valid: false, error: 'Aucun fichier sélectionné' };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Type de fichier non supporté. Utilisez JPG, PNG ou WebP.'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Fichier trop volumineux. Taille maximale : 5MB.'
      };
    }

    return { valid: true };
  }
};
