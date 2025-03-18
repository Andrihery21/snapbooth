import React, { useState, useEffect } from 'react'
import { TemplateEditor } from './TemplateEditor'

export function TemplateManager({ onClose }) {
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [isEditing, setIsEditing] = useState(false)
  const templatesPerPage = 8

  // Filtrer et rechercher les templates
  const filteredTemplates = templates
    .filter(template => {
      if (filter === 'all') return true
      return template.type === filter
    })
    .filter(template => 
      template.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

  // Pagination
  const totalPages = Math.ceil(filteredTemplates.length / templatesPerPage)
  const paginatedTemplates = filteredTemplates.slice(
    (currentPage - 1) * templatesPerPage,
    currentPage * templatesPerPage
  )

  const handleTemplateUpload = async (event) => {
    const files = Array.from(event.target.files)
    
    for (const file of files) {
      try {
        // Vérifier le type de fichier
        const isTransparent = file.type === 'image/png'
        
        // Créer une URL pour la prévisualisation
        const imageUrl = URL.createObjectURL(file)
        
        // Charger l'image pour obtenir ses dimensions
        const img = new Image()
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = imageUrl
        })

        // Ajouter le template avec ses métadonnées
        const newTemplate = {
          id: Date.now(),
          name: file.name,
          url: imageUrl,
          file: file,
          type: isTransparent ? 'overlay' : 'background',
          dimensions: {
            width: img.width,
            height: img.height
          },
          dateAdded: new Date().toISOString(),
          usageCount: 0
        }
        
        setTemplates(prev => [...prev, newTemplate])
      } catch (error) {
        console.error('Erreur lors du chargement du template:', error)
      }
    }
  }

  const handleTemplateEdit = (template) => {
    setSelectedTemplate(template)
    setIsEditing(true)
  }

  const handleTemplateSave = (templateId, editData) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId
        ? { ...template, ...editData }
        : template
    ))
    setIsEditing(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center overflow-auto">
      <div className="bg-gray-900 rounded-xl w-full max-w-4xl m-4">
        <div className="p-6 border-b border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Gestion des Templates</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Barre d'outils */}
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-gray-800 text-white rounded px-4 py-2"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-800 text-white rounded px-4 py-2"
            >
              <option value="all">Tous</option>
              <option value="overlay">Superposition</option>
              <option value="background">Arrière-plan</option>
            </select>
            <label className="bg-purple-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-purple-700">
              Ajouter
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleTemplateUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Grille de templates */}
          <div className="grid grid-cols-4 gap-4">
            {paginatedTemplates.map(template => (
              <div
                key={template.id}
                className="relative group"
              >
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-800">
                  <img
                    src={template.url}
                    alt={template.name}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleTemplateEdit(template)}
                      className="p-2 bg-white/10 rounded-full hover:bg-white/20"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-white text-sm truncate">{template.name}</p>
                  <p className="text-gray-400 text-xs">
                    {new Date(template.dateAdded).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded ${
                    currentPage === i + 1
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Éditeur de template */}
        {isEditing && selectedTemplate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-gray-900 rounded-xl w-full max-w-2xl m-4">
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  Éditer {selectedTemplate.name}
                </h3>
                <TemplateEditor
                  template={selectedTemplate}
                  onSave={(editData) => handleTemplateSave(selectedTemplate.id, editData)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}