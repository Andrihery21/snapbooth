import React from 'react'

export function Effect5({ image }) {
  const applyEffect = async (imageData) => {
    // Effet vif
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data
          
          for (let i = 0; i < data.length; i += 4) {
            // Augmenter la saturation
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
            data[i] = data[i] + (data[i] - avg) * 0.5     // Rouge
            data[i + 1] = data[i + 1] + (data[i + 1] - avg) * 0.5 // Vert
            data[i + 2] = data[i + 2] + (data[i + 2] - avg) * 0.5 // Bleu
            
            // Augmenter la luminosité
            data[i] *= 1.2
            data[i + 1] *= 1.2
            data[i + 2] *= 1.2
            
            // Limiter les valeurs
            data[i] = Math.min(255, Math.max(0, data[i]))
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1]))
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2]))
          }
          
          ctx.putImageData(imageData, 0, 0)
          resolve(canvas.toDataURL('image/jpeg'))
        }
        img.onerror = reject
        img.src = imageData
      })
    } catch (error) {
      console.error('Erreur lors de l\'application de l\'effet:', error)
      throw error
    }
  }

  return { applyEffect }
}
