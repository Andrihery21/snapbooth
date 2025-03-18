import React, { useState } from 'react'

export function Bluetooth({ image, onClose }) {
  const [scanning, setScanning] = useState(false)
  const [devices, setDevices] = useState([])
  const [error, setError] = useState('')
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [sending, setSending] = useState(false)

  const startScan = async () => {
    try {
      setScanning(true)
      setError('')

      // Vérifier si le navigateur supporte le Bluetooth
      if (!navigator.bluetooth) {
        throw new Error('Bluetooth non supporté sur ce navigateur')
      }

      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true
      })

      setSelectedDevice(device)
      setScanning(false)
    } catch (err) {
      setError(err.message)
      setScanning(false)
    }
  }

  const sendImage = async () => {
    if (!selectedDevice) return

    try {
      setSending(true)
      // Simulation d'envoi
      await new Promise(resolve => setTimeout(resolve, 2000))
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Partage Bluetooth
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        {selectedDevice ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              Appareil sélectionné: {selectedDevice.name || 'Appareil inconnu'}
            </p>
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={sending}
              >
                Annuler
              </button>
              <button
                onClick={sendImage}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                disabled={sending}
              >
                {sending ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={startScan}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              disabled={scanning}
            >
              {scanning ? 'Recherche...' : 'Rechercher des appareils'}
            </button>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        )}
      </div>
    </div>
  )
}