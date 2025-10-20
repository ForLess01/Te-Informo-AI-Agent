<p align="center">
  <img src="https://svgl.app/library/arc.svg" alt="# Te Informo - Agente AI Conversacional 🤖
</p>

<h1 align="center">
  Te Informo 🤖📰
</h1>

<p align="center">
  <strong>Un agente conversacional inteligente que combate la sobrecarga informativa y redefine tu forma de descubrir noticias.</strong>
</p>

<p align="center">
  <img alt="Estado del Proyecto" src="https://img.shields.io/badge/estado-en%20desarrollo-yellowgreen">
  <img alt="Lenguaje Principal" src="https://img.shields.io/badge/language-TypeScript-blue.svg">
  <img alt="Backend" src="https://img.shields.io/badge/backend-Node.js-green">
  <img alt="Licencia" src="https://img.shields.io/badge/licencia-MIT-purple">
</p>

---

## 📚 Tabla de Contenidos
* [El Problema](#-el-problema)
* [Stack Tecnológico](#-stack-tecnológico)
* [Solución y Criterios de Éxito](#-solución-y-criterios-de-éxito)
* [🚀 Instalación y Configuración](#-instalación-y-configuración)
* [📖 Uso](#-uso)
* [🔧 Desarrollo](#-desarrollo)
* [Conoce al Equipo](#-conoce-al-equipo)

---

## 🎯 El Problema

En la era digital, buscar información es agotador. Actuamos como nuestros propios gestores de proyectos: formulamos búsquedas, filtramos ruido, gestionamos pestañas y sintetizamos datos. Este proceso genera una **alta carga cognitiva** que nos aleja del objetivo principal: aprender.

**Nuestra Solución:** Un agente que asume esa carga. **Te Informo** actúa como tu asistente de investigación personal que navega el caos, filtra lo irrelevante y te presenta resúmenes claros, permitiéndote concentrarte en lo que de verdad importa: el conocimiento.

---

## 🛠️ Stack Tecnológico

Hemos seleccionado un conjunto de herramientas modernas y robustas para construir una plataforma escalable y eficiente.

| Componente              | Tecnologías                                                                                                | Propósito                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 🧠 **Backend** | `Node.js`, `Express.js`, `TypeScript`                                                                      | Construir un servidor rápido, seguro y bien estructurado.                       |
| 🌐 **Web Scraping** | `Axios`, `Cheerio`                                                                                         | Extraer información de sitios de noticias de forma eficiente.                  |
| 🤖 **Inteligencia** | Lógica **MCTS** (potencialmente con `Gemini API`)                                                          | Procesar texto, resumir y generar sugerencias conversacionales inteligentes.   |
| 🎨 **Frontend** | `TypeScript`, `Handlebars`, `Tailwind CSS`                                                                 | Crear una interfaz de chat interactiva, moderna y completamente responsiva.    |
| 📦 **Empaquetado** | `Electron`, `Electron Builder`                                                                             | Transformar la aplicación web en un programa instalable (`.exe`) para Windows. |
| 🚀 **Despliegue** | `GitHub` (Control de Versiones) y `Vercel` (Hosting)                                                       | Asegurar un ciclo de desarrollo y despliegue continuo y automatizado.          |

---

## ✅ Solución y Criterios de Éxito

### ✨ Funcionalidades Clave
- **💬 Interfaz de Chat Intuitiva:** Una experiencia de usuario fluida y agradable.
- **🔍 Web Scraper Inteligente:** El agente extrae noticias y las presenta de forma clara (titulares y resúmenes).
- **💡 Sugerencias Contextuales:** Botones de sugerencia que se adaptan a la conversación y guían la exploración.
- **🔄 Búsqueda Refinada:** Al hacer clic en una sugerencia, la búsqueda se adapta visiblemente al nuevo contexto.

### 📈 Pruebas de Éxito
Para validar nuestra solución, nos enfocamos en estos resultados medibles:

1.  **Prueba de Flujo Conversacional:** En una sesión de 5 turnos, un usuario debe seguir al menos **2 sugerencias** del agente, demostrando su utilidad.
2.  **Prueba de Adaptación Contextual:** Si el usuario busca `Tesla` y selecciona `Baterías`, la siguiente búsqueda debe ser específicamente sobre `baterías de Tesla`.
3.  **Prueba de Descubrimiento:** El agente debe proponer un subtema relevante que **no fue mencionado explícitamente** por el usuario, fomentando la exploración.

---

## 🚀 Instalación y Configuración

### 📋 Prerrequisitos
- **Node.js** 18+ (recomendado: versión LTS)
- **npm** (viene con Node.js)
- **Git** para clonar el repositorio

### 🔧 Instalación

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/ForLess01/Te-Informo-AI-Agent.git
   cd Te-Informo-AI-Agent
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**
   
   Crea un archivo `.env` en la raíz del proyecto:
   ```bash
   # Puerto del servidor backend (opcional, por defecto: 9374)
   PORT=9374
   
   # API Key de Google Gemini (OBLIGATORIO) en el un archivo .env
   GEMINI_API_KEY=tu_api_key_aqui
   
   # Configuraciones opcionales
   MAX_RESULTS=10
   TIMEOUT_MS=30000
   ```

   **🔑 Obtener API Key de Gemini:**
   1. Ve a [Google AI Studio](https://aistudio.google.com/)
   2. Inicia sesión con tu cuenta de Google
   3. Crea un nuevo proyecto o selecciona uno existente
   4. Genera una API Key
   5. Copia la key y pégala en tu archivo `.env`

### 🎯 Primera ejecución (pasos obligatorios)

**⚠️ IMPORTANTE:** Después de clonar el repo, debes seguir estos pasos antes de ejecutar:

1. **Crear archivo `.env`:**
   ```bash
   # Crear el archivo (Linux/Mac)
   touch .env
   
   # O crear manualmente en Windows
   # Crear un archivo llamado ".env" en la raíz del proyecto
   ```

2. **Agregar tu API Key de Gemini:**
   ```env
   # Copia este contenido al archivo .env
   GEMINI_API_KEY=tu_api_key_real_aqui
   PORT=9374
   MAX_RESULTS=10
   TIMEOUT_MS=30000
   ```

3. **Compilar el backend:**
   ```bash
   npm run build:backend
   ```

4. **Verificar configuración:**
   ```bash
   node verify-env.js
   ```
   Debe mostrar: `✅ GEMINI_API_KEY encontrada`

5. **¡Listo para ejecutar!**
   ```bash
   npm run start
   ```

### 🚀 Ejecución

**Opción 1: Ejecutar todo (Backend + Frontend)**
```bash
npm run start
```

**Opción 2: Solo backend (modo desarrollo)**
```bash
npm run dev:backend
```

**Opción 3: Solo frontend**
```bash
npm run start:frontend
```

### 🌐 Acceso
- **Frontend:** Se abrirá automáticamente en tu navegador
- **Backend API:** `http://localhost:9374`
- **Health Check:** `http://localhost:9374/health`

---

## 📖 Uso

### 🔍 Realizar una búsqueda
1. Abre la aplicación en tu navegador
2. Escribe tu consulta en el chat (ej: "noticias sobre inteligencia artificial")
3. El agente buscará noticias relevantes y te presentará:
   - **Resumen ejecutivo** con análisis profundo
   - **Puntos clave** de las noticias
   - **Sugerencias** para explorar temas relacionados
   - **Sentimiento** general de las noticias

### 💡 Funcionalidades
- **Búsqueda contextual:** Haz clic en las sugerencias para refinar tu búsqueda
- **Análisis inteligente:** El agente usa IA para resumir y analizar noticias
- **Interfaz conversacional:** Interactúa de forma natural con el sistema

### 🛠️ Comandos útiles

**Verificar configuración:**
```bash
node verify-env.js
```

**Listar modelos de Gemini disponibles:**
```bash
node list-models.js
```

**Compilar solo el backend:**
```bash
npm run build:backend
```

---

## 🔧 Desarrollo

### 📁 Estructura del Proyecto
```
Te-Informo-AI-Agent/
├── backend/                 # Servidor Node.js + TypeScript
│   ├── src/
│   │   ├── controllers/   # Controladores de rutas
│   │   ├── services/      # Servicios (Gemini, MCTS, Scraping)
│   │   ├── models/        # Modelos de datos
│   │   └── routes/        # Definición de rutas
│   └── dist/              # Código compilado
├── frontend/              # Interfaz web
│   ├── index.html         # Página principal
│   ├── css/               # Estilos
│   └── js/                # JavaScript del cliente
└── .env                   # Variables de entorno
```

### 🛠️ Scripts disponibles
- `npm run start` - Ejecuta backend + frontend
- `npm run dev:backend` - Backend en modo desarrollo (hot reload)
- `npm run build:backend` - Compila TypeScript a JavaScript
- `npm run start:frontend` - Solo frontend
- `npm run dev:electron` - Ejecutar como aplicación de escritorio

### 🐛 Solución de problemas

**Puerto ocupado:**
```bash
# En Windows (PowerShell)
Get-NetTCPConnection -LocalPort 9374 -State Listen
Stop-Process -Id <PID> -Force

# O cambiar puerto en .env
PORT=9375
```

**Error de API Key:**
- Verifica que `GEMINI_API_KEY` esté en el archivo `.env`
- Asegúrate de que la key sea válida en [Google AI Studio](https://aistudio.google.com/)

**Error de compilación:**
```bash
npm run build:backend
```

---

## 👨‍💻 Conoce al Equipo

| Nombre                     | Rol                | GitHub                                |
| -------------------------- | ------------------ | ------------------------------------- |
| **Alfonte Tarqui Rendo** | Frontend & UX      | `@ForLess01` (https://github.com/ForLess01) |
| **Cuyo Zamata Yimmy Yeyson**| QA                 | `[@username]` (https://github.com/username) |
| **Turpo Quispe Patty Milagros**| Project Manager    | `[@username]` (https://github.com/username) |
| **Mamani Zapana Edward** | AI Lead            | `[@username]` (https://github.com/username) |
