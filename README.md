📢 Te Informo: Tu Asistente de Noticias PersonalizadoUn agente conversacional inteligente diseñado para combatir la sobrecarga informativa y ayudarte a descubrir contenido verdaderamente relevante.📜 Resumen"Te Informo" es un agente conversacional que va más allá de una simple búsqueda. A través de un diálogo interactivo, el agente emplea la técnica de Búsqueda en Árbol Monte Carlo (MCTS) para explorar y comprender tus verdaderos intereses. Su función principal es proporcionar un boletín de noticias personalizado bajo demanda, que no solo sea altamente relevante, sino que también fomente el descubrimiento de temas nuevos y fascinantes.👥 Nuestro EquipoNombreRol👨‍💻 Alfonte Tarqui RendoFrontend & UX🧪 Cuyo Zamata Yimmy Y.QA👩‍💼 Turpo Quispe Patty M.Project Manager🧠 Mamani Zapana EdwardAI Lead🎯 El Problema: Carga Cognitiva en la BúsquedaLa búsqueda activa de información es una tarea mentalmente agotadora. El usuario se ve obligado a actuar como su propio "gestor de proyecto": formula consultas, evalúa la relevancia, gestiona múltiples pestañas, filtra contenido y sintetiza la información. Este proceso genera una alta carga cognitiva.Nuestro agente se posiciona como un asistente de investigación personal que absorbe esta carga. En lugar de que gestiones el caos informativo, "Te Informo" asume la responsabilidad de navegar, filtrar, resumir y, crucialmente, sugerir de manera inteligente los siguientes pasos en tu exploración de conocimiento.🛠️ Stack TecnológicoNuestra arquitectura Cliente-Servidor se compone de las siguientes tecnologías:🧠 Backend (El Cerebro)Runtime/Servidor: Node.js y Express.js con TypeScript.Web Scraping: Axios y Cheerio para la extracción de información de sitios de noticias.Inteligencia Artificial: Lógica MCTS implementada con Gemini para el procesamiento, resumen y sugerencia de contenido.🎨 Frontend (La Interfaz)Lógica y Estructura: TypeScript y Handlebars para una renderización dinámica de la conversación.Diseño: Tailwind CSS para una interfaz moderna y completamente responsiva.📦 Aplicación y DespliegueApp de Escritorio: Electron y Electron Builder para empaquetar la aplicación en un .exe para Windows.Control de Versiones y Despliegue Web: GitHub para el código fuente y Vercel para el despliegue continuo.✅ Solución Esperada y Pruebas de ÉxitoFuncionalidades Clave[ ] Una interfaz de chat completamente funcional e intuitiva.[ ] Capacidad del agente para realizar web scraping de noticias y presentarlas al usuario.[ ] Botones de sugerencia inteligentes y contextualmente relevantes a la conversación.[ ] Refinamiento visible de la búsqueda basado en las sugerencias seleccionadas por el usuario.Criterios de ÉxitoPrueba de Flujo Conversacional: En una conversación de 5 turnos, un usuario debe seguir al menos 2 sugerencias del agente.Prueba de Adaptación: Si el usuario busca "Tesla" y selecciona la sugerencia "Baterías", la siguiente búsqueda debe ser sobre "baterías de Tesla".Prueba de Exploración: El agente debe ser capaz de sugerir un subtema relevante no mencionado explícitamente en la consulta original.🚀 Cómo Empezar (Próximamente)# Clonar el repositorio
git clone [https://github.com/tu-usuario/te-informo.git](https://github.com/tu-usuario/te-informo.git)

# Instalar dependencias
cd te-informo
npm install

# Iniciar la aplicación
npm start
🤝 Contribuciones (Próximamente)Las contribuciones son bienvenidas. Por favor, abre un 'issue' para discutir lo que te gustaría cambiar o mejorar.
  @media print {
    .ms-editor-squiggler {
        display:none !important;
    }
  }
  .ms-editor-squiggler {
    all: initial;
    display: block !important;
    height: 0px !important;
    width: 0px !important;
  }
