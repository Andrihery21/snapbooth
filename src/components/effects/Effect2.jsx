import React from 'react';
import { AILAB_CONFIG } from '../../config/ailab';
import { API_CONFIG } from '../../config/api';

export function Effect2({ image }) {
  // Fonction pour compresser l'image
  const compressImage = async (base64String, maxWidth = 1024) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculer les nouvelles dimensions
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compression avec qualité réduite
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = base64String;
    });
  };

  const applyEffect = async (imageData) => {
    try {
      console.log('Début du traitement de l\'image avec AILabTools');
      
      // Compresser l'image avant de l'envoyer
      const compressedImage = await compressImage(imageData);
      console.log('Image compressée');
      
      // Convertir l'image en base64 si ce n'est pas déjà fait
      const base64Image = compressedImage.startsWith('data:image') 
        ? compressedImage.split(',')[1] 
        : compressedImage;
      
      console.log('Image convertie en base64');

      // Préparer les données pour l'API
      const requestData = {
        image: base64Image,
        filter_type: 'beauty',
        return_type: 'base64'
      };

      console.log('Envoi de la requête à AILabTools...');
      
      // Appeler l'API AILabTools
      const response = await fetch(`${AILAB_CONFIG.BASE_URL}${AILAB_CONFIG.ENDPOINTS.FACE_FILTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AILAB_CONFIG.API_KEY}`
        },
        body: JSON.stringify(requestData)
      });

      console.log('Réponse reçue de AILabTools:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur AILabTools:', errorText);
        throw new Error(`Erreur API AILabTools: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Image traitée reçue de AILabTools');
      
      const processedImage = `data:image/jpeg;base64,${result.image}`;

      // Générer un nom de fichier unique pour l'image traitée
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const processedFilename = `processed_${timestamp}.jpg`;

      console.log('Sauvegarde de l\'image traitée...');
      
      // Sauvegarder l'image traitée dans le dossier processed/
      const saveResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SAVE_PROCESSED}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: processedImage,
          filename: processedFilename
        })
      });

      if (!saveResponse.ok) {
        const saveErrorText = await saveResponse.text();
        console.error('Erreur sauvegarde:', saveErrorText);
        throw new Error(`Erreur lors de la sauvegarde de l'image traitée: ${saveResponse.status} - ${saveErrorText}`);
      }

      const { savedPath } = await saveResponse.json();
      console.log('Image traitée sauvegardée avec succès:', savedPath);
      
      return processedImage;

    } catch (error) {
      console.error('Erreur détaillée lors de l\'application de l\'effet:', error);
      throw error;
    }
  };

  return {
    apply: () => applyEffect(image)
  };
}
