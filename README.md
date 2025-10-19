<p align="center">
  <img src="https://svgl.app/library/arc.svg" alt="Te Informo Banner" width="220"/>
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

## 👨‍💻 Conoce al Equipo

| Nombre                     | Rol                | GitHub                                |
| -------------------------- | ------------------ | ------------------------------------- |
| **Alfonte Tarqui Rendo** | Frontend & UX      | `[@ForLess01]`(https://github.com/ForLess01) |
| **Cuyo Zamata Yimmy Yeyson**| QA                 | `[@username]`(https://github.com/username) |
| **Turpo Quispe Patty Milagros**| Project Manager    | `[@username]`(https://github.com/username) |
| **Mamani Zapana Edward** | AI Lead            | `[@username]`(https://github.com/username) |
