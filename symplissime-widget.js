/**
 * Symplissime AI Chat Widget - Version Enhanced avec thèmes
 * Widget de chat intégrable avec système de thèmes configurables
 * Usage: <script src="symplissime-widget-enhanced.js"></script>
 *        <div class="symplissime-chat-widget" data-theme="symplissime"></div>
 */

(function() {
    'use strict';

    function decodeHTML(str) {
        const txt = document.createElement('textarea');
        txt.innerHTML = str;
        return txt.value;
    }
    
    // Thèmes chargés dynamiquement depuis un fichier JSON
    let THEMES = {};
    const scriptSrc = document.currentScript ? document.currentScript.src : null;
    const themesUrl = scriptSrc ? new URL('widget-themes.json', scriptSrc) : 'widget-themes.json';
    const themesLoaded = fetch(themesUrl)
        .then(response => {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        })
        .then(data => {
            THEMES = data;
        })
        .catch(err => {
            console.error('Erreur de chargement des thèmes:', err);
            THEMES = {};
        });
    
    // CSS de base avec variables CSS pour les thèmes
    const CSS_BASE = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        .symplissime-widget-container {
            --primary: #4f46e5;
            --primary-hover: #4338ca;
            --primary-light: #e0e7ff;
            --primary-dark: #3730a3;
            --success: #10b981;
            --bg: #ffffff;
            --bg-secondary: #f8fafc;
            --text: #1f2937;
            --text-secondary: #6b7280;
            --border: #e5e7eb;
            --shadow: 0 4px 20px rgba(79, 70, 229, 0.15);
            
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 2147483647;
            font-size: 14px;
            line-height: 1.4;
            color: var(--text);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        /* FAB Button */
        .symplissime-fab {
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, var(--primary), var(--primary-hover));
            border-radius: 50%;
            border: none;
            cursor: pointer;
            box-shadow: var(--shadow);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }
        
        .symplissime-fab::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, rgba(255,255,255,0.15), rgba(255,255,255,0));
            border-radius: inherit;
            pointer-events: none;
        }
        
        .symplissime-fab:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 30px rgba(0,0,0,0.2);
        }
        
        .symplissime-fab:active {
            transform: scale(0.95);
        }
        
        .symplissime-fab-icon {
            width: 28px;
            height: 28px;
            color: white;
            transition: transform 0.2s ease;
        }
        
        .symplissime-fab.closing .symplissime-fab-icon {
            transform: rotate(45deg);
        }
        
        .symplissime-fab.hidden {
            transform: scale(0);
            opacity: 0;
            pointer-events: none;
        }

        .symplissime-fab-badge {
            position: absolute;
            top: 0;
            right: 0;
            background: red;
            color: white;
            border-radius: 50%;
            padding: 2px 6px;
            font-size: 12px;
            display: none;
            transform: translate(50%, -50%);
        }

        /* Greeting bubble */
        .symplissime-greeting-bubble {
            position: absolute;
            bottom: 80px;
            right: 0;
            max-width: 250px;
            background: var(--bg);
            border: 1px solid var(--border);
            box-shadow: var(--shadow);
            padding: 12px;
            border-radius: 8px;
            color: var(--text);
            z-index: 1000;
        }
        .symplissime-greeting-bubble strong { font-weight: 600; }
        .symplissime-greeting-bubble em { font-style: italic; }

        /* Widget Window */
        .symplissime-widget {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 400px;
            max-height: calc(100vh - 120px);
            background: var(--bg);
            border-radius: 16px;
            box-shadow: var(--shadow);
            border: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            opacity: 0;
            transform: translateY(20px) scale(0.95);
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            pointer-events: none;
        }
        
        .symplissime-widget.open {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: all;
        }

        @media (max-height: 600px) {
            .symplissime-widget {
                height: calc(100vh - 120px);
            }
        }
        
        .symplissime-widget.minimized {
            height: 80px;
            transform: translateY(0) scale(1);
        }
        
        .symplissime-widget.minimized .symplissime-messages,
        .symplissime-widget.minimized .symplissime-input-container {
            display: none;
        }
        
        /* Header avec style Symplissime Classic */
        .symplissime-header {
            background: linear-gradient(135deg, var(--primary), var(--primary-hover));
            color: white;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            border-radius: 16px 16px 0 0;
        }
        
        .symplissime-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0));
            pointer-events: none;
        }
        
        .symplissime-header-content {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
        }
        
        .symplissime-avatar {
            width: 40px;
            height: 40px;
            background: rgba(255,255,255,0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 16px;
            position: relative;
        }
        
        .symplissime-avatar::after {
            content: '✨';
            position: absolute;
            top: -4px;
            right: -4px;
            font-size: 12px;
            background: var(--success);
            border-radius: 50%;
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .symplissime-header-info h3 {
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 2px 0;
        }
        
        .symplissime-header-info p {
            font-size: 13px;
            opacity: 0.9;
            margin: 0;
        }
        
        .symplissime-controls {
            display: flex;
            gap: 8px;
        }
        
        .symplissime-control-btn {
            width: 28px;
            height: 28px;
            background: rgba(255,255,255,0.15);
            border: none;
            border-radius: 6px;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            transition: background 0.2s ease;
        }
        
        .symplissime-control-btn:hover {
            background: rgba(255,255,255,0.25);
        }
        
        /* Messages */
        .symplissime-messages {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            background: var(--bg-secondary);
            scroll-behavior: smooth;
        }
        
        .symplissime-messages::-webkit-scrollbar {
            width: 6px;
        }
        
        .symplissime-messages::-webkit-scrollbar-track {
            background: transparent;
        }
        
        .symplissime-messages::-webkit-scrollbar-thumb {
            background: var(--border);
            border-radius: 3px;
        }
        
        .symplissime-messages::-webkit-scrollbar-thumb:hover {
            background: var(--text-secondary);
        }
        
        .symplissime-message {
            max-width: 80%;
            padding: 14px 18px;
            border-radius: 18px;
            font-size: 14px;
            line-height: 1.5;
            word-wrap: break-word;
            animation: messageSlide 0.3s ease-out;
            position: relative;
        }
        
        @keyframes messageSlide {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .symplissime-message.user {
            background: linear-gradient(135deg, var(--primary), var(--primary-hover));
            color: white;
            margin-left: auto;
            border-bottom-right-radius: 4px;
        }
        
        .symplissime-message.bot {
            background: var(--bg);
            color: var(--text);
            border: 1px solid var(--border);
            margin-right: auto;
            border-bottom-left-radius: 4px;
        }
        
        .symplissime-message.error {
            background: #fef2f2;
            color: #dc2626;
            border-color: #fecaca;
            margin-right: auto;
            border-bottom-left-radius: 4px;
        }
        
        /* Quick Messages - Style Symplissime */
        .symplissime-quick-messages {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin: 12px 0;
        }
        
        .symplissime-quick-message {
            background: var(--primary);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .symplissime-quick-message:hover {
            background: var(--primary-hover);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        /* Typing Indicator */
        .symplissime-typing {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 16px 20px;
            background: var(--bg);
            border: 1px solid var(--border);
            border-radius: 18px;
            border-bottom-left-radius: 4px;
            margin-right: auto;
            max-width: 80px;
        }
        
        .symplissime-typing-dots {
            display: flex;
            gap: 4px;
        }
        
        .symplissime-typing-dot {
            width: 6px;
            height: 6px;
            background: var(--primary);
            border-radius: 50%;
            animation: typingBounce 1.4s ease-in-out infinite;
        }
        
        .symplissime-typing-dot:nth-child(2) {
            animation-delay: 0.2s;
        }
        
        .symplissime-typing-dot:nth-child(3) {
            animation-delay: 0.4s;
        }
        
        @keyframes typingBounce {
            0%, 60%, 100% {
                transform: translateY(0);
                opacity: 0.4;
            }
            30% {
                transform: translateY(-8px);
                opacity: 1;
            }
        }
        
        /* Input avec style Symplissime */
        .symplissime-input-container {
            padding: 20px;
            background: var(--bg);
            border-top: 1px solid var(--border);
            border-radius: 0 0 16px 16px;
        }
        
        .symplissime-input-form {
            display: flex;
            gap: 12px;
            align-items: flex-end;
        }
        
        .symplissime-input {
            flex: 1;
            min-height: 44px;
            max-height: 120px;
            padding: 12px 16px;
            border: 2px solid var(--border);
            border-radius: 22px;
            font-size: 14px;
            font-family: inherit;
            outline: none;
            resize: none;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
            background: var(--bg);
            color: var(--text);
        }
        
        .symplissime-input:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px var(--primary-light);
        }
        
        .symplissime-input:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .symplissime-input::placeholder {
            color: var(--text-secondary);
        }
        
        .symplissime-send {
            width: 44px;
            height: 44px;
            background: linear-gradient(135deg, var(--primary), var(--primary-hover));
            border: none;
            border-radius: 50%;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            flex-shrink: 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .symplissime-send:hover:not(:disabled) {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .symplissime-send:active:not(:disabled) {
            transform: scale(0.95);
        }
        
        .symplissime-send:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .symplissime-send-icon {
            width: 20px;
            height: 20px;
            transition: transform 0.2s ease;
        }
        
        .symplissime-send.sending .symplissime-send-icon {
            animation: spin 1s linear infinite;
        }

        .symplissime-footer {
            padding: 8px 16px;
            font-size: 12px;
            color: var(--text-secondary);
            background: var(--bg-secondary);
            border-top: 1px solid var(--border);
            text-align: center;
        }
        .symplissime-footer a { color: var(--primary); }
        
        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
        
        /* Mobile Responsive */
        @media (max-width: 480px) {
            .symplissime-widget-container {
                bottom: 0;
                right: 0;
                left: 0;
                top: 0;
            }
            
            .symplissime-fab {
                bottom: 24px;
                right: 24px;
                position: fixed;
            }
            
            .symplissime-widget {
                bottom: 0;
                right: 0;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                border-radius: 0;
                position: fixed;
            }
            
            .symplissime-header {
                border-radius: 0;
            }
            
            .symplissime-input-container {
                border-radius: 0;
            }
            
            .symplissime-widget.minimized {
                height: 80px;
                top: auto;
                bottom: 0;
            }
        }
        
        /* Markdown Support */
        .symplissime-message strong {
            font-weight: 600;
        }
        
        .symplissime-message em {
            font-style: italic;
        }
        
        .symplissime-message code {
            background: rgba(0, 0, 0, 0.05);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 13px;
        }
        
        .symplissime-message.user code {
            background: rgba(255, 255, 255, 0.2);
        }
    `;
    
    // Icônes SVG
    const ICONS = {
        chat: `<svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>`,
        
        close: `<svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>`,
        
        minimize: `<svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h12v2H6z"/>
        </svg>`,
        
        send: `<svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>`
    };

    const I18N = {
        fr: { minimize: 'Réduire', close: 'Fermer', placeholder: 'Tapez votre message...' },
        en: { minimize: 'Minimize', close: 'Close', placeholder: 'Type your message...' }
    };
    
    class SymplissimeWidget {
        constructor(element) {
            this.element = element;
            this.config = this.getConfig(element);
            this.theme = this.config.theme || 'symplissime';
            
            this.isOpen = false;
            this.isMinimized = false;
            this.isProcessing = false;
            this.sessionId = this.generateSessionId();
            this.unreadCount = 0;
            this.history = [];

            this.init();
        }
        
        getConfig(element) {
            return {
                apiEndpoint: element.dataset.apiEndpoint || 'symplissime-widget-api.php',
                workspace: element.dataset.workspace || 'support-windows',
                title: element.dataset.title || 'Symplissime AI',
                subtitle: element.dataset.subtitle || 'Assistant technique en ligne',
                placeholder: element.dataset.placeholder || 'Tapez votre message...',
                theme: element.dataset.theme || 'symplissime',
                autoOpen: element.dataset.autoOpen === 'true',
                showBranding: element.dataset.showBranding !== 'false',
                enableSound: element.dataset.enableSound === 'true',
                quickMessages: element.dataset.quickMessages ? element.dataset.quickMessages.split('|').map(decodeHTML) : [],
                welcomeMessage: element.dataset.welcomeMessage ? decodeHTML(element.dataset.welcomeMessage).replace(/\\n/g, '\n') : '',
                greetingMode: element.dataset.greetingMode || 'bubble_immediate',
                greetingDelay: parseInt(element.dataset.greetingDelay) || 30,
                displayName: element.dataset.displayName || element.dataset.title || 'Symplissime AI',
                profilePicture: element.dataset.profilePicture || '',
                bubbleIcon: element.dataset.bubbleIcon !== 'false',
                bubblePosition: element.dataset.bubblePosition || 'right',
                sendHistoryEmail: element.dataset.sendHistoryEmail === 'true',
                ownerEmail: element.dataset.ownerEmail || '',
                footerEnabled: element.dataset.footerEnabled === 'true',
                footerText: element.dataset.footerText || '',
                language: element.dataset.language || 'fr',
                timeZone: element.dataset.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
            };
        }
        
        generateSessionId() {
            return 'widget_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        
        init() {
            this.injectStyles();
            this.applyTheme();
            this.createWidget();
            this.bindEvents();
            this.welcomeShown = false;

            if (this.config.greetingMode === 'bubble_immediate' || this.config.greetingMode === 'bubble_delay') {
                const delay = this.config.greetingMode === 'bubble_delay'
                    ? this.config.greetingDelay * 1000
                    : 0;
                setTimeout(() => this.showGreetingBubble(), delay);
            }

            if (this.config.autoOpen) {
                setTimeout(() => this.openWidget(), 1000);
            }
            
            console.log('🤖 Symplissime Widget initialized', this.config);
        }
        
        injectStyles() {
            if (!document.getElementById('symplissime-widget-styles')) {
                const style = document.createElement('style');
                style.id = 'symplissime-widget-styles';
                style.textContent = CSS_BASE;
                document.head.appendChild(style);
            }
        }
        
        loadTheme(name) {
            const themeConfig = THEMES[name] || THEMES.symplissime || {};
            const container = this.element;

            Object.entries(themeConfig).forEach(([key, value]) => {
                if (key !== 'name') {
                    const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                    container.style.setProperty(`--${cssVar}`, value);
                }
            });
        }

        applyTheme() {
            this.loadTheme(this.theme);
        }
        
        createWidget() {
            this.element.className = 'symplissime-widget-container';

            const texts = I18N[this.config.language] || I18N.fr;
            const placeholder = texts.placeholder;

            this.element.innerHTML = `
                <button class="symplissime-fab" type="button">
                    <div class="symplissime-fab-icon">${ICONS.chat}</div>
                    <div class="symplissime-fab-badge"></div>
                </button>

                <div class="symplissime-widget">
                    <div class="symplissime-header">
                        <div class="symplissime-header-content">
                            <div class="symplissime-avatar"></div>
                            <div class="symplissime-header-info">
                                <h3>${this.config.displayName}</h3>
                                <p>${this.config.subtitle}</p>
                            </div>
                        </div>
                        <div class="symplissime-controls">
                            <button class="symplissime-control-btn minimize-btn" type="button" title="${texts.minimize}">
                                ${ICONS.minimize}
                            </button>
                            <button class="symplissime-control-btn close-btn" type="button" title="${texts.close}">
                                ${ICONS.close}
                            </button>
                        </div>
                    </div>

                    <div class="symplissime-messages"></div>

                    <div class="symplissime-input-container">
                        <form class="symplissime-input-form">
                            <textarea class="symplissime-input"
                                     placeholder="${placeholder}"
                                     rows="1"
                                     maxlength="1000"></textarea>
                            <button class="symplissime-send" type="submit">
                                <div class="symplissime-send-icon">${ICONS.send}</div>
                            </button>
                        </form>
                    </div>
                    ${this.config.footerEnabled ? `<div class="symplissime-footer">${this.config.footerText}</div>` : ''}
                </div>
            `;

            // Références DOM
            this.fab = this.element.querySelector('.symplissime-fab');
            this.widget = this.element.querySelector('.symplissime-widget');
            this.messages = this.element.querySelector('.symplissime-messages');
            this.input = this.element.querySelector('.symplissime-input');
            this.sendBtn = this.element.querySelector('.symplissime-send');
            this.form = this.element.querySelector('.symplissime-input-form');
            this.badge = this.element.querySelector('.symplissime-fab-badge');
            this.avatar = this.element.querySelector('.symplissime-avatar');
            if (this.config.profilePicture) {
                this.avatar.innerHTML = `<img src="${this.config.profilePicture}" alt="" style="width:32px;height:32px;border-radius:50%;">`;
            } else {
                this.avatar.textContent = this.config.displayName.charAt(0).toUpperCase();
            }

            if (!this.config.bubbleIcon) {
                const iconEl = this.element.querySelector('.symplissime-fab-icon');
                if (iconEl) iconEl.style.display = 'none';
            }

            if (this.config.bubblePosition === 'left') {
                this.element.style.right = 'auto';
                this.element.style.left = '24px';
            }

            if (this.config.footerEnabled) {
                const footer = this.element.querySelector('.symplissime-footer');
                if (footer) {
                    footer.querySelectorAll('a').forEach(a => a.setAttribute('target', '_blank'));
                }
            }

            this.setupAutoResize();
            this.updateBadge();
        }
        
        setupAutoResize() {
            this.input.addEventListener('input', () => {
                this.input.style.height = 'auto';
                this.input.style.height = Math.min(this.input.scrollHeight, 120) + 'px';
            });
        }
        
        bindEvents() {
            this.fab.addEventListener('click', () => this.toggleWidget());
            
            this.element.querySelector('.minimize-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMinimize();
            });
            
            this.element.querySelector('.close-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeWidget();
            });
            
            this.element.querySelector('.symplissime-header').addEventListener('click', (e) => {
                if (e.target.closest('.symplissime-controls')) return;
                this.toggleMinimize();
            });
            
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sendMessage();
            });
            
            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        toggleWidget() {
            if (this.isOpen) {
                this.closeWidget();
            } else {
                this.openWidget();
            }
        }
        
        openWidget() {
            this.isOpen = true;
            this.unreadCount = 0;
            this.updateBadge();
            this.widget.classList.add('open');
            this.fab.classList.add('closing');
            this.fab.querySelector('.symplissime-fab-icon').innerHTML = ICONS.close;

            if (this.greetingBubble) {
                this.greetingBubble.remove();
                this.greetingBubble = null;
            }

            if (!this.welcomeShown) {
                this.showWelcomeMessage();
            }

            setTimeout(() => {
                this.input.focus();
            }, 300);
        }
        
        closeWidget() {
            this.isOpen = false;
            this.isMinimized = false;
            this.widget.classList.remove('open', 'minimized');
            this.fab.classList.remove('closing');
            this.fab.querySelector('.symplissime-fab-icon').innerHTML = ICONS.chat;
            if (this.config.sendHistoryEmail && this.config.ownerEmail) {
                this.sendHistoryEmail();
            }
        }
        
        toggleMinimize() {
            if (!this.isOpen) return;

            this.isMinimized = !this.isMinimized;
            this.widget.classList.toggle('minimized', this.isMinimized);

            if (!this.isMinimized) {
                setTimeout(() => this.input.focus(), 100);
            }

            this.unreadCount = 0;
            this.updateBadge();
        }

        updateBadge() {
            if (!this.badge) return;
            if (this.unreadCount > 0) {
                this.badge.textContent = this.unreadCount;
                this.badge.style.display = 'flex';
            } else {
                this.badge.textContent = '';
                this.badge.style.display = 'none';
            }
        }

        addMessage(content, isUser = false, isError = false) {
            const messageEl = document.createElement('div');
            messageEl.className = `symplissime-message ${isUser ? 'user' : 'bot'} ${isError ? 'error' : ''}`;
            
            if (!isUser && !isError) {
                content = content
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/`(.*?)`/g, '<code>$1</code>')
                    .replace(/\n/g, '<br>');
                messageEl.innerHTML = content;
            } else {
                messageEl.textContent = content;
            }

            this.messages.appendChild(messageEl);
            this.scrollToBottom();

            if (!isUser && !isError && (!this.isOpen || this.isMinimized)) {
                this.unreadCount++;
                this.updateBadge();
            }

            const now = new Date();
            this.history.push({
                from: isUser ? 'user' : 'assistant',
                message: isUser ? messageEl.textContent : messageEl.innerHTML.replace(/<br>/g, '\n'),
                timestamp: now.toISOString()
            });
        }

        sendHistoryEmail() {
            const payload = {
                email: this.config.ownerEmail,
                displayName: this.config.displayName,
                timeZone: this.config.timeZone,
                session: this.sessionId,
                url: window.location.href,
                messages: this.history
            };
            fetch(this.config.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(err => console.error('sendHistoryEmail', err));
        }
        
        addQuickMessages() {
            if (this.config.quickMessages.length === 0) return;
            if (this.messages.querySelector('.symplissime-quick-messages')) return;

            const quickContainer = document.createElement('div');
            quickContainer.className = 'symplissime-quick-messages';
            
            this.config.quickMessages.forEach(message => {
                const btn = document.createElement('button');
                btn.className = 'symplissime-quick-message';
                btn.textContent = message;

                const container = quickContainer;
                btn.addEventListener('click', () => {
                    this.input.value = message;
                    this.sendMessage();
                    container.remove();
                });

                quickContainer.appendChild(btn);
            });
            
            this.messages.appendChild(quickContainer);
            this.scrollToBottom();
        }
        
        showTyping() {
            this.hideTyping();
            
            const typingEl = document.createElement('div');
            typingEl.className = 'symplissime-typing';
            typingEl.id = 'typing-indicator';
            typingEl.innerHTML = `
                <div class="symplissime-typing-dots">
                    <div class="symplissime-typing-dot"></div>
                    <div class="symplissime-typing-dot"></div>
                    <div class="symplissime-typing-dot"></div>
                </div>
            `;
            
            this.messages.appendChild(typingEl);
            this.scrollToBottom();
        }
        
        hideTyping() {
            const typing = this.messages.querySelector('#typing-indicator');
            if (typing) typing.remove();
        }
        
        scrollToBottom() {
            requestAnimationFrame(() => {
                this.messages.scrollTop = this.messages.scrollHeight;
            });
        }
        
        async sendMessage() {
            const message = this.input.value.trim();
            if (!message || this.isProcessing) return;
            
            this.addMessage(message, true);
            this.input.value = '';
            this.input.style.height = 'auto';
            this.setProcessing(true);
            this.showTyping();
            
            try {
                const formData = new FormData();
                formData.append('action', 'chat');
                formData.append('message', message);
                formData.append('workspace', this.config.workspace);
                formData.append('sessionId', this.sessionId);
                
                const response = await fetch(this.config.apiEndpoint, {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                this.hideTyping();
                
                if (data.error) {
                    this.addMessage(`❌ ${data.error}`, false, true);
                } else if (data.success && data.message) {
                    this.addMessage(data.message, false);
                } else {
                    this.addMessage('❌ Aucune réponse reçue du serveur', false, true);
                }
                
            } catch (error) {
                this.hideTyping();
                this.addMessage(`❌ Erreur de connexion: ${error.message}`, false, true);
                console.error('Widget error:', error);
            }
            
            this.setProcessing(false);
        }
        
        setProcessing(processing) {
            this.isProcessing = processing;
            this.input.disabled = processing;
            this.sendBtn.disabled = processing;
            this.sendBtn.classList.toggle('sending', processing);
        }
        
        showWelcomeMessage() {
            setTimeout(() => {
                const msg = this.config.welcomeMessage && this.config.welcomeMessage.trim() !== ''
                    ? this.config.welcomeMessage
                    : `👋 **Bonjour !** Bienvenue chez ${this.config.title}.\n\nComment puis-je vous aider aujourd'hui ?`;
                this.addMessage(msg);
                this.welcomeShown = true;

                if (this.config.quickMessages.length > 0) {
                    setTimeout(() => {
                        this.addQuickMessages();
                    }, 500);
                }
            }, 1000);
        }

        showGreetingBubble() {
            if (this.greetingBubble) return;
            const bubble = document.createElement('div');
            bubble.className = 'symplissime-greeting-bubble';
            const msg = this.config.welcomeMessage && this.config.welcomeMessage.trim() !== ''
                ? this.config.welcomeMessage
                : `👋 **Bonjour !** Bienvenue chez ${this.config.title}.\n\nComment puis-je vous aider aujourd'hui ?`;
            bubble.innerHTML = msg
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\n/g, '<br>');
            this.element.appendChild(bubble);
            bubble.addEventListener('click', () => this.openWidget());
            this.greetingBubble = bubble;
        }
    }
    
    // Auto-initialization
    async function initializeWidgets() {
        await themesLoaded;
        const widgets = document.querySelectorAll('.symplissime-chat-widget:not([data-widget-initialized])');
        
        widgets.forEach(element => {
            element.setAttribute('data-widget-initialized', 'true');
            new SymplissimeWidget(element);
        });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWidgets);
    } else {
        setTimeout(initializeWidgets, 0);
    }
    
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(initializeWidgets);
        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });
    }
    
    window.SymplissimeWidget = SymplissimeWidget;
    
})();
