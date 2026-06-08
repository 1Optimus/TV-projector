import { useState, useEffect } from 'react';
import './App.css';

// ⚙️ CONFIGURACIÓN DE IMÁGENES (ESTRUCTURA DE 3 NIVELES)
// Estructura: Opción (1-3) -> Set/Día -> Array de Imágenes
const IMAGE_SETS = {
   "1": {
    "Lunes": ["../v1.jpg", "../v2.jpg", "../v3.jpg"],
    "Martes": ["../v1.jpg", "../v2.jpg", "../v3.jpg"],
    "Miercoles": ["../v1.jpg", "../v2.jpg", "../v3.jpg"],
    "Jueves": ["../v1.jpg", "../v2.jpg", "../v3.jpg"],
    "Viernes": ["../v1.jpg", "../v2.jpg", "../v3.jpg"],
    "Sabado": ["../v1.jpg", "../v2.jpg", "../v3.jpg"],
  },
  "2": {
    "Lunes": ["../v4.jpg", "../v5.jpg", "../v6.jpg"],
    "Martes": ["../v4.jpg", "../v5.jpg", "../v6.jpg"],
    "Miercoles": ["../v4.jpg", "../v5.jpg", "../v6.jpg"],
    "Jueves": ["../v4.jpg", "../v5.jpg", "../v6.jpg"],
    "Viernes": ["../v4.jpg", "../v5.jpg", "../v6.jpg"],
    "Sabado": ["../v4.jpg", "../v5.jpg", "../v6.jpg"],
  },
  "3": {
    "Lunes": ["../v7.jpg", "../v2.jpg"],
    "Martes": ["../v7.jpg", "../v2.jpg"],
    "Miercoles": ["../v7.jpg", "../v2.jpg"],
    "Jueves": ["../v7.jpg", "../v2.jpg"],
    "Viernes": ["../v7.jpg", "../v2.jpg"],
    "Sabado": ["../v7.jpg", "../v2.jpg"],
  },
};

const ROTATION_INTERVAL_MS = 7000; // Rotación cada 5 segundos
const DEFAULT_OPTION = "1";

// --- NUEVA UTILIDAD: Obtener el día actual del sistema ---
const getSystemDayKey = () => {
  const days = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
  return days[new Date().getDay()];
};

// Función auxiliar para obtener el primer "Día" (Set) de una opción (Fallback)
const getFirstSetKey = (option) => Object.keys(IMAGE_SETS[option])[0];

function App() {

  // --- ESTADOS ---
  const [selectedOption, setSelectedOption] = useState(DEFAULT_OPTION); 
  
  // ➡️ INICIALIZACIÓN AUTOMÁTICA DEL DÍA
  const [currentSetKey, setCurrentSetKey] = useState(() => {
    const today = getSystemDayKey();
    // Si hoy existe en la configuración, úsalo. Si es Domingo y no existe, usa el primero (Lunes).
    if (IMAGE_SETS[DEFAULT_OPTION][today]) {
        return today;
    }
    return getFirstSetKey(DEFAULT_OPTION);
  });
  
  const [isRotating, setIsRotating] = useState(true); 

  // Obtener el array de imágenes actual basado en la Opción y el Set (Día)
  const currentImageArray = IMAGE_SETS[selectedOption]?.[currentSetKey] || [];
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0); 
  
  // Estados para la transición tipo slide
  const [imageUrl, setImageUrl] = useState(currentImageArray[0]);
  const [prevImageUrl, setPrevImageUrl] = useState(null);
  const [slideDirection, setSlideDirection] = useState('next');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageKey, setImageKey] = useState(Date.now());
  
  // Nuevo Estado: Forzar actualización de caché
  const [globalCacheBuster, setGlobalCacheBuster] = useState("");

  // --- UTILIDAD: Función central para cambiar de imagen ---
  const changeImage = (newIndex, direction, newImageArray = currentImageArray) => {
      setPrevImageUrl(imageUrl);
      setCurrentImageIndex(newIndex);
      setImageUrl(newImageArray[newIndex]);
      setSlideDirection(direction);
      setIsTransitioning(true);
      setImageKey(Date.now());
      
      // Limpiar el estado de transición después de que termine la animación
      setTimeout(() => {
          setIsTransitioning(false);
          setPrevImageUrl(null);
      }, 800); // 800ms debe coincidir con la animación CSS
  };

  // --- UTILIDAD: Rotación Manual ---
  const handleManualRotation = (direction) => {
      setIsRotating(false); // Pausar rotación al usar flechas
      
      const totalImages = currentImageArray.length;
      if (totalImages <= 1) return;

      let newIndex = currentImageIndex;
      if (direction === 'next') {
          newIndex = (currentImageIndex + 1) % totalImages;
      } else if (direction === 'prev') {
          newIndex = (currentImageIndex - 1 + totalImages) % totalImages;
      }

      changeImage(newIndex, direction);
  };

  // --- EFECTO 1: PRECARGA DE TODAS LAS IMÁGENES ---
  useEffect(() => {
    // Aplanamos la estructura de 3 niveles para obtener todas las URLs
    const allUrls = Object.values(IMAGE_SETS).flatMap(optionSets => 
        Object.values(optionSets).flat()
    );

    allUrls.forEach(url => {
      const img = new Image();
      img.src = url + globalCacheBuster;
      img.onerror = () => console.error(`Error precargando: ${url}`);
    });
    
    console.log(`Precargando ${allUrls.length} imágenes en caché.`);
  }, [globalCacheBuster]);

  // --- EFECTO 2: CONTROL DE TECLADO ---
  useEffect(() => {
    const handleKeyPress = (event) => {
        const key = event.key;

        // 0. Forzar actualización de caché (Cache Busting)
        if (key === '0' || key.toLowerCase() === 'r') {
            const newBuster = `?t=${Date.now()}`;
            setGlobalCacheBuster(newBuster);
            console.log("🔄 Forzando actualización de caché de imágenes...");
            return;
        }

        // 1. Selección de Opción Principal (Teclas 1, 2, 3)
        if (['1', '2', '3'].includes(key)) {
            if (!IMAGE_SETS[key]) return; 

            setSelectedOption(key);
            
            // Lógica inteligente: Intentar mantener el día actual del sistema
            const today = getSystemDayKey();
            const nextSetKey = IMAGE_SETS[key][today] ? today : getFirstSetKey(key);
            const newArray = IMAGE_SETS[key][nextSetKey];

            setCurrentSetKey(nextSetKey);
            setIsRotating(true);
            
            changeImage(0, 'next', newArray);
            console.log(`Opción ${key} seleccionada. Iniciando en ${nextSetKey}.`);
            return;
        }

        // 2. Selección de Set/Día (Teclas 4, 5, 6, 7, 8, 9)
        const dayKeys = Object.keys(IMAGE_SETS[selectedOption]);
        const keyIndex = parseInt(key) - 4; 

        if (keyIndex >= 0 && keyIndex < dayKeys.length) {
            const newSetKey = dayKeys[keyIndex];
            const newArray = IMAGE_SETS[selectedOption][newSetKey];
            
            setCurrentSetKey(newSetKey);
            setIsRotating(true); 
            
            changeImage(0, 'next', newArray);
            console.log(`Cambiando manualmente a día: ${newSetKey}`);
            return;
        }

        // 3. Control Manual de Imágenes (Flechas)
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
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedOption, currentSetKey, currentImageArray, currentImageIndex, imageUrl]); 

  // --- EFECTO 3: ROTACIÓN AUTOMÁTICA ---
  useEffect(() => {
    let intervalId;
    if (isRotating && currentImageArray.length > 1) {
        intervalId = setInterval(() => {
            const nextIndex = (currentImageIndex + 1) % currentImageArray.length;
            changeImage(nextIndex, 'next');
        }, ROTATION_INTERVAL_MS);
    }
    return () => clearInterval(intervalId);
  }, [isRotating, currentImageArray, currentImageIndex, imageUrl]); 

  // --- RENDER ---
  const getAnimationClass = (isCurrent) => {
      if (!isTransitioning) return "";
      if (isCurrent) {
          return slideDirection === 'next' ? 'slide-in-next' : 'slide-in-prev';
      } else {
          return slideDirection === 'next' ? 'slide-out-next' : 'slide-out-prev';
      }
  };

  return (
    <div className="bg-black min-h-screen w-screen p-0 m-0 overflow-hidden relative flex items-center justify-center" style={{ position: 'relative' }}>
      
      {/* Imagen Anterior (saliendo) */}
      {prevImageUrl && (
        <img
          src={prevImageUrl + globalCacheBuster}
          alt="Anterior"
          className={`img-transition ${getAnimationClass(false)}`}
          onError={(e) => e.target.style.display = 'none'}
        />
      )}
      
      {/* Imagen Actual (entrando o estática) */}
      <img
        key={imageKey} 
        src={imageUrl + globalCacheBuster}
        alt={`Opción ${selectedOption} - ${currentSetKey}`}
        className={`img-transition ${getAnimationClass(true)}`} 
        onError={() => {          
          console.error(`Error cargando imagen: ${imageUrl}`);
          setImageUrl(`https://placehold.co/1920x1080/FF0000/ffffff?text=Error+${selectedOption}+${currentSetKey}`);
        }}
      />
      
    </div>
  );
}

export default App;

