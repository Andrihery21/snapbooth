import React from 'react'

export function Effect1({ image }) {
  const applyEffect = async (imageData) => {
    // Effet noir et blanc
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
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
            data[i] = avg     // Rouge
            data[i + 1] = avg // Vert
            data[i + 2] = avg // Bleu
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
