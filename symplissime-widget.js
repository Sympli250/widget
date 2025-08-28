/**
 * Symplissime AI Chat Widget - Version Enhanced avec thèmes
 * Widget de chat intégrable avec système de thèmes configurables
 * Usage: <script src="symplissime-widget-enhanced.js"></script>
 *        <div class="symplissime-chat-widget" data-theme="symplissime"></div>
 */

(function(global) {
    'use strict';

    const SymplissimeWidgetNS = {};
    const widgetInstances = new WeakMap();
    const SESSION_STORAGE_KEY = 'symplissime_widget_session_id';

    function decodeHTML(str) {
        const txt = document.createElement('textarea');
        txt.innerHTML = str;
        return txt.value;
    }

    function shadeColor(color, percent) {
        let f = parseInt(color.slice(1), 16),
            t = percent < 0 ? 0 : 255,
            p = Math.abs(percent) / 100,
            R = f >> 16,
            G = f >> 8 & 0x00FF,
            B = f & 0x0000FF;
        return '#' + (
            0x1000000 +
            (Math.round((t - R) * p) + R) * 0x10000 +
            (Math.round((t - G) * p) + G) * 0x100 +
            (Math.round((t - B) * p) + B)
        ).toString(16).slice(1);
    }

    function isValidUrl(url) {
        try {
            new URL(url, window.location.origin);
            return /^https?:\/\//.test(url) || /^[\w\/\-]+$/.test(url);
        } catch {
            return false;
        }
    }

    function isValidEmail(email) {
        if (typeof email !== 'string') return false;
        email = email.trim();
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(email);
    }

    function isValidHex(color) {
        if (typeof color !== 'string') return false;
        return /^#[0-9A-Fa-f]{6}$/.test(color.trim());
    }

    function sanitizeHTML(str) {
        return str
            .replace(/<script[^>]*>.*?<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '');
    }

    // Utility to test for feature support
    function supports(feature) {
        return typeof global[feature] !== 'undefined';
    }

    // Basic fetch polyfill using XMLHttpRequest as fallback
    function fetchWithFallback(url, options = {}) {
        if (supports('fetch')) {
            return fetch(url, options);
        }

        return new Promise((resolve, reject) => {
            try {
                const xhr = new XMLHttpRequest();
                const method = options.method || 'GET';
                xhr.open(method, url, true);

                if (options.headers) {
                    Object.keys(options.headers).forEach(key => {
                        xhr.setRequestHeader(key, options.headers[key]);
                    });
                }

                xhr.timeout = options.timeout || 15000;
                if (options.signal) {
                    options.signal.addEventListener('abort', () => xhr.abort());
                }

                xhr.onload = function() {
                    const response = {
                        ok: xhr.status >= 200 && xhr.status < 300,
                        status: xhr.status,
                        statusText: xhr.statusText,
                        text: () => Promise.resolve(xhr.responseText),
                        json: () => Promise.resolve(JSON.parse(xhr.responseText))
                    };
                    resolve(response);
                };

                xhr.onerror = function() {
                    reject(new TypeError('Network request failed'));
                };

                xhr.ontimeout = function() {
                    reject(new TypeError('Network request failed'));
                };

                if (options.body) {
                    xhr.send(options.body);
                } else {
                    xhr.send();
                }
            } catch (err) {
                reject(err);
            }
        });
    }
    
    // Thèmes chargés dynamiquement depuis un fichier JSON
    const SymplissimeThemes = {
        cache: {},
        fallback: {
            name: 'Symplissime Classic',
            primary: '#48bb78',
            primaryHover: '#38a169',
            primaryLight: '#c6f6d5',
            primaryDark: '#2f855a',
            success: '#48bb78',
            background: '#ffffff',
            backgroundSecondary: '#f7fafc',
            text: '#1a202c',
            textSecondary: '#718096',
            border: '#e2e8f0',
            shadow: '0 4px 20px rgba(72, 187, 120, 0.15)'
        },
        async load() {
            if (Object.keys(this.cache).length) return this.cache;
            const scriptSrc = document.currentScript ? document.currentScript.src : null;
            const themesUrl = scriptSrc ? new URL('widget-themes.json', scriptSrc) : 'widget-themes.json';
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000);
            try {
                const response = await fetchWithFallback(themesUrl, { signal: controller.signal });
                if (!response.ok) throw new Error('HTTP ' + response.status);
                const data = await response.json();
                if (data && typeof data === 'object') {
                    this.cache = data;
                    return this.cache;
                }
                throw new Error('Données de thèmes invalides');
            } catch (err) {
                console.error('Erreur de chargement des thèmes:', err);
                this.cache = { symplissime: this.fallback };
            } finally {
                clearTimeout(timeout);
            }
            return this.cache;
        }
    };

    class ThemeCache {
        static themes = null;
        static async getThemes() {
            if (!ThemeCache.themes) {
                ThemeCache.themes = await SymplissimeThemes.load();
            }
            return ThemeCache.themes;
        }
    }

    const themesLoaded = ThemeCache.getThemes();
    
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

        .symplissime-sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
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
        .symplissime-widget-container[data-bubble-position="left"] .symplissime-greeting-bubble {
            right: auto;
            left: 0;
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
        .symplissime-widget-container[data-bubble-position="left"] .symplissime-widget {
            right: auto;
            left: 0;
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
        fr: {
            minimize: 'Réduire',
            close: 'Fermer',
            placeholder: 'Tapez votre message...',
            open: 'Ouvrir la conversation',
            openDescription: 'Ouvre la fenêtre de discussion'
        },
        en: {
            minimize: 'Minimize',
            close: 'Close',
            placeholder: 'Type your message...',
            open: 'Open chat',
            openDescription: 'Opens the chat window'
        }
    };

    function getConfig(element) {
        const apiEndpoint = isValidUrl(element.dataset.apiEndpoint) ? element.dataset.apiEndpoint : 'symplissime-widget-api.php';
        const workspace = /^[\w-]{1,50}$/.test(element.dataset.workspace || '') ? element.dataset.workspace : 'support-windows';
        const title = (element.dataset.title || 'Symplissime AI').trim();
        const subtitle = (element.dataset.subtitle || 'Assistant technique en ligne').trim();
        const placeholder = (element.dataset.placeholder || 'Tapez votre message...').trim();
        const theme = /^[\w-]{1,30}$/.test(element.dataset.theme || '') ? element.dataset.theme : 'symplissime';
        const accentColor = isValidHex(element.dataset.accentColor) ? element.dataset.accentColor : '';
        const fontChoices = ['default', 'sans-serif', 'serif', 'monospace'];
        const font = fontChoices.includes(element.dataset.font) ? element.dataset.font : 'default';
        const quickMessages = element.dataset.quickMessages ? element.dataset.quickMessages.split('|').map(decodeHTML) : [];
        const welcomeMessage = element.dataset.welcomeMessage ? decodeHTML(element.dataset.welcomeMessage).replace(/\\n/g, '\n') : '';
        const greetingModes = ['bubble_immediate', 'bubble_delayed', 'window'];
        const greetingMode = greetingModes.includes(element.dataset.greetingMode) ? element.dataset.greetingMode : 'bubble_immediate';
        const parsedDelay = parseInt(element.dataset.greetingDelay, 10);
        const greetingDelay = Number.isFinite(parsedDelay) && parsedDelay >= 0 ? parsedDelay : 30;
        const displayName = (element.dataset.displayName || title || 'Symplissime AI').trim();
        const profilePicture = isValidUrl(element.dataset.profilePicture) ? element.dataset.profilePicture : '';
        const bubblePosition = ['left', 'right'].includes(element.dataset.bubblePosition) ? element.dataset.bubblePosition : 'right';
        const ownerEmail = isValidEmail(element.dataset.ownerEmail) ? element.dataset.ownerEmail : '';
        const footerText = (element.dataset.footerText || '').trim();
        const language = /^[a-z]{2}$/i.test(element.dataset.language || '') ? element.dataset.language : 'fr';
        const timeZone = (element.dataset.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone).trim();

        return {
            apiEndpoint,
            workspace,
            title,
            subtitle,
            placeholder,
            theme,
            accentColor,
            font,
            autoOpen: element.dataset.autoOpen === 'true',
            showBranding: element.dataset.showBranding !== 'false',
            enableSound: element.dataset.enableSound === 'true',
            quickMessages,
            welcomeMessage,
            greetingMode,
            greetingDelay,
            displayName,
            profilePicture,
            bubbleIcon: element.dataset.bubbleIcon !== 'false',
            bubblePosition,
            sendHistoryEmail: element.dataset.sendHistoryEmail === 'true',
            ownerEmail,
            footerEnabled: element.dataset.footerEnabled === 'true',
            footerText,
            language,
            timeZone
        };
    }

    class WidgetAPI {
        constructor(endpoint) {
            this.endpoint = endpoint;
        }

        async chat(message, sessionId, workspace) {
            const formData = new FormData();
            formData.append('action', 'chat');
            formData.append('message', message);
            if (sessionId) formData.append('sessionId', sessionId);
            if (workspace) formData.append('workspace', workspace);
            const response = await fetchWithFallback(this.endpoint, { method: 'POST', body: formData });
            return response.json();
        }
    }

    class StateMachine {
        constructor(initialState, transitions) {
            this.state = initialState;
            this.transitions = transitions;
            this.transitioning = false;
        }

        can(target) {
            return this.transitions[this.state]?.includes(target);
        }

        transition(target, fn) {
            if (this.transitioning || !this.can(target)) return false;
            this.transitioning = true;
            fn();
            this.state = target;
            setTimeout(() => { this.transitioning = false; }, 300);
            return true;
        }

        force(target) {
            this.state = target;
            this.transitioning = false;
        }
    }

    class WidgetState {
        constructor(config) {
            this.isOpen = false;
            this.isMinimized = false;
            this.isProcessing = false;
            this.stateMachine = new StateMachine('closed', {
                closed: ['open'],
                open: ['closed', 'minimized'],
                minimized: ['open', 'closed']
            });
            try {
                this.sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
                if (!this.sessionId) {
                    this.sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2);
                    localStorage.setItem(SESSION_STORAGE_KEY, this.sessionId);
                }
            } catch (e) {
                this.sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2);
            }
            this.unreadCount = 0;
            this.history = [];
        }

        transition(target, fn) {
            const ok = this.stateMachine.transition(target, fn);
            if (ok) {
                this.isOpen = target !== 'closed';
                this.isMinimized = target === 'minimized';
            }
            return ok;
        }

        force(target) {
            this.stateMachine.force(target);
            this.isOpen = target !== 'closed';
            this.isMinimized = target === 'minimized';
        }

        get state() {
            return this.stateMachine.state;
        }
    }

    class WidgetRenderer {
        constructor(element, config, state, api) {
            this.element = element;
            this.config = config;
            this.state = state;
            this.api = api;
            this.theme = this.config.theme || 'symplissime';

            this.stateTimeout = null;
            this.listeners = [];

            this.init();
        }

        addListener(el, type, handler) {
            el.addEventListener(type, handler);
            this.listeners.push({ el, type, handler });
        }

        async init() {
            await themesLoaded;
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
            const themeConfig = SymplissimeThemes.cache[name] || SymplissimeThemes.cache.symplissime || {};
            const container = this.element;

            Object.entries(themeConfig).forEach(([key, value]) => {
                if (key !== 'name') {
                    const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                    container.style.setProperty(`--${cssVar}`, value);
                }
            });

            if (this.config.accentColor) {
                const accent = this.config.accentColor;
                container.style.setProperty('--primary', accent);
                container.style.setProperty('--primary-hover', shadeColor(accent, -10));
                container.style.setProperty('--primary-light', shadeColor(accent, 40));
                container.style.setProperty('--primary-dark', shadeColor(accent, -20));
            }

            if (this.config.font && this.config.font !== 'default') {
                const fonts = {
                    'sans-serif': "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
                    'serif': "Georgia, 'Times New Roman', serif",
                    'monospace': "'Courier New', monospace"
                };
                container.style.fontFamily = fonts[this.config.font] || '';
            } else {
                container.style.fontFamily = '';
            }
        }

        applyTheme() {
            this.loadTheme(this.theme);
        }
        
        createWidget() {
            this.element.classList.add('symplissime-widget-container');

            const texts = I18N[this.config.language] || I18N.fr;
            const placeholder = texts.placeholder;

            this.element.innerHTML = `
                <button class="symplissime-fab" type="button" aria-label="${texts.open}" aria-describedby="symplissime-fab-desc" aria-haspopup="dialog" aria-expanded="false">
                    <div class="symplissime-fab-icon">${ICONS.chat}</div>
                    <div class="symplissime-fab-badge"></div>
                </button>
                <div id="symplissime-fab-desc" class="symplissime-sr-only">${texts.openDescription}</div>

                <div class="symplissime-widget" role="dialog" aria-describedby="symplissime-widget-desc">
                    <div class="symplissime-header">
                        <div class="symplissime-header-content">
                            <div class="symplissime-avatar"></div>
                            <div class="symplissime-header-info">
                                <h3>${this.config.displayName}</h3>
                                <p id="symplissime-widget-desc">${this.config.subtitle}</p>
                            </div>
                        </div>
                        <div class="symplissime-controls">
                            <button class="symplissime-control-btn minimize-btn" type="button" title="${texts.minimize}" aria-label="${texts.minimize}">
                                ${ICONS.minimize}
                            </button>
                            <button class="symplissime-control-btn close-btn" type="button" title="${texts.close}" aria-label="${texts.close}">
                                ${ICONS.close}
                            </button>
                        </div>
                    </div>

                    <div class="symplissime-messages" aria-live="polite"></div>

                    <div class="symplissime-input-container">
                        <form class="symplissime-input-form">
                            <div id="symplissime-input-desc" class="symplissime-sr-only">${placeholder}</div>
                            <textarea class="symplissime-input"
                                     placeholder="${placeholder}"
                                     aria-describedby="symplissime-input-desc"
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
            this.input.setAttribute('aria-describedby', 'symplissime-input-desc');
            this.messages.setAttribute('aria-live', 'polite');
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

            if (this.config.bubblePosition === 'left') {
                this.widget.style.right = 'auto';
                this.widget.style.left = '0';
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
            const handler = () => {
                this.input.style.height = 'auto';
                this.input.style.height = Math.min(this.input.scrollHeight, 120) + 'px';
            };
            this.addListener(this.input, 'input', handler);
        }

        bindEvents() {
            const addKeyboard = (btn, handler) => {
                btn.setAttribute('tabindex', '0');
                const keyHandler = (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handler(e);
                    }
                };
                this.addListener(btn, 'keydown', keyHandler);
            };

            const fabClick = () => this.toggleWidget();
            this.addListener(this.fab, 'click', fabClick);
            addKeyboard(this.fab, fabClick);

            const minimizeBtn = this.element.querySelector('.minimize-btn');
            const minimizeClick = (e) => {
                e.stopPropagation();
                this.toggleMinimize();
            };
            this.addListener(minimizeBtn, 'click', minimizeClick);
            addKeyboard(minimizeBtn, minimizeClick);

            const closeBtn = this.element.querySelector('.close-btn');
            const closeClick = (e) => {
                e.stopPropagation();
                this.closeWidget();
            };
            this.addListener(closeBtn, 'click', closeClick);
            addKeyboard(closeBtn, closeClick);

            const escHandler = (e) => {
                if (e.key === 'Escape' && this.state.isOpen) {
                    this.closeWidget();
                }
            };
            this.addListener(document, 'keydown', escHandler);

            const header = this.element.querySelector('.symplissime-header');
            header.setAttribute('tabindex', '0');
            const headerClick = (e) => {
                if (e.target.closest('.symplissime-controls')) return;
                this.toggleMinimize();
            };
            const headerKey = (e) => {
                if (e.target.closest('.symplissime-controls')) return;
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleMinimize();
                }
            };
            this.addListener(header, 'click', headerClick);
            this.addListener(header, 'keydown', headerKey);

            const submitHandler = (e) => {
                e.preventDefault();
                this.sendMessage();
            };
            this.addListener(this.form, 'submit', submitHandler);

            const sendBtn = this.element.querySelector('.symplissime-send');
            addKeyboard(sendBtn, () => this.form.dispatchEvent(new Event('submit', { cancelable: true })));

            const inputKeydown = (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            };
            this.addListener(this.input, 'keydown', inputKeydown);
        }
        
        toggleWidget() {
            if (this.state.isOpen) {
                this.closeWidget();
            } else {
                this.openWidget();
            }
        }

        changeState(newState) {
            clearTimeout(this.stateTimeout);
            this.stateTimeout = setTimeout(() => this.forceState('closed'), 3000);

            const transitioned = this.state.transition(newState, () => {
                switch (newState) {
                    case 'open':
                        this.fab.setAttribute('aria-expanded', 'true');
                        this.state.unreadCount = 0;
                        this.updateBadge();
                        this.widget.classList.add('open');
                        this.widget.classList.remove('minimized');
                        this.fab.classList.add('closing');
                        this.fab.querySelector('.symplissime-fab-icon').innerHTML = ICONS.close;
                        if (this.greetingBubble) {
                            this.greetingBubble.remove();
                            this.greetingBubble = null;
                        }
                        if (!this.welcomeShown) {
                            this.showWelcomeMessage();
                        }
                        setTimeout(() => this.input.focus(), 300);
                        break;
                    case 'closed':
                        this.widget.classList.remove('open', 'minimized');
                        this.fab.classList.remove('closing');
                        this.fab.setAttribute('aria-expanded', 'false');
                        this.fab.querySelector('.symplissime-fab-icon').innerHTML = ICONS.chat;
                        if (this.config.sendHistoryEmail && this.config.ownerEmail) {
                            this.sendHistoryEmail();
                        }
                        break;
                    case 'minimized':
                        this.widget.classList.add('open');
                        this.widget.classList.add('minimized');
                        setTimeout(() => this.input.focus(), 100);
                        this.state.unreadCount = 0;
                        this.updateBadge();
                        break;
                }
            });

            if (!transitioned) return;
        }

        forceState(newState) {
            this.state.force(newState);
            if (newState === 'closed') {
                this.widget.classList.remove('open', 'minimized');
                this.fab.classList.remove('closing');
                this.fab.setAttribute('aria-expanded', 'false');
                this.fab.querySelector('.symplissime-fab-icon').innerHTML = ICONS.chat;
            }
        }

        openWidget() {
            this.changeState('open');
        }

        closeWidget() {
            this.changeState('closed');
        }

        toggleMinimize() {
            if (!this.state.isOpen) return;
            this.changeState(this.state.isMinimized ? 'open' : 'minimized');
        }

        updateBadge() {
            if (!this.badge) return;
            if (this.state.unreadCount > 0) {
                this.badge.textContent = this.state.unreadCount;
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
                content = sanitizeHTML(
                    content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/`(.*?)`/g, '<code>$1</code>')
                        .replace(/\n/g, '<br>')
                );
                messageEl.innerHTML = content;
            } else {
                messageEl.textContent = content;
            }

            this.messages.appendChild(messageEl);
            this.scrollToBottom();

            if (!isUser && !isError && (!this.state.isOpen || this.state.isMinimized)) {
                this.state.unreadCount++;
                this.updateBadge();
            }

            const now = new Date();
            this.state.history.push({
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
                session: this.state.sessionId,
                url: window.location.href,
                messages: this.state.history
            };
            fetchWithFallback(this.config.apiEndpoint, {
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
                btn.type = 'button';
                btn.setAttribute('tabindex', '0');
                btn.textContent = message;

                const container = quickContainer;
                const send = () => {
                    this.input.value = message;
                    this.sendMessage();
                    container.remove();
                };

                this.addListener(btn, 'click', send);
                const keyHandler = (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        send();
                    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                        e.preventDefault();
                        (btn.nextElementSibling || quickContainer.firstElementChild).focus();
                    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        (btn.previousElementSibling || quickContainer.lastElementChild).focus();
                    }
                };
                this.addListener(btn, 'keydown', keyHandler);

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
            if (!message || this.state.isProcessing) return;
            
            this.addMessage(message, true);
            this.input.value = '';
            this.input.style.height = 'auto';
            this.setProcessing(true);
            this.showTyping();
            
            try {
                const data = await this.api.chat(message, this.state.sessionId, this.config.workspace);
                if (data.sessionId) {
                    this.state.sessionId = data.sessionId;
                    try {
                        localStorage.setItem(SESSION_STORAGE_KEY, this.state.sessionId);
                    } catch (e) { /* ignore */ }
                }
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
            this.state.isProcessing = processing;
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
            const texts = I18N[this.config.language] || I18N.fr;
            const bubble = document.createElement('div');
            bubble.className = 'symplissime-greeting-bubble';
            const msg = this.config.welcomeMessage && this.config.welcomeMessage.trim() !== ''
                ? this.config.welcomeMessage
                : `👋 **Bonjour !** Bienvenue chez ${this.config.title}.\n\nComment puis-je vous aider aujourd'hui ?`;
            const plainText = msg
                .replace(/\*\*(.*?)\*\*/g, '$1')
                .replace(/\*(.*?)\*/g, '$1')
                .replace(/\n/g, ' ');
            bubble.innerHTML = sanitizeHTML(
                msg
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\n/g, '<br>')
            );
            bubble.setAttribute('role', 'button');
            bubble.setAttribute('tabindex', '0');
            bubble.setAttribute('aria-label', `${plainText} ${texts.open}`);
            this.element.appendChild(bubble);
            const handler = () => this.openWidget();
            this.addListener(bubble, 'click', handler);
            this.addListener(bubble, 'keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handler();
                }
            });
            this.greetingBubble = bubble;
        }

        destroy() {
            this.listeners.forEach(({ el, type, handler }) => {
                el.removeEventListener(type, handler);
            });
            this.greetingBubble?.remove();
        }
    }

    class SymplissimeWidget {
        constructor(element) {
            const config = getConfig(element);
            const api = new WidgetAPI(config.apiEndpoint);
            const state = new WidgetState(config);
            this.renderer = new WidgetRenderer(element, config, state, api);
        }

        destroy() {
            this.renderer.destroy();
            widgetInstances.delete(this.renderer.element);
        }
    }

    // Auto-initialization
    async function initializeWidgets() {
        try {
            await themesLoaded;
        } catch {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await ThemeCache.getThemes();
        }
        const widgets = document.querySelectorAll('.symplissime-chat-widget');

        widgets.forEach(element => {
            if (widgetInstances.has(element)) return;
            const instance = new SymplissimeWidget(element);
            widgetInstances.set(element, instance);
            observeContainer(getObservationRoot(element));
        });
    }

    let observer;
    let observedContainers = new WeakSet();
    let resetController;
    const DEBOUNCE_DELAY = 500;

    function getObservationRoot(element) {
        return element.closest('section, article, main') || element.parentElement;
    }

    function observeContainer(container) {
        if (!observer || !container || observedContainers.has(container)) return;
        observer.observe(container, { childList: true, subtree: false });
        observedContainers.add(container);
    }

    function scheduleInitialize() {
        if (resetController) resetController.abort();
        resetController = new AbortController();
        const { signal } = resetController;
        let start;
        const frame = time => {
            if (!start) start = time;
            if (signal.aborted) return;
            if (time - start >= DEBOUNCE_DELAY) {
                initializeWidgets();
            } else {
                requestAnimationFrame(frame);
            }
        };
        requestAnimationFrame(frame);
    }

    function handleMutations(mutations) {
        let external = false;
        let reconnect = false;

        mutations.forEach(mutation => {
            mutation.removedNodes.forEach(node => {
                if (node.nodeType !== 1) return;
                const widgets = node.matches?.('.symplissime-chat-widget')
                    ? [node]
                    : node.querySelectorAll
                        ? node.querySelectorAll('.symplissime-chat-widget')
                        : [];
                widgets.forEach(widget => {
                    const instance = widgetInstances.get(widget);
                    if (instance && typeof instance.destroy === 'function') {
                        instance.destroy();
                    } else {
                        widgetInstances.delete(widget);
                    }
                    const container = getObservationRoot(widget);
                    if (container && observedContainers.has(container) && !container.isConnected) {
                        reconnect = true;
                    }
                });
            });

            if (!mutation.target.closest('.symplissime-chat-widget')) {
                external = true;
            }
        });

        if (reconnect && observer) {
            observer.disconnect();
            observedContainers = new WeakSet();
            document
                .querySelectorAll('.symplissime-chat-widget')
                .forEach(widget => observeContainer(getObservationRoot(widget)));
        }

        if (external) scheduleInitialize();
    }

    if (supports('MutationObserver')) {
        observer = new MutationObserver(handleMutations);
        document
            .querySelectorAll('.symplissime-chat-widget')
            .forEach(widget => observeContainer(getObservationRoot(widget)));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWidgets);
    } else {
        setTimeout(initializeWidgets, 0);
    }

    SymplissimeWidgetNS.init = initializeWidgets;
    SymplissimeWidgetNS.getInstance = element => widgetInstances.get(element);
    SymplissimeWidgetNS.Widget = SymplissimeWidget;
    SymplissimeWidgetNS.supports = supports;
    SymplissimeWidgetNS.fetch = fetchWithFallback;

    global.SymplissimeWidget = SymplissimeWidgetNS;

})(window);
