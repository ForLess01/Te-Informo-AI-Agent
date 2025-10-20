import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import searchRoutes from './routes/search.routes';

// Cargar variables de entorno desde la raíz del proyecto
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app: Application = express();
const PORT = process.env.PORT || 9374;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', searchRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Te Informo API is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🚨 Error en servidor:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Puerto ${PORT} ocupado. Intenta cerrar otros procesos o cambiar el puerto en .env`);
    process.exit(1);
  }
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('🚨 Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Promesa rechazada no manejada:', reason);
  process.exit(1);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Te Informo Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);

  // Verificar API Key de Gemini
  if (process.env.GEMINI_API_KEY) {
    console.log(`✅ GEMINI_API_KEY configurada (${process.env.GEMINI_API_KEY.substring(0, 10)}...)`);
  } else {
    console.log('⚠️ GEMINI_API_KEY no configurada');
  }
});

// Manejo de errores del servidor
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Puerto ${PORT} ocupado. Intenta cerrar otros procesos o cambiar el puerto en .env`);
    console.error('💡 Sugerencias:');
    console.error(`   1. Cierra otros servidores que puedan estar usando el puerto ${PORT}`);
    console.error(`   2. Cambia el puerto en .env: PORT=${Number(PORT) + 1}`);
    console.error('   3. Reinicia tu computadora');
    // No cerrar el proceso, dejar que el usuario decida
    console.error('🔄 Servidor no iniciado debido a puerto ocupado');
    return;
  } else {
    console.error('🚨 Error del servidor:', error);
  }
});

export default app;
