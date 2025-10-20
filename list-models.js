// Script para listar modelos disponibles de Gemini
require('dotenv').config();

async function listGeminiModels() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY no encontrada en .env');
    return;
  }

  try {
    console.log('🔍 Consultando modelos disponibles de Gemini...');
    console.log('🔑 API Key:', apiKey.substring(0, 20) + '...');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('\n📋 Modelos disponibles:');
      console.log('='.repeat(50));

      data.models.forEach((model, index) => {
        console.log(`${index + 1}. ${model.name}`);
        console.log(`   Descripción: ${model.description}`);
        console.log(`   Versión: ${model.version}`);
        console.log(`   Estado: ${model.state}`);
        console.log('');
      });

      console.log('✅ Modelos listados exitosamente');
    } else {
      console.error(`❌ Error ${response.status}: ${response.statusText}`);
      const errorData = await response.text();
      console.error('Detalles del error:', errorData);
    }
  } catch (error) {
    console.error('❌ Error al consultar modelos:', error.message);
  }
}

listGeminiModels();
