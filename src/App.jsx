import { useState, useEffect } from 'react';
import './App.css';

// ⚙️ CONFIGURACIÓN Y CONSTANTES
// Las rutas relativas aseguran que solo se carguen una vez desde el bundle de Vite.
const ALL_IMAGE_URLS = { 
  '1': "../f1.jpg", 
  '2': "../f2.jpg",
  '3': "../f3.jpg",
  '4': "../f4.jpg",
};

const MORNING_KEYS = ['1', '2'];    // Set 1: Rotación con tecla '5'
const DAY_NIGHT_KEYS = ['3', '4']; // Set 2: Rotación con tecla '6'

const ROTATION_INTERVAL_MS = 10000;  // Rotación cada 10 segundos

function App() {

  // --- ESTADOS DE ROTACIÓN E IMAGEN ---
  const [isRotating, setIsRotating] = useState(false);
  const [currentImageSet, setCurrentImageSet] = useState(DAY_NIGHT_KEYS); 
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0); 
  const [imageUrl, setImageUrl] = useState(ALL_IMAGE_URLS[DAY_NIGHT_KEYS[0]]);


  // --- UTILIDAD: Maneja la rotación manual (adelante/atrás) ---
  const handleManualRotation = (direction) => {
      // Usamos la forma funcional de setState para garantizar la consistencia
      setCurrentKeyIndex(prevIndex => {
          const totalKeys = currentImageSet.length;
          let newIndex;
          
          // 1. Encontrar el índice de la imagen actualmente mostrada (incluso si la rotación estaba desactivada)
          const currentKey = Object.keys(ALL_IMAGE_URLS).find(key => ALL_IMAGE_URLS[key] === imageUrl);
          let currentIndex = currentImageSet.indexOf(currentKey);

          // Si la imagen actual no está en el set, o si el set tiene un solo elemento, salir.
          if (currentIndex === -1 || totalKeys < 2) {
            currentIndex = prevIndex; // Usar el índice anterior
          }
          
          if (direction === 'next') {
              // Avanzar: usa módulo para volver a 0
              newIndex = (currentIndex + 1) % totalKeys;
          } else if (direction === 'prev') {
              // Retroceder: maneja el -1 sumando totalKeys antes del módulo
              newIndex = (currentIndex - 1 + totalKeys) % totalKeys;
          } else {
              return prevIndex;
          }

          // 2. Actualizar la URL de la imagen con el nuevo índice
          const nextKey = currentImageSet[newIndex];
          setImageUrl(ALL_IMAGE_URLS[nextKey]);

          // 3. Retornar el nuevo índice
          return newIndex;
      });
  };

  // ➡️ --- EFECTO 1: PRECARGA DE IMÁGENES (Se ejecuta solo una vez) ---
  useEffect(() => {
    // 1. Obtener todas las URLs de imagen
    const urlsToPreload = Object.values(ALL_IMAGE_URLS);

    urlsToPreload.forEach(url => {
      // 2. Crear un nuevo elemento Image en JavaScript
      const img = new Image();
      // 3. Asignar la URL para forzar al navegador a descargarla
      img.src = url;
      // Opcional: manejar errores de precarga si es necesario
      img.onerror = () => console.error(`Failed to preload image: ${url}`);
    });
    
    console.log(`Preloaded ${urlsToPreload.length} images into browser cache.`);
    
    // El array vacío asegura que esto solo se ejecute al montar
  }, []);


  // --- EFECTO 2: Manejo de Input de Teclado (Remoto) ---
  useEffect(() => {
    const handleKeyPress = (event) => {
        const key = event.key;

        // 1. Teclas 1, 2, 3, 4 (Modo Imagen Única)
        if (['1', '2', '3', '4'].includes(key)) {
            setIsRotating(false); // Detener rotación automática
            
            const newSet = (key === '1' || key === '2') ? MORNING_KEYS : DAY_NIGHT_KEYS;
            setCurrentImageSet(newSet);
            
            setImageUrl(ALL_IMAGE_URLS[key]);
            console.log(`Mostrando Imagen ${key}`);
            return;
        }

        // 2. Teclas 5, 6 (Modo Rotación de Set)
        if (key === '5' || key === '6') {
            const newSet = (key === '5') ? MORNING_KEYS : DAY_NIGHT_KEYS;
            
            if (isRotating && JSON.stringify(currentImageSet) === JSON.stringify(newSet)) return;

            setCurrentImageSet(newSet);
            setIsRotating(true); // Iniciar rotación automática
            
            setCurrentKeyIndex(0); 
            setImageUrl(ALL_IMAGE_URLS[newSet[0]]);
            console.log(`Iniciando rotación del Set ${key === '5' ? 'Mañana' : 'Día/Noche'}`);
            return;
        }

        // 3. Teclas de Flecha (Control Manual)
        switch (key) {
            case 'ArrowRight':
            case 'Right':
                handleManualRotation('next');
                break;
            case 'ArrowLeft':
            case 'Left':
                handleManualRotation('prev');
                break;
            default:
                break;
        }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
        window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentImageSet, imageUrl]); 
  
  // --- EFECTO 3: Rotación Automática (Solo si isRotating es true) ---
  useEffect(() => {
    let rotationIntervalId;

    if (isRotating) {
        rotationIntervalId = setInterval(() => {
            setCurrentKeyIndex(prevIndex => {
                const totalKeys = currentImageSet.length;
                const nextIndex = (prevIndex + 1) % totalKeys;
                const nextKey = currentImageSet[nextIndex];
                
                // Cuando se establece el nuevo src, el navegador lo buscará en el caché
                setImageUrl(ALL_IMAGE_URLS[nextKey]); 
                
                return nextIndex;
            });
        }, ROTATION_INTERVAL_MS);
    }
    
    return () => {
        if (rotationIntervalId) {
            clearInterval(rotationIntervalId);
        }
    };
  }, [isRotating, currentImageSet]); 

  return (
    <div className="bg-black min-h-screen w-screen p-0 m-0 overflow-hidden flex items-center justify-center">
      
      <img
        src={imageUrl}
        alt="Imagen dinámica en Pantalla Completa"      
        className="max-w-full max-h-full object-cover" 
        onError={() => {          
          console.error("Error al cargar la imagen. Verifique las rutas relativas.");
          setImageUrl("https://placehold.co/2920x1080/FF0000/ffffff?text=ERROR+AL+CARGAR+IMAGEN");
        }}
      />     
    </div>
  );
}

export default App;

/* import { useState, useEffect } from 'react';
import './App.css';

// ⚙️ CONFIGURACIÓN Y CONSTANTES
const ALL_IMAGE_URLS = { 
  '1': "../f1.jpg", 
  '2': "../f2.jpg",
  '3': "../f3.jpg",
  '4': "../f4.jpg",
};

const MORNING_KEYS = ['1', '2'];    // 3:00 AM a 10:59 AM
const DAY_NIGHT_KEYS = ['3', '4']; // 11:00 AM a 2:59 AM

const ROTATION_INTERVAL_MS = 10000;  // Rotación cada 10 segundos
// ➡️ CAMBIO AQUÍ: Cada 5 minutos (300,000 ms)
const TIME_UPDATE_INTERVAL_MS = 300000; 
const TIME_API_URL = 'https://worldtimeapi.org/api/timezone/America/Chicago';

// Configuración de reintento para la conexión
const MAX_RETRIES = 5;

function App() {

  const [currentTime, setCurrentTime] = useState('Cargando hora...');
  const [showClock, setShowClock] = useState(true);
  const [currentImageSet, setCurrentImageSet] = useState(DAY_NIGHT_KEYS); 
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0); 
  const [imageUrl, setImageUrl] = useState(ALL_IMAGE_URLS[DAY_NIGHT_KEYS[0]]);

  // --- UTILIDAD: Determina qué set de imágenes usar ---
  const getCurrentKeys = (hour) => {
    // Periodo de la mañana: 3 (3:00 AM) a 10 (10:59 AM)
    const isMorningPeriod = hour >= 3 && hour <= 10;
    return isMorningPeriod ? MORNING_KEYS : DAY_NIGHT_KEYS;
  };
  
  // --- UTILIDAD: Maneja la rotación manual (adelante/atrás) ---
  const handleManualRotation = (direction) => {
      // Usamos la forma funcional de setState para garantizar que se usa el último índice
      setCurrentKeyIndex(prevIndex => {
          const totalKeys = currentImageSet.length;
          let newIndex;
          
          if (direction === 'next') {
              // Avanzar, usa módulo para volver a 0
              newIndex = (prevIndex + 1) % totalKeys;
          } else if (direction === 'prev') {
              // Retroceder, suma totalKeys antes de módulo para manejar el -1
              newIndex = (prevIndex - 1 + totalKeys) % totalKeys;
          } else {
              return prevIndex; // No hacer nada
          }

          // Actualizar la URL de la imagen con el nuevo índice
          const nextKey = currentImageSet[newIndex];
          setImageUrl(ALL_IMAGE_URLS[nextKey]);

          return newIndex;
      });
  };

  // --- EFECTO 1: Control de Hora y Set de Imágenes (Se ejecuta cada cierto tiempo) ---
  useEffect(() => {
    
    // Función de reintento con contador de intentos
    const fetchTimeAndSetImageSet = async (retryCount = 0) => {
      try {
        const response = await fetch(TIME_API_URL);

        if (!response.ok) {
           throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        // --- Cálculo y Lógica del Tiempo ---
        const date = new Date(data.datetime);
        const hour = date.getHours(); 
        
        const newKeys = getCurrentKeys(hour);
        const isMorningPeriod = newKeys === MORNING_KEYS;

        // 1. Configurar la visibilidad del reloj
        setShowClock(!isMorningPeriod); 
        
        // 2. Determinar si el set de imágenes debe cambiar
        setCurrentImageSet(prevKeys => {
            if (JSON.stringify(prevKeys) !== JSON.stringify(newKeys)) {
                setCurrentKeyIndex(0); 
                setImageUrl(ALL_IMAGE_URLS[newKeys[0]]);
                return newKeys;
            }
            return prevKeys; 
        });

        // 3. Configurar la hora para el display
        const timeString = date.toLocaleTimeString('es-MX', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false 
        });
        setCurrentTime(timeString);
        // --- Fin de Cálculo y Lógica del Tiempo ---

      } catch (error) {
        console.error("Fallo al obtener la hora:", error);
        
        // ➡️ LÓGICA DE REINTENTO
        if (retryCount < MAX_RETRIES) {
            console.log(`Reintentando conexión... Intento ${retryCount + 1}/${MAX_RETRIES}`);
            setTimeout(() => fetchTimeAndSetImageSet(retryCount + 1), 2000); 
        } else {
            setCurrentTime('Error de hora: Conexión inestable');
        }
      }
    };

    fetchTimeAndSetImageSet(); // Ejecutar inmediatamente al montar
    
    // Intervalo para revaluar el tiempo
    const timeIntervalId = setInterval(fetchTimeAndSetImageSet, TIME_UPDATE_INTERVAL_MS); 

    return () => clearInterval(timeIntervalId);
  }, []); 

  // --- EFECTO 2: Rotación Automática de Imágenes ---
  useEffect(() => {
    const ALL_KEYS = Object.keys(currentImageSet); 
    
    const rotateImage = () => {
      setCurrentKeyIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % ALL_KEYS.length;
        const nextKey = currentImageSet[nextIndex];
        
        setImageUrl(ALL_IMAGE_URLS[nextKey]);
        
        return nextIndex;
      });
    };

    const rotationIntervalId = setInterval(rotateImage, ROTATION_INTERVAL_MS);

    return () => clearInterval(rotationIntervalId);
    
  }, [currentImageSet]); 
  
  // ➡️ --- EFECTO 3: Manejo de Input de Teclado (Remoto) ---
  useEffect(() => {
    const handleKeyPress = (event) => {
        // La propiedad 'key' es el estándar moderno
        switch (event.key) {
            case 'ArrowRight':
            case 'Right': // Algunas implementaciones antiguas usan solo 'Right'
                handleManualRotation('next');
                break;
            case 'ArrowLeft':
            case 'Left': // Algunas implementaciones antiguas usan solo 'Left'
                handleManualRotation('prev');
                break;
            case 'Enter':
            case 'NumpadEnter':
            case 'OK': // Tecla Aceptar
                // Aquí podrías añadir lógica si es necesario (ej: pausar)
                console.log("Acción Aceptar/Enter detectada.");
                break;
            default:
                // Ignorar otras teclas
                break;
        }
    };

    // Escuchar eventos de teclado en toda la ventana
    window.addEventListener('keydown', handleKeyPress);

    // Limpieza: importante remover el listener al desmontar el componente
    return () => {
        window.removeEventListener('keydown', handleKeyPress);
    };
    // Dependemos de currentImageSet para saber el límite de la rotación
  }, [currentImageSet]); 

  return (
    <div className="bg-black min-h-screen w-screen p-0 m-0 overflow-hidden flex items-center justify-center">
      
      {showClock && (
        <div style={{ position: 'absolute', top: '10px', left: '10px', color: 'white', fontSize: '2em', zIndex: 100, fontWeight: 'bold' }}>
          {currentTime}
        </div>
      )}
      
      <img
        src={imageUrl}
        alt="Imagen dinámica en Pantalla Completa"      
        className="max-w-full max-h-full object-cover" 
        onError={() => {          
          console.error("Error al cargar la imagen.");
          setImageUrl("https://placehold.co/2920x1080/FF0000/ffffff?text=ERROR+AL+CARGAR+IMAGEN");
        }}
      />
    </div>
  );
}

export default App; */