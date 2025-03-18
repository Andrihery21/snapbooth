import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ArrowLeft, LogOut, Calendar, Image, Printer, Mail, QrCode, Upload, X, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';
import { uploadEventPhoto } from '../lib/storage';
import { printPhoto } from '../lib/printer';
import { notify } from '../lib/notifications';
import { Logger } from '../lib/logger';

const logger = new Logger('PhotoGrid');

export default function PhotoGrid() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const event = location.state?.event;
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [email, setEmail] = useState('');
  const [printQuantity, setPrintQuantity] = useState(1);
  const [isPrinting, setPrinting] = useState(false);
  const [isSendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (!event?.id) {
      navigate('/events');
      return;
    }

    const fetchPhotos = async () => {
      try {
        setIsLoading(true);
        logger.info('Chargement des photos', { eventId: event.id });

        const { data, error } = await supabase
          .from('photos')
          .select('*')
          .eq('event_id', event.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setPhotos(data || []);
        logger.info('Photos chargées', { count: data?.length });
      } catch (err) {
        logger.error('Erreur lors du chargement des photos', err);
        notify.error('Impossible de charger les photos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();

    // Souscription aux changements en temps réel
    const subscription = supabase
      .channel('photos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'photos',
          filter: `event_id=eq.${event.id}`,
        },
        (payload) => {
          logger.debug('Changement en temps réel reçu', payload);
          if (payload.eventType === 'INSERT') {
            setPhotos((current) => [payload.new, ...current]);
          } else if (payload.eventType === 'DELETE') {
            setPhotos((current) => current.filter(photo => photo.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [event, navigate]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      logger.info('Upload de photo', { fileName: file.name });
      
      await uploadEventPhoto(file, event.id, event.name);
      e.target.value = '';
    } catch (error) {
      logger.error('Erreur lors de l\'upload', error);
      notify.error('Impossible d\'uploader la photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePrint = async () => {
    if (!selectedPhoto) return;

    try {
      setPrinting(true);
      logger.info('Impression de photo', { photoUrl: selectedPhoto.url, quantity: printQuantity });
      
      await printPhoto(selectedPhoto.url, printQuantity);
      
      notify.success(`Photo imprimée en ${printQuantity} exemplaire${printQuantity > 1 ? 's' : ''}`);
      setShowPrintOptions(false);
      setPrintQuantity(1);
    } catch (error) {
      logger.error('Erreur lors de l\'impression', error);
      notify.error('Impossible d\'imprimer la photo');
    } finally {
      setPrinting(false);
    }
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    if (!email || !selectedPhoto) return;

    try {
      setSendingEmail(true);
      logger.info('Envoi de photo par email', { email, photoUrl: selectedPhoto.url });
      
      // Simuler l'envoi d'email
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      notify.success('Photo envoyée par email');
      setShowEmailForm(false);
      setEmail('');
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de l\'email', error);
      notify.error('Impossible d\'envoyer l\'email');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/events')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{event?.name}</h1>
              <p className="text-sm text-gray-500 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(event?.date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <label className="cursor-pointer">
              {/* <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              /> */}
              {/* <div className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
                <span>Prendre une photo</span>
              </div> */}
               <div 
               onClick={() => navigate('/captures',{ state: { eventID: event.id } })}
               className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <span>Prendre une photo</span>
              </div>
            </label>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-12">
            <Image className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune photo</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par prendre une photo de l'événement
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {photos.map((photo) => (
              <motion.div
                key={photo.id}
                layoutId={`photo-${photo.id}`}
                className="relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.url}
                  alt={`Photo ${photo.id}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de visualisation de photo */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => {
              setSelectedPhoto(null);
              setShowQRCode(false);
              setShowEmailForm(false);
              setShowPrintOptions(false);
            }}
          >
            {/* Actions */}
            <div 
              className="absolute top-4 right-4 flex space-x-4"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowPrintOptions(true)}
                className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors"
              >
                <Printer className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={() => setShowQRCode(true)}
                className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors"
              >
                <QrCode className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={() => setShowEmailForm(true)}
                className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors"
              >
                <Mail className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            <motion.div 
              className="max-w-4xl w-full mx-4 relative"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
            >
              <motion.img
                layoutId={`photo-${selectedPhoto.id}`}
                src={selectedPhoto.url}
                alt={`Photo ${selectedPhoto.id}`}
                className="w-full h-auto rounded-lg"
              />

              {/* QR Code Modal */}
              <AnimatePresence>
                {showQRCode && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-lg shadow-xl"
                  >
                    <button
                      onClick={() => setShowQRCode(false)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <div className="text-center">
                      <QRCodeSVG
                        value={selectedPhoto.url}
                        size={200}
                        level="H"
                        includeMargin
                      />
                      <p className="mt-4 text-sm text-gray-600">
                        Scannez pour télécharger la photo
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Print Options Modal */}
              <AnimatePresence>
                {showPrintOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-lg shadow-xl w-96"
                  >
                    <button
                      onClick={() => setShowPrintOptions(false)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Imprimer la photo
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre de copies
                        </label>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setPrintQuantity(Math.max(1, printQuantity - 1))}
                            className="p-2 border rounded-md hover:bg-gray-50"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={printQuantity}
                            onChange={(e) => setPrintQuantity(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                            className="w-20 text-center border rounded-md"
                          />
                          <button
                            onClick={() => setPrintQuantity(Math.min(10, printQuantity + 1))}
                            className="p-2 border rounded-md hover:bg-gray-50"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={handlePrint}
                        disabled={isPrinting}
                        className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                      >
                        {isPrinting ? (
                          <>
                            <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                            Impression en cours...
                          </>
                        ) : (
                          'Imprimer'
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Form Modal */}
              <AnimatePresence>
                {showEmailForm && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-lg shadow-xl w-96"
                  >
                    <button
                      onClick={() => setShowEmailForm(false)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Recevoir la photo par email
                    </h3>
                    <form onSubmit={handleEmail} className="space-y-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Adresse email
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSendingEmail}
                        className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                      >
                        {isSendingEmail ? (
                          <>
                            <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                            Envoi en cours...
                          </>
                        ) : (
                          'Envoyer'
                        )}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}