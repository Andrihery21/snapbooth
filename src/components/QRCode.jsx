import React, { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { SERVER_CONFIG } from '../config/serverConfig';

export function QRCode({ image, onClose }) {
  const [timeLeft, setTimeLeft] = useState(120)
  const [isGenerating, setIsGenerating] = useState(true)
  const [error, setError] = useState(null)
  const [shareUrl, setShareUrl] = useState('')

  useEffect(() => {
    let timer;
    let imageId;
    
    const saveImage = async () => {
      try {
        // Envoyer l'image directement au serveur
        const response = await fetch(`${SERVER_CONFIG.TEMP_URL}/api/upload-temp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image })
        });

        if (!response.ok) {
          throw new Error('Erreur lors de l\'envoi de l\'image');
        }

        const { id } = await response.json();
        imageId = id;
        const url = `${SERVER_CONFIG.TEMP_URL}/temp/${id}`;
        setShareUrl(url);
        setIsGenerating(false);

        // Démarrer le compte à rebours
        timer = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              // Supprimer l'image temporaire
              fetch(`${SERVER_CONFIG.TEMP_URL}/api/delete-temp/${imageId}`, {
                method: 'DELETE'
              }).catch(console.error);
              onClose();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (err) {
        console.error('Erreur:', err);
        setError("Erreur lors de la génération du QR code");
        setIsGenerating(false);
      }
    };

    if (image) {
      saveImage();
    }

    return () => {
      if (timer) clearInterval(timer);
      if (imageId) {
        // Nettoyer l'image temporaire si on ferme avant l'expiration
        fetch(`${SERVER_CONFIG.TEMP_URL}/api/delete-temp/${imageId}`, {
          method: 'DELETE'
        }).catch(console.error);
      }
    };
  }, [image, onClose]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full">
          <h2 className="text-red-600 text-xl font-bold mb-4">Erreur</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={onClose}
            className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute -right-3 -top-3 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-700"
          >
            ×
          </button>
          
          <h2 className="text-xl font-bold mb-4 text-center">Partager la photo</h2>
          
          {isGenerating ? (
            <div className="flex justify-center items-center h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              <div className="bg-gray-100 p-4 rounded-lg mb-4 flex justify-center">
                <QRCodeSVG
                  value={shareUrl}
                  size={300}
                  level="M"
                  includeMargin={true}
                />
              </div>
              
              <p className="text-sm text-gray-600 text-center mb-2">
                Scannez le QR code pour voir votre photo
              </p>
              
              <p className="text-sm text-gray-500 text-center">
                Expire dans {formatTime(timeLeft)}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}