import React from 'react'

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      <span className="ml-3 text-white text-lg">Traitement en cours...</span>
    </div>
  )
}
