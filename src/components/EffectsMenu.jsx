import React, { useState, useEffect } from 'react'
import { LoadingSpinner } from './LoadingSpinner'
import { saveProcessed } from '../services/photoService'

const EFFECTS = [
  { id: '0', name: 'Style BD vintage', description: 'Style BD vintage' },
  { id: '1', name: 'Conte de fées 3D', description: 'Style conte de fées en 3D' },
  { id: '2', name: 'Style 2D', description: 'Style deux dimensions' },
  { id: '3', name: 'Style frais et élégant', description: 'Style frais et élégant' },
  { id: '4', name: 'Style technologie future', description: 'Style technologie futuriste' },
  { id: '5', name: 'Style peinture chinoise', description: 'Style peinture chinoise traditionnelle' },
  { id: '6', name: 'Style général', description: 'Style général anime' },
  { id: '7', name: 'Style cartoon coloré', description: 'Style cartoon coloré et vif' },
  { id: '8', name: 'Style chinois gracieux', description: 'Style chinois élégant et gracieux' }
];

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_AILAB_API_KEY;

export function EffectsMenu({ image, onEffectSelect, onTimeEnd }) {
  const [timeLeft, setTimeLeft] = useState(120)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedEffect, setSelectedEffect] = useState(EFFECTS[0].id)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleConfirm()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleEffectSelect = (effectId) => {
    setSelectedEffect(effectId)
  }

  const handleConfirm = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Début du traitement...')
      console.log('Image source:', image)

      // 1. Récupérer l'image depuis Supabase
      const imageResponse = await fetch(image)
      if (!imageResponse.ok) {
        throw new Error('Impossible de récupérer l\'image')
      }
      const imageBlob = await imageResponse.blob()
      const imageFile = new File([imageBlob], 'photo.jpg', { type: 'image/jpeg' })

      // 2. Préparer FormData
      const formData = new FormData()
      formData.append('image', imageFile)
      formData.append('index', selectedEffect)

      console.log('FormData prêt :')
      formData.forEach((value, key) => console.log(`${key}:`, value))

      // 3. Envoyer à l'API
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'ailabapi-api-key': API_KEY
        },
        body: formData
      })

      console.log('Réponse brute HTTP :', response)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Erreur brute API :', errorText)
        
        // Gérer les erreurs HTTP communes
        switch (response.status) {
          case 401:
            throw new Error('Clé API invalide ou manquante')
          case 403:
            throw new Error('Accès refusé à l\'API')
          case 404:
            throw new Error('Service API non trouvé')
          case 429:
            throw new Error('Trop de requêtes, veuillez réessayer plus tard')
          case 500:
            throw new Error('Erreur serveur, veuillez réessayer plus tard')
          default:
            throw new Error(`Erreur API : ${response.status} ${response.statusText}`)
        }
      }

      const data = await response.json()
      console.log('Réponse JSON de l\'API :', data)

      if (data.error_code !== 0) {
        console.error('Erreur API :', data.error_msg)
        throw new Error(data.error_msg || 'Erreur lors du traitement')
      }

      const processedImageUrl = data.data?.image_url
      if (!processedImageUrl) {
        console.error('Erreur : URL de l\'image traitée introuvable.')
        throw new Error('URL de l\'image traitée introuvable')
      }

      console.log('Image traitée URL :', processedImageUrl)

      // 4. Télécharger l'image traitée
      const processedResponse = await fetch(processedImageUrl)
      if (!processedResponse.ok) {
        throw new Error('Impossible de télécharger l\'image traitée')
      }
      const processedBlob = await processedResponse.blob()

      // 5. Sauvegarder dans Supabase
      const { success: uploadSuccess, url: processedUrl, error: uploadError } = 
        await saveProcessed(processedBlob)

      if (!uploadSuccess) {
        throw new Error(uploadError || 'Erreur lors de la sauvegarde de l\'image')
      }

      // Animation de transition
      const fadeOut = document.createElement('div')
      fadeOut.className = 'fixed inset-0 bg-white animate-flash z-50'
      document.body.appendChild(fadeOut)

      // Utiliser l'URL Supabase pour l'affichage
      onEffectSelect(processedUrl)
      
      setTimeout(() => {
        document.body.removeChild(fadeOut)
        if (timeLeft === 0) {
          onTimeEnd()
        }
      }, 500)

    } catch (err) {
      console.error('Erreur lors du traitement:', err)
      setError(err.message || 'Une erreur est survenue lors du traitement')
    } finally {
      setLoading(false)
      console.log('Fin du traitement.')
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-6">
        <div className="flex flex-col items-center">
          <LoadingSpinner />
          <p className="text-white mt-4">Application de l'effet en cours...</p>
          <p className="text-gray-400 text-sm mt-2">Cela peut prendre quelques secondes</p>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-6">
      {/* Compte à rebours */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <span className="text-2xl font-bold text-white">
          {formatTime(timeLeft)}
        </span>
      </div>

      {/* Liste des effets */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {EFFECTS.map((effect) => (
          <button
            key={effect.id}
            onClick={() => handleEffectSelect(effect.id)}
            className={`p-3 rounded-lg flex flex-col items-center transition-all transform hover:scale-105 ${
              selectedEffect === effect.id
                ? 'ring-4 ring-blue-500 scale-105 bg-blue-500/20'
                : 'ring-2 ring-gray-600 bg-gray-800/50'
            }`}
          >
            <span className="text-lg text-white font-medium mb-1">{effect.name}</span>
            <span className="text-xs text-gray-400 text-center">{effect.description}</span>
          </button>
        ))}
      </div>

      {/* Bouton pour appliquer l'effet */}
      <div className="flex flex-col items-center">
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Appliquer l'effet
        </button>

        {error && (
          <div className="mt-4 text-red-500 text-center bg-red-500/10 p-3 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
