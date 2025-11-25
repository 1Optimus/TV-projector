import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy'; // ⬅️ Importa el plugin

export default defineConfig({
  plugins: [
    react(),
    // ➡️ Configuración del plugin legacy
    legacy({
      targets: [
        'defaults', 
        'not IE 11', 
        'android >= 6', // Para compatibilidad con Samsung/Android antiguos  // Un target específico de Samsung
      ],
      // Puedes especificar si usar polyfills para módulos ES (opcional)
      modernPolyfills: true,
    })
  ],
  // Otros ajustes de Vite...
});