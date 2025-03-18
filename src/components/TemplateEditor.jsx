import React, { useState, useRef } from 'react'
import { Rnd } from 'react-rnd'

export function TemplateEditor({ template, onSave }) {
  const [rotation, setRotation] = useState(0)
  const [size, setSize] = useState({ width: 300, height: 300 })
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  
  const handleSave = () => {
    onSave({
      rotation,
      size,
      position,
      scale
    })
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <div className="relative w-full h-[400px] bg-gray-900 rounded overflow-hidden mb-4">
        <Rnd
          size={{ width: size.width * scale, height: size.height * scale }}
          position={position}
          onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
          onResize={(e, direction, ref, delta, position) => {
            setSize({
              width: ref.offsetWidth / scale,
              height: ref.offsetHeight / scale
            })
            setPosition(position)
          }}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <img 
            src={template.url} 
            alt={template.name}
            className="w-full h-full object-contain"
          />
        </Rnd>
      </div>

      <div className="space-y-4">
        {/* Contrôles de rotation */}
        <div>
          <label className="text-white text-sm mb-1 block">Rotation</label>
          <input
            type="range"
            min="0"
            max="360"
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Contrôles d'échelle */}
        <div>
          <label className="text-white text-sm mb-1 block">Échelle</label>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Appliquer
        </button>
      </div>
    </div>
  )
}