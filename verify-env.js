// Script para verificar que el .env se carga correctamente
require('dotenv').config();

console.log('=== VERIFICACIÓN DE .ENV ===');
console.log('Ruta actual:', __dirname);
console.log('');

if (process.env.GEMINI_API_KEY) {
  console.log('✅ GEMINI_API_KEY encontrada');
  console.log('   Primeros 20 caracteres:', process.env.GEMINI_API_KEY.substring(0, 20) + '...');
  console.log('   Longitud total:', process.env.GEMINI_API_KEY.length, 'caracteres');
} else {
  console.log('❌ GEMINI_API_KEY NO encontrada');
}

console.log('');
console.log('Todas las variables de entorno cargadas:');
console.log('PORT:', process.env.PORT);
console.log('MAX_RESULTS:', process.env.MAX_RESULTS);
console.log('TIMEOUT_MS:', process.env.TIMEOUT_MS);
