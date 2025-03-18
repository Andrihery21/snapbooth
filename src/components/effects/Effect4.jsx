import React from 'react'

export function Effect4({ image }) {
  const applyEffect = async (imageData) => {
    // Effet vintage
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
            // Ajouter une teinte jaunâtre
            data[i] = data[i] * 1.2     // Rouge
            data[i + 1] = data[i + 1] * 1.1 // Vert
            data[i + 2] = data[i + 2] * 0.9 // Bleu
            
            // Réduire la saturation
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
            data[i] = data[i] * 0.9 + avg * 0.1
            data[i + 1] = data[i + 1] * 0.9 + avg * 0.1
            data[i + 2] = data[i + 2] * 0.9 + avg * 0.1
            
            // Limiter les valeurs
            data[i] = Math.min(255, data[i])
            data[i + 1] = Math.min(255, data[i + 1])
            data[i + 2] = Math.min(255, data[i + 2])
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
