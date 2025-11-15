/**
 * Service d'upload d'images
 * Gère l'upload d'images vers un service externe ou base64
 */

window.ImageUploadService = {
  /**
   * Upload une image
   * @param {File} file - Fichier image à uploader
   * @returns {Promise<string>} URL de l'image uploadée
   */
  async upload(file) {
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

          // Convertir en base64 ou blob
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

          // Pour l'instant, on retourne le data URL
          // Dans une implémentation réelle, on uploadera vers Cloudinary, AWS S3, etc.
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
