import React from 'react'

export function Effect6({ image }) {
  const applyEffect = async (imageData) => {
    // Effet doux
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          
          // Appliquer un flou
          ctx.filter = 'blur(2px)'
          ctx.drawImage(img, 0, 0)
          
          // Réinitialiser le filtre
          ctx.filter = 'none'
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data
          
          for (let i = 0; i < data.length; i += 4) {
            // Adoucir les couleurs
            data[i] = data[i] * 0.9 + 25     // Rouge
            data[i + 1] = data[i + 1] * 0.9 + 25 // Vert
            data[i + 2] = data[i + 2] * 0.9 + 25 // Bleu
            
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
