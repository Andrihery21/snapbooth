import React, { useState, useEffect } from 'react'

export function AirDrop({ image, onClose }) {
  const [scanning, setScanning] = useState(false)
  const [devices, setDevices] = useState([])
  const [error, setError] = useState('')
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [sending, setSending] = useState(false)

  // Simuler la découverte d'appareils
  const startScan = () => {
    setScanning(true)
    setError('')
    
    // Simuler la découverte après 1 seconde
    setTimeout(() => {
      setDevices([
        { id: 1, name: "iPhone de John" },
        { id: 2, name: "iPad de Marie" },
        { id: 3, name: "MacBook de Tom" }
      ])
      setScanning(false)
    }, 1000)
  }

  const sendToDevice = async (device) => {
    try {
      setSending(true)
      setSelectedDevice(device)
      
      // Simuler l'envoi
      await new Promise(resolve => setTimeout(resolve, 2000))
      onClose()
    } catch (err) {
      setError("Erreur lors de l'envoi")
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Partage AirDrop
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        {devices.length === 0 ? (
          <div className="text-center">
            <button
              onClick={startScan}
              disabled={scanning}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {scanning ? 'Recherche...' : 'Rechercher des appareils'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {devices.map(device => (
              <div
                key={device.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📱</span>
                  <span className="font-medium">{device.name}</span>
                </div>
                <button
                  onClick={() => sendToDevice(device)}
                  disabled={sending && selectedDevice?.id === device.id}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {sending && selectedDevice?.id === device.id ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}