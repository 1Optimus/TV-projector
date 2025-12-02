import { useState, useEffect } from 'react';
import './App.css';

// ⚙️ CONFIGURACIÓN DE IMÁGENES (ESTRUCTURA DE 3 NIVELES)
// Estructura: Opción (1-3) -> Set/Día -> Array de Imágenes
const IMAGE_SETS = {
   "1": {
    "Lunes": ["../ml.jpg"],
    "Martes": ["../mm.jpg"],
    "Miercoles": ["../mmi.jpg"],
    "Jueves": ["../mj.jpg"],
    "Viernes": ["../mv.jpg"],
    "Sabado": ["../ms.jpg"],
  },
  "2": {
    "Lunes": ["../f4.jpg", "../f5.jpg", "../f6.jpg","../f7.jpg","../f8.jpg"],
    "Martes": ["../f4.jpg", "../f5.jpg", "../fvm.jpg","../f7.jpg","../f8.jpg"],
    "Miercoles": ["../f4.jpg", "../f5.jpg", "../fvmi.jpg","../f7.jpg","../f8.jpg"],
    "Jueves": ["../f4.jpg", "../f5.jpg", "../fvj.jpg","../f7.jpg","../f8.jpg"],
    "Viernes": ["../f4.jpg", "../f5.jpg", "../fvv.jpg","../f7.jpg","../f8.jpg"],
    "Sabado": ["../f4.jpg", "../f5.jpg", "../fvs.jpg","../f7.jpg","../f8.jpg"],
  },
  "3": {
    "Lunes": ["../f4.jpg", "../f5.jpg", "../f6.jpg","../f7.jpg","../f8.jpg"],
    "Martes": ["../f4.jpg", "../f5.jpg", "../fvm.jpg","../f7.jpg","../f8.jpg"],
    "Miercoles": ["../f4.jpg", "../f5.jpg", "../fvmi.jpg","../f7.jpg","../f8.jpg"],
    "Jueves": ["../f4.jpg", "../f5.jpg", "../fvj.jpg","../f7.jpg","../f8.jpg"],
    "Viernes": ["../f4.jpg", "../f5.jpg", "../fvv.jpg","../f7.jpg","../f8.jpg"],
    "Sabado": ["../f4.jpg", "../f5.jpg", "../fvs.jpg","../f7.jpg","../f8.jpg"],
  },
};

const ROTATION_INTERVAL_MS = 10000; // Rotación cada 10 segundos
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
  const [imageUrl, setImageUrl] = useState(currentImageArray[0]);
  
  // Estado para forzar la transición (fade-in)
  const [imageKey, setImageKey] = useState(Date.now()); 

  // --- UTILIDAD: Rotación Manual ---
  const handleManualRotation = (direction) => {
      setIsRotating(false); // Pausar rotación al usar flechas
      
      setCurrentImageIndex(prevIndex => {
          const totalImages = currentImageArray.length;
          if (totalImages <= 1) return prevIndex;

          let newIndex = prevIndex;
          if (direction === 'next') {
              newIndex = (prevIndex + 1) % totalImages;
          } else if (direction === 'prev') {
              newIndex = (prevIndex - 1 + totalImages) % totalImages;
          }

          setImageUrl(currentImageArray[newIndex]);
          setImageKey(Date.now()); // Transición
          return newIndex;
      });
  };

  // --- EFECTO 1: PRECARGA DE TODAS LAS IMÁGENES ---
  useEffect(() => {
    // Aplanamos la estructura de 3 niveles para obtener todas las URLs
    const allUrls = Object.values(IMAGE_SETS).flatMap(optionSets => 
        Object.values(optionSets).flat()
    );

    allUrls.forEach(url => {
      const img = new Image();
      img.src = url;
      img.onerror = () => console.error(`Error precargando: ${url}`);
    });
    
    console.log(`Precargando ${allUrls.length} imágenes en caché.`);
  }, []);

  // --- EFECTO 2: CONTROL DE TECLADO ---
  useEffect(() => {
    const handleKeyPress = (event) => {
        const key = event.key;

        // 1. Selección de Opción Principal (Teclas 1, 2, 3)
        if (['1', '2', '3'].includes(key)) {
            if (!IMAGE_SETS[key]) return; 

            setSelectedOption(key);
            
            // ➡️ Lógica inteligente: Intentar mantener el día actual del sistema
            const today = getSystemDayKey();
            const nextSetKey = IMAGE_SETS[key][today] ? today : getFirstSetKey(key);

            setCurrentSetKey(nextSetKey);
            setCurrentImageIndex(0);
            setIsRotating(true);
            
            console.log(`Opción ${key} seleccionada. Iniciando en ${nextSetKey}.`);
            return;
        }

        // 2. Selección de Set/Día (Teclas 4, 5, 6, 7, 8, 9)
        // Mapeo: 4->Lunes, 5->Martes, 6->Miercoles, 7->Jueves, 8->Viernes, 9->Sabado
        const dayKeys = Object.keys(IMAGE_SETS[selectedOption]);
        const keyIndex = parseInt(key) - 4; 

        if (keyIndex >= 0 && keyIndex < dayKeys.length) {
            const newSetKey = dayKeys[keyIndex];
            
            setCurrentSetKey(newSetKey);
            setCurrentImageIndex(0); 
            setIsRotating(true); 
            
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
  }, [selectedOption, currentSetKey, currentImageArray]); 

  // --- EFECTO 3: SINCRONIZACIÓN Y ROTACIÓN AUTOMÁTICA ---
  useEffect(() => {
    // 1. Actualizar la imagen inmediatamente cuando cambie la Opción o el Set
    if (currentImageArray.length > 0) {
        setImageUrl(currentImageArray[currentImageIndex]);
        setImageKey(Date.now()); // Transición
    }

    // 2. Configurar el intervalo de rotación
    let intervalId;
    if (isRotating && currentImageArray.length > 1) {
        intervalId = setInterval(() => {
            setCurrentImageIndex(prevIndex => {
                const nextIndex = (prevIndex + 1) % currentImageArray.length;
                setImageUrl(currentImageArray[nextIndex]);
                setImageKey(Date.now()); // Transición
                return nextIndex;
            });
        }, ROTATION_INTERVAL_MS);
    }

    return () => clearInterval(intervalId);
  }, [isRotating, selectedOption, currentSetKey, currentImageArray, currentImageIndex]); 

  return (
    <div className="bg-black min-h-screen w-screen p-0 m-0 overflow-hidden flex items-center justify-center">
      
      <img
        key={imageKey} 
        src={imageUrl}
        alt={`Opción ${selectedOption} - ${currentSetKey}`}
        className="max-w-full max-h-full object-cover fade-in" 
        onError={() => {          
          console.error(`Error cargando imagen: ${imageUrl}`);
          setImageUrl(`https://placehold.co/1920x1080/FF0000/ffffff?text=Error+${selectedOption}+${currentSetKey}`);
        }}
      />
      
    
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', textAlign: 'right', color: 'rgba(255,255,255,0.8)', fontFamily: 'sans-serif', zIndex: 100 }}>
        <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>Opción {selectedOption}</div>
        <div style={{ fontSize: '1.2em' }}>{currentSetKey}</div>
        <div style={{ fontSize: '0.9em' }}>
            {isRotating ? '⟳ Rotando' : '⏸ Pausado'} ({currentImageIndex + 1}/{currentImageArray.length})
        </div>
      </div>
      
    </div>
  );
}

export default App;

