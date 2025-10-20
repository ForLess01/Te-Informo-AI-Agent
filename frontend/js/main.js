/**
 * Te Informo - Frontend con Análisis de IA e Intereses
 */

// Configuración
const API_URL = 'http://localhost:9374/api';

// Estado
let conversationContext = [];
let isLoading = false;
let userInterests = [];

// Elementos del DOM
const sidebar = document.getElementById('sidebar');
const toggleSidebarBtn = document.getElementById('toggleSidebar');
const chatTab = document.getElementById('chatTab');
const newsCount = document.getElementById('newsCount');
const feedbackThanks = document.getElementById('feedbackThanks');
const suggestionsContainer = document.getElementById('suggestions');
const suggestionsButtons = document.getElementById('suggestionsButtons');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const resetBtn = document.getElementById('resetBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const welcomeScreen = document.getElementById('welcomeScreen');
const analysisSection = document.getElementById('analysisSection');
const articlesGrid = document.getElementById('articlesGrid');
const videosGrid = document.getElementById('videosGrid');
const articlesSection = document.getElementById('articlesSection');
const videosSection = document.getElementById('videosSection');
const feedbackSection = document.getElementById('feedbackSection');
const aiSummary = document.getElementById('aiSummary');
const keyPoints = document.getElementById('keyPoints');
const statusText = document.querySelector('.status-text');

// Elementos de intereses
const addInterestBtn = document.getElementById('addInterestBtn');
const addInterestForm = document.getElementById('addInterestForm');
const interestInput = document.getElementById('interestInput');
const saveInterestBtn = document.getElementById('saveInterestBtn');
const cancelInterestBtn = document.getElementById('cancelInterestBtn');
const interestsList = document.getElementById('interestsList');

// ==================== Inicialización ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Te Informo iniciado');
    
    // Event Listeners
    sendBtn.addEventListener('click', handleSendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
    resetBtn.addEventListener('click', handleReset);
    toggleSidebarBtn.addEventListener('click', closeSidebar);
    chatTab.addEventListener('click', openSidebar);
    
    // Event Listeners de Intereses
    addInterestBtn.addEventListener('click', showAddInterestForm);
    saveInterestBtn.addEventListener('click', saveInterest);
    cancelInterestBtn.addEventListener('click', hideAddInterestForm);
    interestInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveInterest();
        }
    });
    
    // Cargar intereses
    loadUserInterests();
    
    messageInput.focus();
});

// ==================== Gestión de Intereses ====================

async function loadUserInterests() {
    try {
        const response = await fetch(`${API_URL}/interests`);
        const data = await response.json();
        
        if (data.status === 'success') {
            userInterests = data.data.interests;
            renderInterests();
        }
    } catch (error) {
        console.error('Error cargando intereses:', error);
    }
}

function renderInterests() {
    if (userInterests.length === 0) {
        interestsList.innerHTML = '<p class="interests-empty">Agrega tus intereses para personalizar las noticias</p>';
        return;
    }
    
    interestsList.innerHTML = '';
    userInterests.forEach(interest => {
        const tag = document.createElement('div');
        tag.className = 'interest-tag';
        tag.innerHTML = `
            <span class="interest-tag-text">${escapeHtml(interest)}</span>
            <button class="interest-tag-remove" onclick="removeInterest('${escapeHtml(interest)}')" title="Eliminar">×</button>
        `;
        interestsList.appendChild(tag);
    });
}

function showAddInterestForm() {
    addInterestForm.classList.remove('hidden');
    interestInput.focus();
}

function hideAddInterestForm() {
    addInterestForm.classList.add('hidden');
    interestInput.value = '';
}

async function saveInterest() {
    const interest = interestInput.value.trim();
    
    if (!interest) return;
    
    try {
        const response = await fetch(`${API_URL}/interests/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ interest })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            userInterests = data.data.interests;
            renderInterests();
            hideAddInterestForm();
            addAgentMessage(`✅ Interés "${interest}" agregado. Ahora personalizaré las noticias para ti.`);
        }
    } catch (error) {
        console.error('Error agregando interés:', error);
    }
}

async function removeInterest(interest) {
    try {
        const response = await fetch(`${API_URL}/interests/remove`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ interest })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            userInterests = data.data.interests;
            renderInterests();
            addAgentMessage(`🗑️ Interés "${interest}" eliminado.`);
        }
    } catch (error) {
        console.error('Error eliminando interés:', error);
    }
}

// ==================== Sidebar ====================

function openSidebar() {
    sidebar.classList.remove('hidden-sidebar');
}

function closeSidebar() {
    sidebar.classList.add('hidden-sidebar');
}

// ==================== Mensajes ====================

async function handleSendMessage() {
    const query = messageInput.value.trim();
    
    if (!query || isLoading) return;
    
    messageInput.value = '';
    addUserMessage(query);
    welcomeScreen.classList.add('hidden');
    showLoading();
    
    try {
        const response = await fetch(`${API_URL}/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query,
                context: conversationContext
            })
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            const { results, analysis } = data.data;
            
            // Separar artículos y videos
            const articles = results.filter(r => r.type === 'article');
            const videos = results.filter(r => r.type === 'video');
            
            // Mensaje minimalista en el chat
            addAgentMessage(`🔍 Analizando noticias sobre "${query}"...`);
            
            // Mostrar análisis de IA con conteo
            displayAnalysis(analysis, articles.length, videos.length);
            
            // Mostrar artículos y videos por separado
            displayArticles(articles);
            displayVideos(videos);
            
            // Resetear feedback
            resetFeedback();
            
            // Actualizar contexto
            conversationContext.push(query);
        } else {
            throw new Error(data.message || 'Error desconocido');
        }
    } catch (error) {
        console.error('Error:', error);
        addAgentMessage(`❌ Error: ${error.message}`);
        showError(error.message);
    } finally {
        hideLoading();
    }
}

async function handleReset() {
    if (isLoading) return;
    
    try {
        await fetch(`${API_URL}/reset`, { method: 'POST' });
        
        conversationContext = [];
        
        chatMessages.innerHTML = `
            <div class="message agent-message">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <p>¿Qué noticias te interesan hoy?</p>
                </div>
            </div>
        `;
        
        welcomeScreen.classList.remove('hidden');
        analysisSection.classList.add('hidden');
        articlesSection.classList.add('hidden');
        videosSection.classList.add('hidden');
        
        console.log('🔄 Conversación reiniciada');
    } catch (error) {
        console.error('Error al reiniciar:', error);
    }
}

function addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
        <div class="message-avatar">👤</div>
        <div class="message-content">
            <p>${escapeHtml(text)}</p>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    scrollChatToBottom();
}

function addAgentMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message agent-message';
    messageDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <p>${escapeHtml(text)}</p>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    scrollChatToBottom();
}

// ==================== Visualización ====================

function displayAnalysis(analysis, articlesCount, videosCount) {
    if (!analysis) return;
    
    // Conteo minimalista (letra pequeña, separado del análisis)
    let countText = '';
    if (articlesCount > 0 && videosCount > 0) {
        countText = `Encontré ${articlesCount} periódicos y ${videosCount} videos`;
    } else if (articlesCount > 0) {
        countText = `Encontré ${articlesCount} periódicos`;
    } else if (videosCount > 0) {
        countText = `Encontré ${videosCount} videos`;
    }
    newsCount.textContent = countText;
    
    // Resumen organizado (análisis extenso, separado del conteo)
    const summaryParts = analysis.summary.split('\n\n');
    const summaryHTML = summaryParts.map(p => `<p>${escapeHtml(p)}</p>`).join('');
    
    aiSummary.innerHTML = summaryHTML;
    
    // Puntos clave
    keyPoints.innerHTML = '';
    if (analysis.keyPoints && analysis.keyPoints.length > 0) {
        const keyPointsTitle = document.createElement('h4');
        keyPointsTitle.style.marginTop = '20px';
        keyPointsTitle.style.marginBottom = '15px';
        keyPointsTitle.textContent = '📌 Puntos Clave:';
        keyPoints.appendChild(keyPointsTitle);
        
        analysis.keyPoints.forEach((point, index) => {
            const pointDiv = document.createElement('div');
            pointDiv.className = 'key-point';
            pointDiv.innerHTML = `
                <div class="key-point-icon">${index + 1}.</div>
                <div class="key-point-text">${escapeHtml(point)}</div>
            `;
            keyPoints.appendChild(pointDiv);
        });
    }
    
    // Sugerencias dinámicas (botones clickeables)
    suggestionsButtons.innerHTML = '';
    if (analysis.suggestions && analysis.suggestions.length > 0) {
        analysis.suggestions.forEach(suggestion => {
            const btn = document.createElement('button');
            btn.className = 'suggestion-btn';
            btn.textContent = suggestion;
            btn.onclick = () => {
                messageInput.value = suggestion;
                openSidebar();
                setTimeout(() => {
                    handleSendMessage();
                }, 300);
            };
            suggestionsButtons.appendChild(btn);
        });
        suggestionsContainer.classList.remove('hidden');
    } else {
        suggestionsContainer.classList.add('hidden');
    }
    
    analysisSection.classList.remove('hidden');
}

function displayArticles(articles) {
    articlesGrid.innerHTML = '';
    
    if (!articles || articles.length === 0) {
        articlesSection.classList.add('hidden');
        return;
    }
    
    articles.forEach(article => {
        const card = createNewsCard(article);
        articlesGrid.appendChild(card);
    });
    
    articlesSection.classList.remove('hidden');
}

function displayVideos(videos) {
    videosGrid.innerHTML = '';
    
    if (!videos || videos.length === 0) {
        videosSection.classList.add('hidden');
        return;
    }
    
    videos.forEach(video => {
        const card = createNewsCard(video);
        videosGrid.appendChild(card);
    });
    
    videosSection.classList.remove('hidden');
}

function createNewsCard(article) {
    const card = document.createElement('div');
    card.className = 'news-card';
    card.onclick = () => window.open(article.url, '_blank');
    
    const typeClass = article.type === 'video' ? 'news-type-video' : 'news-type-article';
    const typeLabel = article.type === 'video' ? '🎥 Video' : '📰 Artículo';
    
    // Imagen de portada (solo una)
    let imageHtml = '';
    if (article.imageUrl) {
        imageHtml = `<img src="${article.imageUrl}" alt="${escapeHtml(article.title)}" class="news-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22200%22%3E%3Crect fill=%22%23667eea%22 width=%22400%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22white%22 font-size=%2250%22%3E📰%3C/text%3E%3C/svg%3E'">`;
    } else {
        imageHtml = `<div class="news-image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 3rem;">📰</div>`;
    }
    
    card.innerHTML = `
        ${imageHtml}
        <div class="news-content">
            <span class="news-type-badge ${typeClass}">${typeLabel}</span>
            <h3 class="news-title">${escapeHtml(article.title)}</h3>
            <p class="news-snippet">${escapeHtml(article.snippet)}</p>
            <div class="news-footer">
                <span class="news-source">📍 ${escapeHtml(article.source || 'Fuente desconocida')}</span>
                <a href="${article.url}" class="news-link" target="_blank" onclick="event.stopPropagation()">Leer más →</a>
            </div>
        </div>
    `;
    
    return card;
}

function showError(message) {
    analysisSection.classList.add('hidden');
    articlesSection.classList.add('hidden');
    videosSection.classList.add('hidden');
    
    articlesGrid.innerHTML = `
        <div style="text-align: center; padding: 60px;">
            <div style="font-size: 4rem; margin-bottom: 20px;">⚠️</div>
            <h3 style="margin-bottom: 10px;">Error al cargar noticias</h3>
            <p style="color: rgba(255, 255, 255, 0.7);">${escapeHtml(message)}</p>
        </div>
    `;
    articlesSection.classList.remove('hidden');
}

// ==================== Utilidades ====================

function showLoading() {
    isLoading = true;
    loadingIndicator.classList.remove('hidden');
    analysisSection.classList.add('hidden');
    articlesSection.classList.add('hidden');
    videosSection.classList.add('hidden');
    sendBtn.disabled = true;
    messageInput.disabled = true;
    statusText.textContent = 'Analizando...';
}

function hideLoading() {
    isLoading = false;
    loadingIndicator.classList.add('hidden');
    sendBtn.disabled = false;
    messageInput.disabled = false;
    messageInput.focus();
    statusText.textContent = 'Listo';
}

function scrollChatToBottom() {
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Exponer funciones globalmente
window.quickSearch = function(topic) {
    messageInput.value = topic;
    sendBtn.click();
};

window.removeInterest = removeInterest;

// ==================== Sistema de Calificación ====================

let currentFeedback = null;
let feedbackHistory = [];

function resetFeedback() {
    currentFeedback = null;
    document.querySelectorAll('.feedback-icon-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (feedbackThanks) {
        feedbackThanks.classList.add('hidden');
    }
}

async function rateFeedback(rating) {
    if (currentFeedback === rating) return;
    
    currentFeedback = rating;
    
    // Actualizar UI
    document.querySelectorAll('.feedback-icon-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Activar botón clickeado
    event.target.classList.add('active');
    
    // Mostrar mensaje de agradecimiento
    if (feedbackThanks) {
        feedbackThanks.classList.remove('hidden');
    }
    
    // Guardar feedback
    feedbackHistory.push({
        rating,
        timestamp: new Date().toISOString(),
        query: conversationContext[conversationContext.length - 1]
    });
    
    console.log('📊 Feedback guardado:', rating);
    console.log('📋 Historial:', feedbackHistory);
    
    // Mensaje del agente según el feedback
    setTimeout(() => {
        if (rating === 'like') {
            addAgentMessage('😊 ¡Me alegra que te haya gustado! Seguiré mejorando para ti.');
        } else if (rating === 'dislike') {
            addAgentMessage('😔 Entiendo. Trabajaré en mejorar mis respuestas. ¿Qué te gustaría que cambie?');
        } else if (rating === 'irrelevant') {
            addAgentMessage('🔍 Gracias por el feedback. Ajustaré mis búsquedas para ser más relevante.');
        }
    }, 500);
    
    // TODO: Enviar feedback al backend para entrenamiento
    // await fetch(`${API_URL}/feedback`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ rating, query: conversationContext[conversationContext.length - 1] })
    // });
}

window.rateFeedback = rateFeedback;
