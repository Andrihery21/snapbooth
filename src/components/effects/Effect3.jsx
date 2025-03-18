import React from 'react'

export function Effect3({ image }) {
  const applyEffect = async (imageData) => {
    // Effet contraste
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
          const factor = 1.5 // Facteur de contraste
          
          for (let i = 0; i < data.length; i += 4) {
            data[i] = factor * (data[i] - 128) + 128     // Rouge
            data[i + 1] = factor * (data[i + 1] - 128) + 128 // Vert
            data[i + 2] = factor * (data[i + 2] - 128) + 128 // Bleu
            
            // Limiter les valeurs entre 0 et 255
            data[i] = Math.max(0, Math.min(255, data[i]))
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1]))
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2]))
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
