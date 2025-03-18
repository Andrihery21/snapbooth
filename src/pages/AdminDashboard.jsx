import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Settings, Mail, Loader2, AlertCircle, CheckCircle,  LogOut, Tv} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { listProfiles } from '../lib/users';
import { useNavigate } from 'react-router-dom'; 
import { useAuthStore } from '../store/auth'; 
import { Logger } from '../lib/logger';

const logger = new Logger('AdminDashboard');

const tabs = [
  { id: 'users', label: 'Utilisateurs', icon: Users },
  { id: 'events', label: 'Événements', icon: Calendar },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'settings', label: 'Paramètres', icon: Settings },
  { id: 'screen', label: 'Écran', icon: Tv },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // États pour les utilisateurs
  const [users, setUsers] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const navigate = useNavigate(); // Initialize navigate
  const { logout } = useAuthStore(); // Initialize logout from useAuthStore

  // États pour les écrans
  const [screens, setScreens] = useState([]);
  const [newScreenName, setNewScreenName] = useState('');
  const [newScreenIpAddress, setNewScreenIpAddress] = useState('');
  const [newScreenSerialNumber, setNewScreenSerialNumber] = useState('');
  const [selectedScreenId, setSelectedScreenId] = useState(null);

  
  // États pour les événements
  const [events, setEvents] = useState([]);
  
  // États pour les paramètres d'email
  const [emailTemplate, setEmailTemplate] = useState(
    "Bonjour,\n\nVoici votre photo prise lors de l'événement {{event}}.\n\nCordialement,\nL'équipe SNAP BOOTH"
  );
  
  // États pour les paramètres d'interface
  const [settings, setSettings] = useState({
    animations: true,
    gridColumns: 4,
    printFormat: '10x15',
    autoRotate: true,
    cartoon : true,
    dessin : true,
    univers : true,
    carricature : true,
    screenOrientation : 'Paysage'
  });

  const handleLogout = async () => {
    logger.info('Déconnexion');
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Charger les utilisateurs
        if (activeTab === 'users') {
          const profiles = await listProfiles();
          setUsers(profiles);
        }
        
        // Charger les événements
        if (activeTab === 'events') {
          const { data: eventsData, error: eventsError } = await supabase
            .from('events')
            .select('*, photos(count)')
            .order('date', { ascending: false });
            
          if (eventsError) throw eventsError;
          setEvents(eventsData);
        }
        
        //Cahrger les écrans 
        if (activeTab === 'screen') {
          const { data: screensData, error: screensError } = await supabase
            .from('screen')
            .select('*');
  
          if (screensError) throw screensError;
          setScreens(screensData);
        }

      
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Une erreur est survenue lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  useEffect(() => {
    // Gérer l'orientation de l'écran
    if (settings.screenOrientation === "Portrait") {
      document.body.classList.add("portrait-mode");
    } else {
      document.body.classList.remove("portrait-mode");
    }
  }, [settings.screenOrientation]); 

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Créer l'utilisateur avec Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
        options: {
          data: {
            role: newUserRole
          }
        }
      });

      if (authError) throw authError;

      setSuccess('Utilisateur créé avec succès');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('user');

      // Rafraîchir la liste des utilisateurs
      const profiles = await listProfiles();
      setUsers(profiles);

    } catch (err) {
      console.error('Erreur lors de la création de l\'utilisateur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateScreen = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
  
      // Créer un écran
      const { error: screenError } = await supabase
        .from('screen')
        .insert([
          {
            screen_name: newScreenName,
            ip_adress: newScreenIpAddress,
            serial_number: newScreenSerialNumber,
          },
        ]);
  
      if (screenError) throw screenError;
  
      setSuccess('Écran ajouté avec succès');
      setNewScreenName('');
      setNewScreenIpAddress('');
      setNewScreenSerialNumber('');
  
      // Rafraîchir la liste des écrans
      const { data: screensData, error: screensError } = await supabase
        .from('screen')
        .select('*');
  
      if (screensError) throw screensError;
      setScreens(screensData);
    } catch (err) {
      console.error('Erreur lors de la création de l\'écran:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      setLoading(true);
      setError(null);
  
      if (!selectedScreenId) {
        setError('Veuillez sélectionner un écran.');
        return;
      }
  
      // 1. Vérifier si une ligne existe déjà pour cet écran
      const { data: existingSettings, error: selectError } = await supabase
        .from('configuration')
        .select('*')
        .eq('screen_id', selectedScreenId); // Filtrer par screen_id
  
      if (selectError) throw selectError;
  
      if (existingSettings && existingSettings.length > 0) {
        // 2. Mettre à jour la ligne existante
        const { error: updateError } = await supabase
          .from('configuration')
          .update({
            column_number: settings.gridColumns,
            is_transition: settings.animations,
            is_automatic_rotation: settings.autoRotate,
            has_cartoon: settings.cartoon,
            has_dessins: settings.dessin,
            has_univers: settings.univers,
            print_format: settings.printFormat,
            screen_orientation: settings.screenOrientation,
            has_carricature: settings.carricature,
          })
          .eq('id', existingSettings[0].id);
  
        if (updateError) throw updateError;
  
        setSuccess('Paramètres mis à jour avec succès');
      } else {
        // 3. Insérer une nouvelle ligne
        const { error: insertError } = await supabase
          .from('configuration')
          .insert([
            {
              column_number: settings.gridColumns,
              is_transition: settings.animations,
              is_automatic_rotation: settings.autoRotate,
              has_cartoon: settings.cartoon,
              has_dessins: settings.dessin,
              has_univers: settings.univers,
              print_format: settings.printFormat,
              screen_orientation: settings.screenOrientation,
              has_carricature: settings.carricature,
              screen_id: selectedScreenId, // Ajouter screen_id
            },
          ]);
  
        if (insertError) throw insertError;
  
        setSuccess('Paramètres enregistrés avec succès');
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour des paramètres:', err);
      setError('Erreur lors de la mise à jour des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmailTemplate = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simuler la sauvegarde du template
      await new Promise(resolve => setTimeout(resolve, 500));

      setSuccess('Template d\'email mis à jour avec succès');
    } catch (err) {
      setError('Erreur lors de la mise à jour du template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
        <nav className="flex justify-between items-center"> {/* Ajout de justify-between et items-center */}
  <div className="flex space-x-8"> {/* Conteneur pour vos onglets */}
    {tabs.map(({ id, label, icon: Icon }) => (
      <button
        key={id}
        onClick={() => setActiveTab(id)}
        className={`flex items-center space-x-2 py-4 px-1 border-b-2 transition-colors ${
          activeTab === id
            ? 'border-purple-500 text-purple-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
      </button>
    ))}
  </div>
  <button
    onClick={handleLogout}
    className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
  >
    <LogOut className="w-5 h-5" />
    <span>Déconnexion</span>
  </button>
</nav>
        </div>
      </div>

      {/* Messages */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 text-green-600 p-4 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p>{success}</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                {/* Create User Form */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Créer un utilisateur
                  </h2>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Mot de passe
                      </label>
                      <input
                        type="password"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Rôle
                      </label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                      >
                        <option value="user">Utilisateur</option>
                        <option value="admin">Administrateur</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      Créer l'utilisateur
                    </button>
                  </form>
                </div>

                {/* Users List */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rôle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Créé le
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button className="text-purple-600 hover:text-purple-900">
                              Modifier
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Photos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {events.map((event) => (
                      <tr key={event.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {event.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(event.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {event.photos_aggregate?.count || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-purple-600 hover:text-purple-900 mr-4">
                            Modifier
                          </button>
                          <button className="text-purple-600 hover:text-purple-900">
                            Voir les photos
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Email Tab */}
            {activeTab === 'email' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Template d'email
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contenu de l'email
                    </label>
                    <textarea
                      value={emailTemplate}
                      onChange={(e) => setEmailTemplate(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Variables disponibles:</p>
                    <ul className="text-sm text-gray-500 list-disc list-inside">
                      <li>{'{{event}}'} - Nom de l'événement</li>
                      <li>{'{{date}}'} - Date de l'événement</li>
                      <li>{'{{photo_url}}'} - URL de la photo</li>
                    </ul>
                  </div>
                  <button
                    onClick={handleSaveEmailTemplate}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Sauvegarder
                  </button>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">
                  Paramètres de l'interface
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Animations</h3>
                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.animations}
                          onChange={(e) => setSettings({ ...settings, animations: e.target.checked })}
                          className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Activer les animations de transition
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.autoRotate}
                          onChange={(e) => setSettings({ ...settings, autoRotate: e.target.checked })}
                          className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Rotation automatique des photos selon l'EXIF
                        </span>
                      </label>
                    </div>
                  </div>

                
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Parametres de regroupement des filtres</h3>
                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.cartoon}
                          onChange={(e) => setSettings({ ...settings, cartoon: e.target.checked })}
                          className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Cartoon
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.dessin}
                          onChange={(e) => setSettings({ ...settings, dessin: e.target.checked })}
                          className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Dessins
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.univers}
                          onChange={(e) => setSettings({ ...settings, univers: e.target.checked })}
                          className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Univers
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.carricature}
                          onChange={(e) => setSettings({ ...settings, carricature: e.target.checked })}
                          className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Carricature
                        </span>
                      </label>
                    </div>
                  </div>

                  

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Affichage</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          Nombre de colonnes dans la grille
                        </label>
                        <select
                          value={settings.gridColumns}
                          onChange={(e) => setSettings({ ...settings, gridColumns: Number(e.target.value) })}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                        >
                          <option value={3}>3 colonnes</option>
                          <option value={4}>4 colonnes</option>
                          <option value={5}>5 colonnes</option>
                          <option value={6}>6 colonnes</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Impression</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          Format d'impression par défaut
                        </label>
                        <select
                          value={settings.printFormat}
                          onChange={(e) => setSettings({ ...settings, printFormat: e.target.value })}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                        >
                           <option value="10x15">10x15 cm</option>
                          <option value="13x18">13x18 cm</option>
                          <option value="15x20">15x20 cm</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Ecran</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          Orientation de l'ecran
                        </label>
                        <select
                          value={settings.screenOrientation}
                          onChange={(e) => setSettings({ ...settings, screenOrientation: e.target.value })}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                        >
                          <option value="Paysage">Paysage - Horizontale</option>
                          <option value="Portrait">Portrait - Verticale</option>
                         
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleUpdateSettings}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      Sauvegarder les paramètres
                    </button>
                  </div>
                </div>
              </div>
            )}
             {/* Screen Tab */}
             {activeTab === 'screen' && (
              <div className='space-y6'>
                    {/* Create User Form */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Ajouter un écran
                  </h2>
                  <form onSubmit={handleCreateScreen} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nom
                      </label>
                      <input
                        type="text"
                        value={newScreenName}
                        onChange={(e) => setNewScreenName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Adresse Ip de l'appareil
                      </label>
                      <input
                        type="text"
                        value={newScreenIpAddress}
                        onChange={(e) => setNewScreenIpAddress(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Numéro de série
                      </label>
                      <input
                        type="text"
                        value={newScreenSerialNumber}
                        onChange={(e) => setNewScreenSerialNumber(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      Ajouter l'écran
                    </button>
                  </form>
                </div>
               
                {/* Users List */}
                <div className="bg-white rounded-lg shadow overflow-hidden mt-8">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          NOM
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ADRESSE IP
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         NUMERO DE SERIE
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Séléctionner
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {screens.map((screen) => (
                        <tr key={screen.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {screen.screen_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap"> 
                              {screen.ip_adress}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {screen.serial_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <input
                  type="checkbox"
                  checked={selectedScreenId === screen.id}
                  onChange={() =>
                    setSelectedScreenId(
                      selectedScreenId === screen.id ? null : screen.id
                    )
                  }
                  className="form-checkbox h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
              </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button className="text-purple-600 hover:text-purple-900">
                              Modifier
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </div>
               
                )}
          </>
        )}
      </div>
    </div>
  );
}