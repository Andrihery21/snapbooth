import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { saveProcessed } from '../services/photoService';
import { supabase } from '../lib/supabase';

async function fetchConfigurations() {
    try {
      const { data, error } = await supabase.from('configuration').select('*');
      if (error) throw error;
      return data[0]; // Supposons que vous n'avez qu'une seule ligne de configuration
    } catch (err) {
      console.error('Erreur lors de la récupération des configurations:', err);
      return null;
    }
  }

const Effect1 = ({ imageUrl, onEffectApplied, eventID }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedType, setSelectedType] = useState('comic');
    const [selectedCategory, setSelectedCategory] = useState('cartoon');
    const [configurations, setConfigurations] = useState(null);

    useEffect(() => {
        async function loadConfigurations() {
          const fetchedConfigurations = await fetchConfigurations();
          if (fetchedConfigurations) {
            setConfigurations(fetchedConfigurations);
          }
        }
        loadConfigurations();
      }, []);


    const categories = [
        { id: 'cartoon', label: 'Cartoon', image: 'https://445b1d92398484ce075b47fd4b139c09.cdn.bubble.io/f1738648553412x844688566210244600/American%20manga.webp?_gl=1*5jopd5*_gcl_au*NDgyNDM4ODQyLjE3MzU1NTYzNDE.*_ga*NDcxNDQzMDguMTcyNjAzNTQ2NQ..*_ga_BFPVR2DEE2*MTczODY0NzgwMC4xMDEuMS4xNzM4NjQ4NTAxLjU0LjAuMA..' },
        { id: 'sketch', label: 'Dessin' , image: 'https://445b1d92398484ce075b47fd4b139c09.cdn.bubble.io/f1738648686802x274432045340819550/Anime.jpg?_gl=1*1sbmqj3*_gcl_au*NDgyNDM4ODQyLjE3MzU1NTYzNDE.*_ga*NDcxNDQzMDguMTcyNjAzNTQ2NQ..*_ga_BFPVR2DEE2*MTczODY0NzgwMC4xMDEuMS4xNzM4NjQ4NTAxLjU0LjAuMA..'},
        { id: '3d', label: 'Univers', image: 'https://445b1d92398484ce075b47fd4b139c09.cdn.bubble.io/f1738648650406x970009819768427000/3D%20image.jpg?_gl=1*1eqlf64*_gcl_au*NDgyNDM4ODQyLjE3MzU1NTYzNDE.*_ga*NDcxNDQzMDguMTcyNjAzNTQ2NQ..*_ga_BFPVR2DEE2*MTczODY0NzgwMC4xMDEuMS4xNzM4NjQ4NTAxLjU0LjAuMA..' },
        { id: 'carricature', label: 'Carricature', image: 'https://445b1d92398484ce075b47fd4b139c09.cdn.bubble.io/f1739126125629x627173688556666400/Light%20X%20-%20big%20head%2Csmall%20body%2Cchibi%20caricature%20of%20Samurai.jpg?_gl=1*lfa96*_gcl_au*NDgyNDM4ODQyLjE3MzU1NTYzNDE.*_ga*NDcxNDQzMDguMTcyNjAzNTQ2NQ..*_ga_BFPVR2DEE2*MTczOTE2MjcwMi4xMDUuMS4xNzM5MTYyNzIxLjQxLjAuMA..' }

    ];
   
    const filteredCategories = configurations
    ? categories.filter(category => {
        switch (category.id) {
          case 'cartoon':
            return configurations.has_cartoon;
          case 'sketch':
            return configurations.has_dessins;
          case '3d':
            return configurations.has_univers;
          case 'carricature':
            return configurations.has_carricature;
          default:
            return true;
        }
      })
    : categories;


    const effectOptions = {
        'cartoon': [
            { value: 'jpcartoon', label: 'Japanese Manga (I)', image: 'https://445b1d92398484ce075b47fd4b139c09.cdn.bubble.io/f1738130066531x788198107109890300/Cartoon%20yourself-Japanese%20manga%201.jpeg?_gl=1*1ukumme*_gcl_au*NDgyNDM4ODQyLjE3MzU1NTYzNDE.*_ga*NDcxNDQzMDguMTcyNjAzNTQ2NQ..*_ga_BFPVR2DEE2*MTczODEyOTk0Mi45OS4xLjE3MzgxMjk5NjUuMzcuMC4w' },
            { value: 'hongkong', label: 'Hong Kong-style comic style', image: 'https://445b1d92398484ce075b47fd4b139c09.cdn.bubble.io/f1738130194965x174979783034524100/Cartoon%20yourself-Hong%20Kong-style%20comic%20style.png?_gl=1*bpxwrc*_gcl_au*NDgyNDM4ODQyLjE3MzU1NTYzNDE.*_ga*NDcxNDQzMDguMTcyNjAzNTQ2NQ..*_ga_BFPVR2DEE2*MTczODEyOTk0Mi45OS4xLjE3MzgxMjk5NjUuMzcuMC4w' },
            { value: 'comic', label: 'Comic', image: 'https://445b1d92398484ce075b47fd4b139c09.cdn.bubble.io/f1738130249463x992050199711702600/Cartoon%20yourself-Comic.png?_gl=1*k7nz4n*_gcl_au*NDgyNDM4ODQyLjE3MzU1NTYzNDE.*_ga*NDcxNDQzMDguMTcyNjAzNTQ2NQ..*_ga_BFPVR2DEE2*MTczODEyOTk0Mi45OS4xLjE3MzgxMjk5NjUuMzcuMC4w' },
            { value: 'classic_cartoon', label: 'Retro Cartoon', image: 'https://445b1d92398484ce075b47fd4b139c09.cdn.bubble.io/f1738564289696x612361753255373800/Cartoon%20yourself-Retro%20Cartoon.jpeg?_gl=1*zctf53*_gcl_au*NDgyNDM4ODQyLjE3MzU1NTYzNDE.*_ga*NDcxNDQzMDguMTcyNjAzNTQ2NQ..*_ga_BFPVR2DEE2*MTczODU2NDE5NS4xMDAuMS4xNzM4NTY0MjI5LjI2LjAuMA..' },
            { value: 'handdrawn', label: 'Hand-painted', image: 'https://445b1d92398484ce075b47fd4b139c09.cdn.bubble.io/f1738564372772x770852764880884700/Cartoon%20yourself-handdrawn.png?_gl=1*l5nx7u*_gcl_au*NDgyNDM4ODQyLjE3MzU1NTYzNDE.*_ga*NDcxNDQzMDguMTcyNjAzNTQ2NQ..*_ga_BFPVR2DEE2*MTczODU2NDE5NS4xMDAuMS4xNzM4NTY0MjI5LjI2LjAuMA..' },
            { value: 'amcartoon', label: 'American Manga', image: 'https://445b1d92398484ce075b47fd4b139c09.cdn.bubble.io/f1738564431977x708868811400296100/Cartoon%20yourself-American%20manga.jpeg?_gl=1*1tsdhzv*_gcl_au*NDgyNDM4ODQyLjE3MzU1NTYzNDE.*_ga*NDcxNDQzMDguMTcyNjAzNTQ2NQ..*_ga_BFPVR2DEE2*MTczODU2NDE5NS4xMDAuMS4xNzM4NTY0MjI5LjI2LjAuMA..' }
        ],
        'sketch': [
            { value: 'anime', label: 'Japanese Manga (II)', image: 'https://445b1d92398484ce075b47fd4b139c09.cdn.bubble.io/f1738130120365x947590826747246600/Cartoon%20yourself-Japanese%20manga%202.png?_gl=1*1ukumme*_gcl_au*NDgyNDM4ODQyLjE3MzU1NTYzNDE.*_ga*NDcxNDQzMDguMTcyNjAzNTQ2NQ..*_ga_BFPVR2DEE2*MTczODEyOTk0Mi45OS4xLjE3MzgxMjk5NjUuMzcuMC4w' },
            { value: 'claborate', label: 'Chinese fine brushwork painting', image: 'https://445b1d92398484ce075b47fd4b139c09.cdn.bubble.io/f1738130154070x692047786667617400/Cartoon%20yourself-%20Chinese%20fine%20brushwork%20painting.png?_gl=1*1c5rei0*_gcl_au*NDgyNDM4ODQyLjE3MzU1NTYzNDE.*_ga*NDcxNDQzMDguMTcyNjAzNTQ2NQ..*_ga_BFPVR2DEE2*MTczODEyOTk0Mi45OS4xLjE3MzgxMjk5NjUuMzcuMC4w' },
            { value: 'sketch', label: 'Pencil drawing (I)', image: 'https://445b1d92398484ce075b47fd4b139c09.cdn.bubble.io/f1738564526017x784742993887914200/Cartoon%20yourself-Pencil%20drawing.png?_gl=1*1pnmj4m*_gcl_au*NDgyNDM4ODQyLjE3MzU1NTYzNDE.*_ga*NDcxNDQzMDguMTcyNjAzNTQ2NQ..*_ga_BFPVR2DEE2*MTczODU2NDE5NS4xMDAuMS4xNzM4NTY0MjI5LjI2LjAuMA..' },
            { value: 'full', label: 'Pencil drawing (II)', image: 'https://445b1d92398484ce075b47fd4b139c09.cdn.bubble.io/f1738564671766x857421022456529500/Cartoon%20yourself-Pencil%20drawing%202.png?_gl=1*jyp379*_gcl_au*NDgyNDM4ODQyLjE3MzU1NTYzNDE.*_ga*NDcxNDQzMDguMTcyNjAzNTQ2NQ..*_ga_BFPVR2DEE2*MTczODU2NDE5NS4xMDAuMS4xNzM4NTY0MjI5LjI2LjAuMA..' },
            { value: 'head', label: 'Moe Manga', image: 'https://445b1d92398484ce075b47fd4b139c09.cdn.bubble.io/f1738564753249x294964184177892740/Cartoon%20yourself-Moe%20Manga.jpeg?_gl=1*1dwmvo3*_gcl_au*NDgyNDM4ODQyLjE3MzU1NTYzNDE.*_ga*NDcxNDQzMDguMTcyNjAzNTQ2NQ..*_ga_BFPVR2DEE2*MTczODU2NDE5NS4xMDAuMS4xNzM4NTY0MjI5LjI2LjAuMA..' },
            { value: 0 , label: 'Vintage comic', image: 'https://445b1d92398484ce075b47fd4b139c09.cdn.bubble.io/f1738564853684x500805100845962900/0%20-%20AI%20Image%20anime%20generator-0%20Vintage%20Comic..jpg?_gl=1*1qxp9g0*_gcl_au*NDgyNDM4ODQyLjE3MzU1NTYzNDE.*_ga*NDcxNDQzMDguMTcyNjAzNTQ2NQ..*_ga_BFPVR2DEE2*MTczODU2NDE5NS4xMDAuMS4xNzM4NTY0MjI5LjI2LjAuMA..' },
            
            
        ],
        '3d': [
            { value: 'animation3d', label: '3D Animation', image: 'https://445b1d92398484ce075b47fd4b139c09.cdn.bubble.io/f1738130290754x925359529669461600/Cartoon%20yourself-Animation%203D.png?_gl=1*9mjkr7*_gcl_au*NDgyNDM4ODQyLjE3MzU1NTYzNDE.*_ga*NDcxNDQzMDguMTcyNjAzNTQ2NQ..*_ga_BFPVR2DEE2*MTczODEyOTk0Mi45OS4xLjE3MzgxMjk5NjUuMzcuMC4w' },
            { value: 4, label: 'Future technology', image: 'https://445b1d92398484ce075b47fd4b139c09.cdn.bubble.io/f1738564961243x558145837457536300/4-%20AI%20Image%20anime%20generator%20-%204%20Future%20Technology..jpg?_gl=1*1m9lnod*_gcl_au*NDgyNDM4ODQyLjE3MzU1NTYzNDE.*_ga*NDcxNDQzMDguMTcyNjAzNTQ2NQ..*_ga_BFPVR2DEE2*MTczODU2NDE5NS4xMDAuMS4xNzM4NTY0MjI5LjI2LjAuMA..' },
            { value: 5, label: 'Traditional Chinese', image: 'https://445b1d92398484ce075b47fd4b139c09.cdn.bubble.io/f1738565037951x922301476010605700/5-%20AI%20Image%20anime%20generator%20-%205%20Traditional%20Chinese%20Painting%20Style.jpg?_gl=1*v96ncc*_gcl_au*NDgyNDM4ODQyLjE3MzU1NTYzNDE.*_ga*NDcxNDQzMDguMTcyNjAzNTQ2NQ..*_ga_BFPVR2DEE2*MTczODU2NDE5NS4xMDAuMS4xNzM4NTY0MjI5LjI2LjAuMA..' },
            { value: 6, label: 'General in a Hundred Battles', image: 'https://445b1d92398484ce075b47fd4b139c09.cdn.bubble.io/f1738565115416x952288200492438900/6%20-%20AI%20Image%20anime%20generator%20-%206%20General%20in%20a%20Hundred%20Battles..jpg?_gl=1*10ryx3e*_gcl_au*NDgyNDM4ODQyLjE3MzU1NTYzNDE.*_ga*NDcxNDQzMDguMTcyNjAzNTQ2NQ..*_ga_BFPVR2DEE2*MTczODU2NDE5NS4xMDAuMS4xNzM4NTY0MjI5LjI2LjAuMA..' },
            { value: 7, label: 'Colorful Cartoon', image: 'https://445b1d92398484ce075b47fd4b139c09.cdn.bubble.io/f1738565590887x221935701029312600/7%20-AI%20Image%20anime%20generator%20-%20Colorful%20Cartoon.jpg?_gl=1*1u8qd0n*_gcl_au*NDgyNDM4ODQyLjE3MzU1NTYzNDE.*_ga*NDcxNDQzMDguMTcyNjAzNTQ2NQ..*_ga_BFPVR2DEE2*MTczODU2NDE5NS4xMDAuMS4xNzM4NTY0MjI5LjI2LjAuMA..' },
            { value: 8, label: 'Graceful Chinese Style', image: 'https://445b1d92398484ce075b47fd4b139c09.cdn.bubble.io/f1738565647482x402675898065792960/8-%20AI%20Image%20anime%20generator%20-%20Graceful%20Chinese%20Style.jpg?_gl=1*m60rfa*_gcl_au*NDgyNDM4ODQyLjE3MzU1NTYzNDE.*_ga*NDcxNDQzMDguMTcyNjAzNTQ2NQ..*_ga_BFPVR2DEE2*MTczODU2NDE5NS4xMDAuMS4xNzM4NTY0MjI5LjI2LjAuMA..' }
        ],
        'carricature': [
            { value: 'big head,small body,chibi caricature of doctor', label: 'Doctor', image: 'https://445b1d92398484ce075b47fd4b139c09.cdn.bubble.io/f1739125311981x859935082600382700/LightX%20-%20big%20head%2Csmall%20body%2Cchibi%20caricature%20of%20doctor.jpg?_gl=1*1ipc5j5*_gcl_au*NDgyNDM4ODQyLjE3MzU1NTYzNDE.*_ga*NDcxNDQzMDguMTcyNjAzNTQ2NQ..*_ga_BFPVR2DEE2*MTczOTE2MjcwMi4xMDUuMS4xNzM5MTYyNzIxLjQxLjAuMA..' },
            { value: 'big head,small body,chibi caricature of politician', label: 'Politician', image: 'https://445b1d92398484ce075b47fd4b139c09.cdn.bubble.io/f1739125474597x287225342642065200/Light%20X%20-%20big%20head%2Csmall%20body%2Cchibi%20caricature%20of%20politician.jpg?_gl=1*1ipc5j5*_gcl_au*NDgyNDM4ODQyLjE3MzU1NTYzNDE.*_ga*NDcxNDQzMDguMTcyNjAzNTQ2NQ..*_ga_BFPVR2DEE2*MTczOTE2MjcwMi4xMDUuMS4xNzM5MTYyNzIxLjQxLjAuMA..' },
            { value: 'big head,small body,chibi caricature of fire fighter', label: 'Fire fighter', image: 'https://445b1d92398484ce075b47fd4b139c09.cdn.bubble.io/f1739125667741x318419791472486240/Light%20X%20-%20big%20head%2Csmall%20body%2Cchibi%20caricature%20of%20firefighter%20%282%29.jpg?_gl=1*dlt9rb*_gcl_au*NDgyNDM4ODQyLjE3MzU1NTYzNDE.*_ga*NDcxNDQzMDguMTcyNjAzNTQ2NQ..*_ga_BFPVR2DEE2*MTczOTE2MjcwMi4xMDUuMS4xNzM5MTYyNzIxLjQxLjAuMA..' },
            { value: 'big head,small body,chibi caricature of chef', label: 'Chef', image: 'https://445b1d92398484ce075b47fd4b139c09.cdn.bubble.io/f1739125929014x892874969854078300/Light%20X%20-%20big%20head%2Csmall%20body%2Cchibi%20caricature%20of%20chef.jpg?_gl=1*prs4yq*_gcl_au*NDgyNDM4ODQyLjE3MzU1NTYzNDE.*_ga*NDcxNDQzMDguMTcyNjAzNTQ2NQ..*_ga_BFPVR2DEE2*MTczOTE2MjcwMi4xMDUuMS4xNzM5MTYyNzIxLjQxLjAuMA..' },
            { value: 'big head,small body,chibi caricature of rockstar', label: 'Rockstar', image: 'https://445b1d92398484ce075b47fd4b139c09.cdn.bubble.io/f1739162961761x567174639334006000/LightX%20Rockstar-%20big%20head%2Csmall%20body%2Cchibi%20caricature%20of%20rockstar%20%282%29.jpg?_gl=1*m42hag*_gcl_au*NDgyNDM4ODQyLjE3MzU1NTYzNDE.*_ga*NDcxNDQzMDguMTcyNjAzNTQ2NQ..*_ga_BFPVR2DEE2*MTczOTE2MjcwMi4xMDUuMS4xNzM5MTc4MzU1LjI4LjAuMA..' },
            { value: 'big head,small body,chibi caricature of footballer', label: 'Footballer', image: 'https://445b1d92398484ce075b47fd4b139c09.cdn.bubble.io/f1739126050897x142406437776538830/Light%20X%20-%20big%20head%2Csmall%20body%2Cchibi%20caricature%20of%20footballer.jpg?_gl=1*m42hag*_gcl_au*NDgyNDM4ODQyLjE3MzU1NTYzNDE.*_ga*NDcxNDQzMDguMTcyNjAzNTQ2NQ..*_ga_BFPVR2DEE2*MTczOTE2MjcwMi4xMDUuMS4xNzM5MTc4MzU1LjI4LjAuMA..' }
        ]
    };

   

    const handleEffectClick = async (effectType) => {
        setSelectedType(effectType);
       
        await handleClick(effectType);
    };

    const handleClick = async (selectedType) => {
        setLoading(true);
        setError(null);
        try {
            if (!imageUrl) {
                throw new Error("L'URL de l'image n'est pas définie.");
            }

            let newUrl;

            if (selectedCategory === 'carricature') {
                // Premier appel API pour créer la caricature
                const caricatureResponse = await axios.post(
                    'https://proxy.cors.sh/https://api.lightxeditor.com/external/api/v1/caricature',
                    {
                        imageUrl: imageUrl,
                        styleImageUrl: "", // Remplacez par l'URL de l'image de style si nécessaire
                        textPrompt: selectedType // Remplacez par le texte approprié
                    },{
                        headers: {
                            'x-api-key': '5c3f8ca0cbb94ee191ffe9ec4c86d8f1_6740bbef11114053828a6346ebfdd5f5_andoraitools',
                            'Content-Type': 'application/json',
                            'x-cors-api-key':'temp_3c85bd9782d2d0a181a2b83e6e6a71fc'
                        }
                    }
                );
                
                // const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
                // await delay(5000);
                
                const orderId = caricatureResponse.data.body.orderId;
                console.log(orderId);
                
                
                // Deuxième appel API pour obtenir le statut de la commande
                async function getOrderStatus(orderId) {
                    let attempt = 0;
                    while (attempt < 10) { // Limite à 10 tentatives
                        console.log(`Tentative ${attempt + 1} pour récupérer l'image...`);
        
                        const orderStatusResponse = await axios.post(
                            'https://proxy.cors.sh/https://api.lightxeditor.com/external/api/v1/order-status',
                            {
                                orderId: orderId
                            }, {
                                headers: {
                                    'x-api-key': '5c3f8ca0cbb94ee191ffe9ec4c86d8f1_6740bbef11114053828a6346ebfdd5f5_andoraitools',
                                    'Content-Type': 'application/json',
                                    'x-cors-api-key': 'temp_3c85bd9782d2d0a181a2b83e6e6a71fc'
                                }
                            }
                        );
        
                        const outputUrl = orderStatusResponse.data.body.output;
        
                        if (outputUrl) {
                            console.log("URL de l'image:", outputUrl);
                            return outputUrl;
                        }
        
                        console.log("Image pas encore prête, nouvelle tentative dans 5 secondes...");
                        await new Promise(resolve => setTimeout(resolve, 5000)); // Attente de 5 secondes avant la prochaine tentative
                        attempt++;
                    }
        
                    throw new Error("L'image n'a pas été générée après plusieurs tentatives.");
                }

               newUrl = await getOrderStatus(orderId);
                console.log("L'image est prête :", newUrl);
          
                // Remplacez par le champ approprié dans la réponse
            } 
            else if ( (selectedCategory === '3d' && selectedType !== 'animation3d') || (selectedCategory === 'sketch' && selectedType === 0) ) {
                const imageResponse = await fetch(imageUrl);
                const imageArrayBuffer = await imageResponse.arrayBuffer();
                const imageFile = new File([imageArrayBuffer], 'capture.jpg', { type: 'image/jpeg' });
                const formData = new FormData();
                formData.append('index', selectedType);
                formData.append('image', imageFile);
                formData.append('task_type', "async");
                const response = await axios.post(
                    'https://www.ailabapi.com/api/image/effects/ai-anime-generator',
                    formData,
                    {
                        headers: {
                            'ailabapi-api-key': import.meta.env.VITE_AILAB_API_KEY,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                if (response.data.error_code !== 0) {
                    throw new Error(response.data.error_msg || 'Erreur lors du traitement de l\'image');
                }
                 const taskID = response.data.task_id;
                 console.log("Le task ID est :", taskID);

                 async function getOrderStatus(taskID) {
                    let attempt = 0;
                    while (attempt < 20) { // Limite à 10 tentatives
                        console.log(`Tentative ${attempt + 1} pour récupérer l'image...`);
        
                        const orderStatusResponse = await axios.get(
                            'https://www.ailabapi.com/api/common/query-async-task-result',
                            {
                                params: {
                                    'task_id': taskID // Utilisez directement la variable taskID
                                },
                                headers: {
                                    'ailabapi-api-key': import.meta.env.VITE_AILAB_API_KEY
                                }
                            }
                        );
                        console.log("Voici est la reponse",orderStatusResponse);
                        const outputUrl = orderStatusResponse.data.task_status;
        
                        if (outputUrl == 2) {
                            console.log("URL de l'image:", outputUrl);
                            return orderStatusResponse.data.data.result_url;
                        }
        
                        console.log("Image pas encore prête, nouvelle tentative dans 5 secondes...");
                        await new Promise(resolve => setTimeout(resolve, 5000)); // Attente de 5 secondes avant la prochaine tentative
                        attempt++;
                    }
        
                    throw new Error("L'image n'a pas été générée après plusieurs tentatives.");
                }

               newUrl = await getOrderStatus(taskID);
                console.log("L'image est prête :", newUrl);
            }
           
            else { 

            const imageResponse = await fetch(imageUrl);
            const imageArrayBuffer = await imageResponse.arrayBuffer();
            const imageFile = new File([imageArrayBuffer], 'capture.jpg', { type: 'image/jpeg' });
            const formData = new FormData();
            formData.append('type', selectedType);
            formData.append('image', imageFile);
            const response = await axios.post(
                'https://www.ailabapi.com/api/portrait/effects/portrait-animation',
                formData,
                {
                    headers: {
                        'ailabapi-api-key': import.meta.env.VITE_AILAB_API_KEY,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            if (response.data.error_code !== 0) {
                throw new Error(response.data.error_msg || 'Erreur lors du traitement de l\'image');
            }
             newUrl = response.data.data.image_url;
             console.log("Voici le style de filtre choisi", selectedType);
             console.log('EventID dans Effect1:', eventID);
        }
            const saveResult = await saveProcessed(newUrl, eventID);
            if (!saveResult.success) {
                throw new Error(saveResult.error || 'Erreur lors de la sauvegarde de l\'image traitée');
            }
            onEffectApplied(saveResult.url);
        } catch (error) {
            console.error('Erreur lors du traitement:', error);
            setError(error.message || 'Une erreur est survenue lors du traitement de l\'image');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-black/80 p-1">
            <div className="fixed left-0 top-0 h-screen w-40 bg-gray-800 p-4 flex flex-col space-y-4">
                {filteredCategories.map((category) => (
                    <button
                        key={category.id}
                        className={`p-3 text-white rounded-md ${selectedCategory === category.id ? 'bg-gray-400' : 'bg-gray-600'}`}
                        onClick={() => setSelectedCategory(category.id)}
                    >
                         <div className="w-full h-24 bg-gray-500 rounded-t-lg flex items-center justify-center overflow-hidden">
                            <img src={category.image} alt={category.label} className="w-full h-full object-cover" />
                        </div>
                       
                        {category.label}
                    </button>
                ))}
            </div>
            <div className="ml-40 flex-1 p-6 grid grid-cols-6 gap-4">
                {effectOptions[selectedCategory].map((option) => (
                    <button
                        key={option.value}
                        onClick={() => handleEffectClick(option.value)}
                        className="w-32 h-32 flex flex-col items-center justify-center bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold rounded-lg shadow-md transition-all"
                    >
                        <div className="w-full h-24 bg-gray-500 rounded-t-lg flex items-center justify-center overflow-hidden">
                            <img src={option.image} alt={option.label} className="w-full h-full object-cover" />
                        </div>
                        <span className="mt-2 text-center">{option.label}</span>
                    </button>
                ))}
                
                {loading && <div className="w-full col-span-6 flex items-center justify-center h-16"><p className='text-white'>Traitement en cours...</p></div>} 
                 {error && <p className="error">{error}</p>} 
                 
            </div>
        </div>
    );
};

export default Effect1;