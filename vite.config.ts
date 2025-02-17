import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss(),],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'), 
      '@constants': path.resolve(__dirname, 'src/constants'), 
      '@layouts': path.resolve(__dirname, 'src/layouts'), 
      '@lib': path.resolve(__dirname, 'src/lib'), 
      '@modules': path.resolve(__dirname, 'src/modules'), 
      '@pages': path.resolve(__dirname, 'src/pages'), 
      '@routes': path.resolve(__dirname, 'src/routes'), 
      '@services': path.resolve(__dirname, 'src/services'), 
      '@store': path.resolve(__dirname, 'src/store'), 
      '@styles': path.resolve(__dirname, 'src/styles'), 
      '@assets': path.resolve(__dirname, 'src/assets'), 
    },
  },
});
