import React, { useState, useRef, useEffect } from 'react'
import imageCompression from 'browser-image-compression'
import { TemplateManager } from './TemplateManager'

export function AdminPanel({ onClose }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('features')
  const [newProjectName, setNewProjectName] = useState('')
  const [projects, setProjects] = useState(() => {
    const savedProjects = localStorage.getItem('projects')
    return savedProjects ? JSON.parse(savedProjects) : []
  })
  const [features, setFeatures] = useState(() => {
    const savedFeatures = localStorage.getItem('features')
    return savedFeatures ? JSON.parse(savedFeatures) : {
      email: true,
      bluetooth: true,
      qr: true,
      print: true
    }
  })

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects))
  }, [projects])

  useEffect(() => {
    localStorage.setItem('features', JSON.stringify(features))
  }, [features])

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === '12345') {
      setIsAuthenticated(true)
      setError('')
    } else {
      setError('Mot de passe incorrect')
      setPassword('')
    }
  }

  const handleCreateProject = async () => {
    if (newProjectName.trim()) {
      const newProject = {
        id: Date.now(),
        name: newProjectName.trim(),
        date: new Date().toLocaleDateString(),
        path: `/projects/${newProjectName.trim()}`
      }

      setProjects(prev => [...prev, newProject])
      setNewProjectName('')
    }
  }

  const handleDeleteProject = (id) => {
    setProjects(prev => prev.filter(project => project.id !== id))
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Panneau d'administration</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Entrez le mot de passe"
                autoFocus
              />
            </div>
            
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Connexion
            </button>
          </form>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'features':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Fonctionnalités activées</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={features.email}
                  onChange={(e) => setFeatures(prev => ({ ...prev, email: e.target.checked }))}
                  className="w-4 h-4 text-purple-600"
                />
                <span>Email</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={features.bluetooth}
                  onChange={(e) => setFeatures(prev => ({ ...prev, bluetooth: e.target.checked }))}
                  className="w-4 h-4 text-purple-600"
                />
                <span>Bluetooth</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={features.qr}
                  onChange={(e) => setFeatures(prev => ({ ...prev, qr: e.target.checked }))}
                  className="w-4 h-4 text-purple-600"
                />
                <span>QR Code</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={features.print}
                  onChange={(e) => setFeatures(prev => ({ ...prev, print: e.target.checked }))}
                  className="w-4 h-4 text-purple-600"
                />
                <span>Impression</span>
              </label>
            </div>
          </div>
        )
      case 'projects':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Créer un nouveau projet</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Nom du projet"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleCreateProject}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                >
                  Créer
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Projets existants</h3>
              <div className="space-y-3">
                {projects.map(project => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div>
                      <h4 className="font-medium">{project.name}</h4>
                      <p className="text-sm text-gray-500">{project.date}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      case 'templates':
        return <TemplateManager />
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Panneau d'administration</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('features')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'features'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Fonctionnalités
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'projects'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Projets
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'templates'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Templates
          </button>
        </div>

        {renderContent()}
      </div>
    </div>
  )
}