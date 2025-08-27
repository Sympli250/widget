<?php
$configFile = __DIR__ . '/widget_config.json';
$themesFile = __DIR__ . '/widget-themes.json';

$defaultThemes = [
    'symplissime' => [
        'name' => 'Symplissime Classic',
        'primary' => '#48bb78',
        'primaryHover' => '#38a169',
        'primaryLight' => '#c6f6d5',
        'primaryDark' => '#2f855a',
        'success' => '#48bb78',
        'background' => '#ffffff',
        'backgroundSecondary' => '#f7fafc',
        'text' => '#1a202c',
        'textSecondary' => '#718096',
        'border' => '#e2e8f0',
        'shadow' => '0 4px 20px rgba(72, 187, 120, 0.15)'
    ],
    'professional' => [
        'name' => 'Professional Blue',
        'primary' => '#4299e1',
        'primaryHover' => '#3182ce',
        'primaryLight' => '#bee3f8',
        'primaryDark' => '#2c5aa0',
        'success' => '#48bb78',
        'background' => '#ffffff',
        'backgroundSecondary' => '#f7fafc',
        'text' => '#1a202c',
        'textSecondary' => '#718096',
        'border' => '#e2e8f0',
        'shadow' => '0 4px 20px rgba(66, 153, 225, 0.15)'
    ],
    'modern' => [
        'name' => 'Modern Purple',
        'primary' => '#9f7aea',
        'primaryHover' => '#805ad5',
        'primaryLight' => '#e9d8fd',
        'primaryDark' => '#6b46c1',
        'success' => '#48bb78',
        'background' => '#ffffff',
        'backgroundSecondary' => '#f7fafc',
        'text' => '#1a202c',
        'textSecondary' => '#718096',
        'border' => '#e2e8f0',
        'shadow' => '0 4px 20px rgba(159, 122, 234, 0.15)'
    ],
    'elegant' => [
        'name' => 'Elegant Dark',
        'primary' => '#4a5568',
        'primaryHover' => '#2d3748',
        'primaryLight' => '#e2e8f0',
        'primaryDark' => '#1a202c',
        'success' => '#48bb78',
        'background' => '#1a202c',
        'backgroundSecondary' => '#2d3748',
        'text' => '#f7fafc',
        'textSecondary' => '#a0aec0',
        'border' => '#4a5568',
        'shadow' => '0 4px 20px rgba(74, 85, 104, 0.3)'
    ],
    'minimal' => [
        'name' => 'Minimal Gray',
        'primary' => '#a0aec0',
        'primaryHover' => '#718096',
        'primaryLight' => '#f7fafc',
        'primaryDark' => '#4a5568',
        'success' => '#48bb78',
        'background' => '#ffffff',
        'backgroundSecondary' => '#f7fafc',
        'text' => '#1a202c',
        'textSecondary' => '#718096',
        'border' => '#e2e8f0',
        'shadow' => '0 4px 20px rgba(160, 174, 192, 0.15)'
    ]
];

$defaultConfig = [
    'attributes' => [
        'api_endpoint' => 'symplissime-widget-api.php',
        'workspace' => '',
        'title' => '',
        'auto_open' => false,
        'position' => 'bottom-right',
        'theme' => 'symplissime',
        'accent_color' => '#48bb78',
        'font_family' => 'default',
        'quick_messages' => ''
    ],
    'greetings' => [
        'welcome_message' => "👋 **Bonjour !** Bienvenue chez Symplissime AI.\n\nComment puis-je vous aider aujourd'hui ?",
        'display_mode' => 'bubble_immediate',
        'display_delay' => 30
    ],
    'general' => [
        'display_name' => 'Symplissime AI',
        'profile_picture' => '',
        'bubble_icon' => true,
        'bubble_position' => 'right',
        'send_history_email' => false,
        'owner_email' => '',
        'footer_enabled' => false,
        'footer_text' => '',
        'language' => 'fr',
        'time_zone' => 'Europe/Paris'
    ]
];

$config = $defaultConfig;
if (file_exists($configFile)) {
    $json = json_decode(file_get_contents($configFile), true);
    if (is_array($json)) {
        $config = array_replace_recursive($config, $json);
    }
}

$themes = $defaultThemes;
if (file_exists($themesFile)) {
    $json = json_decode(file_get_contents($themesFile), true);
    if (is_array($json)) {
        $themes = array_replace_recursive($themes, $json);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $postedThemes = $_POST['themes'] ?? [];
    foreach ($themes as $key => $values) {
        foreach ($values as $prop => $val) {
            if (isset($postedThemes[$key][$prop])) {
                $themes[$key][$prop] = $postedThemes[$key][$prop];
            }
        }
    }
    file_put_contents($themesFile, json_encode($themes, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    $config['attributes']['api_endpoint'] = $_POST['api_endpoint'] ?? 'symplissime-widget-api.php';
    $config['attributes']['workspace'] = $_POST['workspace'] ?? '';
    $config['attributes']['title'] = $_POST['title'] ?? '';
    $config['attributes']['auto_open'] = isset($_POST['auto_open']);
    $config['attributes']['position'] = $_POST['position'] ?? 'bottom-right';
    $config['attributes']['theme'] = $_POST['theme'] ?? 'symplissime';
    $config['attributes']['accent_color'] = $_POST['accent_color'] ?? '#48bb78';
    $config['attributes']['font_family'] = $_POST['font_family'] ?? 'default';
    $config['attributes']['quick_messages'] = $_POST['quick_messages'] ?? '';
    $config['greetings']['welcome_message'] = $_POST['welcome_message'] ?? $defaultConfig['greetings']['welcome_message'];
    $config['greetings']['display_mode'] = $_POST['display_mode'] ?? $defaultConfig['greetings']['display_mode'];
    $config['greetings']['display_delay'] = isset($_POST['display_delay']) ? (int)$_POST['display_delay'] : $defaultConfig['greetings']['display_delay'];
    $config['general']['display_name'] = trim(preg_replace('/\s+/', ' ', $_POST['display_name'] ?? $defaultConfig['general']['display_name']));
    $config['general']['profile_picture'] = $_POST['profile_picture'] ?? '';
    $config['general']['bubble_icon'] = isset($_POST['bubble_icon']);
    $config['general']['bubble_position'] = $_POST['bubble_position'] ?? 'right';
    $config['general']['send_history_email'] = isset($_POST['send_history_email']);
    $config['general']['owner_email'] = $_POST['owner_email'] ?? '';
    $config['general']['footer_enabled'] = isset($_POST['footer_enabled']);
    $config['general']['footer_text'] = $_POST['footer_text'] ?? '';
    $config['general']['language'] = $_POST['language'] ?? 'fr';
    $config['general']['time_zone'] = $_POST['time_zone'] ?? $defaultConfig['general']['time_zone'];

    file_put_contents($configFile, json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}
$snippet = '<script src="symplissime-widget.js"></script>' . "\n";
$welcomeAttr = str_replace("\n", '&#10;', htmlspecialchars($config['greetings']['welcome_message'], ENT_QUOTES));
$quickAttr = htmlspecialchars(str_replace("\n", '|', $config['attributes']['quick_messages']), ENT_QUOTES);
$snippet .= '<div class="symplissime-chat-widget" '
    . 'data-api-endpoint="' . htmlspecialchars($config['attributes']['api_endpoint']) . '" '
    . 'data-workspace="' . htmlspecialchars($config['attributes']['workspace']) . '" '
    . 'data-title="' . htmlspecialchars($config['attributes']['title']) . '" '
    . 'data-welcome-message="' . $welcomeAttr . '" '
    . 'data-quick-messages="' . $quickAttr . '" '
    . 'data-greeting-mode="' . htmlspecialchars($config['greetings']['display_mode']) . '" '
    . 'data-greeting-delay="' . htmlspecialchars($config['greetings']['display_delay']) . '" '
    . 'data-auto-open="' . ($config['attributes']['auto_open'] ? 'true' : 'false') . '" '
    . 'data-position="' . htmlspecialchars($config['attributes']['position']) . '" '
    . 'data-theme="' . htmlspecialchars($config['attributes']['theme']) . '" '
    . 'data-accent-color="' . htmlspecialchars($config['attributes']['accent_color']) . '" '
    . 'data-font="' . htmlspecialchars($config['attributes']['font_family']) . '" '
    . 'data-display-name="' . htmlspecialchars($config['general']['display_name']) . '" '
    . 'data-profile-picture="' . htmlspecialchars($config['general']['profile_picture']) . '" '
    . 'data-bubble-icon="' . ($config['general']['bubble_icon'] ? 'true' : 'false') . '" '
    . 'data-bubble-position="' . htmlspecialchars($config['general']['bubble_position']) . '" '
    . 'data-send-history-email="' . ($config['general']['send_history_email'] ? 'true' : 'false') . '" '
    . 'data-owner-email="' . htmlspecialchars($config['general']['owner_email']) . '" '
    . 'data-footer-enabled="' . ($config['general']['footer_enabled'] ? 'true' : 'false') . '" '
    . 'data-footer-text="' . htmlspecialchars($config['general']['footer_text']) . '" '
    . 'data-language="' . htmlspecialchars($config['general']['language']) . '" '
    . 'data-time-zone="' . htmlspecialchars($config['general']['time_zone']) . '"></div>';
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configuration du Widget</title>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: #f7fafc;
            color: #2d3748;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: #fff;
            border-radius: 8px;
            padding: 20px 40px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }
        .tabs {
            display: flex;
            gap: 10px;
            border-bottom: 1px solid #e2e8f0;
            margin-bottom: 20px;
        }
        .tabs button {
            background: none;
            border: none;
            padding: 10px 20px;
            cursor: pointer;
            font-weight: 600;
            color: #4a5568;
            border-radius: 6px 6px 0 0;
        }
        .tabs button.active {
            background: #3182ce;
            color: #fff;
        }
        .tabcontent {
            display: none;
        }
        .tabcontent.active {
            display: block;
        }
        fieldset {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
        }
        fieldset legend {
            font-weight: 600;
            padding: 0 5px;
        }
        .theme-inputs {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
        }
        .theme-inputs label {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 0.9rem;
        }
        textarea {
            width: 100%;
            height: 100px;
        }
        #previewArea {
            min-height: 200px;
            border: 2px dashed #cbd5e0;
            border-radius: 8px;
            padding: 20px;
            position: relative;
        }

        .preset-gallery {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-bottom: 20px;
        }
        .preset-thumb {
            width: 80px;
            height: 60px;
            border: 2px solid transparent;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            text-align: center;
        }
        .preset-thumb.selected {
            border-color: #3182ce;
        }
        .accent-palette {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin: 10px 0;
        }
        .accent-color {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid transparent;
            cursor: pointer;
        }
        .accent-color.selected {
            border-color: #3182ce;
        }
        .contrast-warning {
            background: #fff3cd;
            color: #856404;
            padding: 10px;
            border: 1px solid #ffeeba;
            border-radius: 4px;
            margin-top: 10px;
        }
    </style>
</head>
<body>
<div class="container">
<form method="post" id="configForm">
    <div class="tabs">
        <button type="button" class="tablink active" data-tab="general">General</button>
        <button type="button" class="tablink" data-tab="themes">Thèmes</button>
        <button type="button" class="tablink" data-tab="attributes">Attributs</button>
        <button type="button" class="tablink" data-tab="greetings">Greetings</button>
        <button type="button" class="tablink" data-tab="code">Code</button>
        <button type="button" class="tablink" data-tab="preview">Preview</button>
    </div>

    <div id="general" class="tabcontent active">
        <label>Display Name:
            <input type="text" name="display_name" maxlength="60" value="<?php echo htmlspecialchars($config['general']['display_name']); ?>">
        </label><br><br>
        <label>Profile Picture URL:
            <input type="text" name="profile_picture" id="profile_picture" value="<?php echo htmlspecialchars($config['general']['profile_picture']); ?>">
            <img id="profile_preview" src="<?php echo htmlspecialchars($config['general']['profile_picture']); ?>" alt="" style="max-width:50px;<?php echo $config['general']['profile_picture'] ? '' : 'display:none'; ?>">
            <button type="button" id="remove_profile">Retirer</button>
        </label><br><br>
        <label>Bubble Icon:
            <input type="checkbox" name="bubble_icon" <?php echo $config['general']['bubble_icon'] ? 'checked' : ''; ?>>
        </label><br><br>
        <label>Bubble Position:
            <select name="bubble_position">
                <option value="right" <?php echo $config['general']['bubble_position'] === 'right' ? 'selected' : ''; ?>>Right</option>
                <option value="left" <?php echo $config['general']['bubble_position'] === 'left' ? 'selected' : ''; ?>>Left</option>
            </select>
        </label><br><br>
        <label>Send Chat History to Email:
            <input type="checkbox" name="send_history_email" <?php echo $config['general']['send_history_email'] ? 'checked' : ''; ?>>
        </label><br><br>
        <label>Owner Email:
            <input type="email" name="owner_email" value="<?php echo htmlspecialchars($config['general']['owner_email']); ?>">
        </label><br><br>
        <label>Footer:
            <input type="checkbox" name="footer_enabled" <?php echo $config['general']['footer_enabled'] ? 'checked' : ''; ?>>
        </label><br><br>
        <label>Footer Text:
            <textarea name="footer_text"><?php echo htmlspecialchars($config['general']['footer_text']); ?></textarea>
        </label><br><br>
        <label>Language:
            <select name="language">
                <option value="fr" <?php echo $config['general']['language'] === 'fr' ? 'selected' : ''; ?>>Français</option>
                <option value="en" <?php echo $config['general']['language'] === 'en' ? 'selected' : ''; ?>>English</option>
            </select>
        </label><br><br>
        <label>Time Zone:
            <input type="text" name="time_zone" value="<?php echo htmlspecialchars($config['general']['time_zone']); ?>">
        </label>
    </div>

    <div id="themes" class="tabcontent">
        <input type="hidden" name="theme" id="themeInput" value="<?php echo htmlspecialchars($config['attributes']['theme']); ?>">
        <h3>Presets</h3>
        <div class="preset-gallery" id="presetGallery">
            <?php foreach ($themes as $key => $t): ?>
                <div class="preset-thumb" data-theme="<?php echo $key; ?>" style="background: <?php echo htmlspecialchars($t['background']); ?>; color: <?php echo htmlspecialchars($t['text']); ?>;">
                    <?php echo htmlspecialchars($t['name']); ?>
                </div>
            <?php endforeach; ?>
        </div>

        <h3>Accent Color</h3>
        <div class="accent-palette" id="accentPalette">
            <?php $palette = ['#4f46e5','#4338ca','#10b981','#ef4444','#f59e0b','#3b82f6','#ec4899','#8b5cf6','#6366f1','#14b8a6','#0ea5e9','#f97316'];
            foreach ($palette as $color): ?>
                <button type="button" class="accent-color" data-color="<?php echo $color; ?>" style="background: <?php echo $color; ?>;"></button>
            <?php endforeach; ?>
            <input type="color" id="accentInput" name="accent_color" value="<?php echo htmlspecialchars($config['attributes']['accent_color']); ?>">
        </div>
        <div id="contrastWarning" class="contrast-warning" style="display:none"></div>

        <h3>Police</h3>
        <select name="font_family" id="fontSelect">
            <option value="default" <?php echo $config['attributes']['font_family'] === 'default' ? 'selected' : ''; ?>>Default</option>
            <option value="sans-serif" <?php echo $config['attributes']['font_family'] === 'sans-serif' ? 'selected' : ''; ?>>Sans-serif moderne</option>
            <option value="serif" <?php echo $config['attributes']['font_family'] === 'serif' ? 'selected' : ''; ?>>Serif</option>
            <option value="monospace" <?php echo $config['attributes']['font_family'] === 'monospace' ? 'selected' : ''; ?>>Monospace</option>
        </select>

        <br><br>
        <button type="button" id="resetTheme">Réinitialiser le thème</button>
    </div>

    <div id="attributes" class="tabcontent">
        <label>API Endpoint:
            <input type="text" name="api_endpoint" value="<?php echo htmlspecialchars($config['attributes']['api_endpoint']); ?>">
        </label><br><br>
        <label>Workspace:
            <input type="text" name="workspace" value="<?php echo htmlspecialchars($config['attributes']['workspace']); ?>">
        </label><br><br>
        <label>Titre:
            <input type="text" name="title" value="<?php echo htmlspecialchars($config['attributes']['title']); ?>">
        </label><br><br>
        <label>Auto-ouvrir:
            <input type="checkbox" name="auto_open" <?php echo $config['attributes']['auto_open'] ? 'checked' : ''; ?>>
        </label><br><br>
        <label>Position:
            <select name="position">
                <?php $positions = ['bottom-right', 'bottom-left', 'top-right', 'top-left']; ?>
                <?php foreach ($positions as $pos): ?>
                    <option value="<?php echo $pos; ?>" <?php echo $config['attributes']['position'] === $pos ? 'selected' : ''; ?>><?php echo $pos; ?></option>
                <?php endforeach; ?>
            </select>
        </label>
    </div>

    <div id="greetings" class="tabcontent">
        <label>Welcome message:<br>
            <textarea name="welcome_message"><?php echo htmlspecialchars($config['greetings']['welcome_message']); ?></textarea>
        </label>
        <br><br>
        <label>Quick replies (one per line):<br>
            <textarea name="quick_messages"><?php echo htmlspecialchars($config['attributes']['quick_messages']); ?></textarea>
        </label>
        <br><br>
        <label>Display mode:<br>
            <select name="display_mode">
                <option value="bubble_immediate" <?php echo $config['greetings']['display_mode'] === 'bubble_immediate' ? 'selected' : ''; ?>>Au-dessus de la bulle – immédiat</option>
                <option value="bubble_delay" <?php echo $config['greetings']['display_mode'] === 'bubble_delay' ? 'selected' : ''; ?>>Au-dessus de la bulle – après délai</option>
                <option value="chat" <?php echo $config['greetings']['display_mode'] === 'chat' ? 'selected' : ''; ?>>Dans la fenêtre de chat uniquement</option>
            </select>
        </label>
        <br><br>
        <label>Delay (s):<br>
            <input type="number" name="display_delay" min="0" value="<?php echo htmlspecialchars($config['greetings']['display_delay']); ?>">
        </label>
    </div>

    <div id="code" class="tabcontent">
        <textarea readonly id="snippet"><?php echo htmlspecialchars($snippet); ?></textarea>
        <button type="button" id="copySnippet">Copier</button>
    </div>

    <div id="preview" class="tabcontent">
        <p>Prévisualisation du widget (apparait en bas de page).</p>
        <div id="previewArea"></div>
    </div>

    <br>
    <button type="submit">Sauvegarder</button>
</form>
</div>

<script src="symplissime-widget.js"></script>
<script>
    const THEMES = <?php echo json_encode($themes, JSON_UNESCAPED_UNICODE); ?>;
    const tabs = document.querySelectorAll('.tablink');
    const contents = document.querySelectorAll('.tabcontent');
    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            tabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            contents.forEach(c => c.classList.remove('active'));
            document.getElementById(btn.dataset.tab).classList.add('active');
            if (btn.dataset.tab === 'preview') {
                updateAll();
            }
        });
    });

    const form = document.getElementById('configForm');
    const themeInput = document.getElementById('themeInput');
    const presetGallery = document.getElementById('presetGallery');
    const accentInput = document.getElementById('accentInput');
    const accentPalette = document.getElementById('accentPalette');
    const contrastWarning = document.getElementById('contrastWarning');
    const fontSelect = document.getElementById('fontSelect');
    const resetBtn = document.getElementById('resetTheme');

    function buildSnippet(data) {
        const autoOpen = data.get('auto_open') ? 'true' : 'false';
        const welcome = data.get('welcome_message').replace(/\n/g, '&#10;').replace(/"/g, '&quot;');
        const quick = data.get('quick_messages').split('\n').map(m => m.trim()).filter(Boolean).join('|').replace(/"/g, '&quot;');
        return '<script src="symplissime-widget.js"><\/script>\n' +
            `<div class="symplissime-chat-widget" data-api-endpoint="${data.get('api_endpoint')}" data-workspace="${data.get('workspace')}" data-title="${data.get('title')}" data-welcome-message="${welcome}" data-quick-messages="${quick}" data-greeting-mode="${data.get('display_mode')}" data-greeting-delay="${data.get('display_delay')}" data-auto-open="${autoOpen}" data-position="${data.get('position')}" data-theme="${data.get('theme')}" data-accent-color="${data.get('accent_color')}" data-font="${data.get('font_family')}" data-display-name="${data.get('display_name')}" data-profile-picture="${data.get('profile_picture')}" data-bubble-icon="${data.get('bubble_icon') ? 'true' : 'false'}" data-bubble-position="${data.get('bubble_position')}" data-send-history-email="${data.get('send_history_email') ? 'true' : 'false'}" data-owner-email="${data.get('owner_email')}" data-footer-enabled="${data.get('footer_enabled') ? 'true' : 'false'}" data-footer-text="${data.get('footer_text')}" data-language="${data.get('language')}" data-time-zone="${data.get('time_zone')}"></div>`;
    }

    function updateSnippet() {
        const data = new FormData(form);
        document.getElementById('snippet').value = buildSnippet(data);
    }

    function renderPreview() {
        const data = new FormData(form);
        const preview = document.getElementById('previewArea');
        preview.innerHTML = '';
        const widget = document.createElement('div');
        widget.className = 'symplissime-chat-widget';
        widget.dataset.apiEndpoint = data.get('api_endpoint');
        widget.dataset.workspace = data.get('workspace');
        widget.dataset.title = data.get('title');
        widget.dataset.welcomeMessage = data.get('welcome_message');
        widget.dataset.quickMessages = data.get('quick_messages').split('\n').map(m => m.trim()).filter(Boolean).join('|');
        widget.dataset.greetingMode = data.get('display_mode');
        widget.dataset.greetingDelay = data.get('display_delay');
        widget.dataset.autoOpen = data.get('auto_open') ? 'true' : 'false';
        widget.dataset.position = data.get('position');
        widget.dataset.theme = data.get('theme');
        widget.dataset.accentColor = data.get('accent_color');
        widget.dataset.font = data.get('font_family');
        widget.dataset.displayName = data.get('display_name');
        widget.dataset.profilePicture = data.get('profile_picture');
        widget.dataset.bubbleIcon = data.get('bubble_icon') ? 'true' : 'false';
        widget.dataset.bubblePosition = data.get('bubble_position');
        widget.dataset.sendHistoryEmail = data.get('send_history_email') ? 'true' : 'false';
        widget.dataset.ownerEmail = data.get('owner_email');
        widget.dataset.footerEnabled = data.get('footer_enabled') ? 'true' : 'false';
        widget.dataset.footerText = data.get('footer_text');
        widget.dataset.language = data.get('language');
        widget.dataset.timeZone = data.get('time_zone');
        preview.appendChild(widget);
    }

    function updateAll() {
        updateSnippet();
        renderPreview();
    }

    form.addEventListener('input', updateAll);
    updateAll();

    function hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
    }

    function luminance(r, g, b) {
        const a = [r, g, b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }

    function contrast(c1, c2) {
        const L1 = luminance(...Object.values(hexToRgb(c1)));
        const L2 = luminance(...Object.values(hexToRgb(c2)));
        return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    }

    function shade(color, percent) {
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

    function adjustColor(color, bg) {
        let ratio = contrast(color, bg);
        let adjusted = color;
        const lightBg = luminance(...Object.values(hexToRgb(bg))) > 0.5;
        while (ratio < 4.5) {
            adjusted = shade(adjusted, lightBg ? -10 : 10);
            ratio = contrast(adjusted, bg);
        }
        return adjusted;
    }

    function checkContrast() {
        const theme = themeInput.value;
        const accent = accentInput.value;
        const bg = THEMES[theme] ? THEMES[theme].background : '#ffffff';
        const ratio = contrast(accent, bg);
        if (ratio < 4.5) {
            const suggestion = adjustColor(accent, bg);
            contrastWarning.innerHTML = `Contraste insuffisant (${ratio.toFixed(2)}). <button type="button" id="applyAdjust">Ajuster</button> <button type="button" id="keepAccent">Conserver</button>`;
            contrastWarning.style.display = 'block';
            document.getElementById('applyAdjust').onclick = () => {
                accentInput.value = suggestion;
                updateAll();
                checkContrast();
            };
            document.getElementById('keepAccent').onclick = () => {
                contrastWarning.style.display = 'none';
            };
        } else {
            contrastWarning.style.display = 'none';
        }
    }

    function selectAccent(color) {
        accentPalette.querySelectorAll('.accent-color').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.color.toLowerCase() === color.toLowerCase());
        });
    }

    presetGallery.querySelectorAll('.preset-thumb').forEach(el => {
        el.addEventListener('click', () => {
            presetGallery.querySelectorAll('.preset-thumb').forEach(p => p.classList.remove('selected'));
            el.classList.add('selected');
            themeInput.value = el.dataset.theme;
            const primary = THEMES[el.dataset.theme].primary;
            accentInput.value = primary;
            selectAccent(primary);
            updateAll();
            checkContrast();
        });
    });

    accentPalette.querySelectorAll('.accent-color').forEach(btn => {
        btn.addEventListener('click', () => {
            accentInput.value = btn.dataset.color;
            selectAccent(btn.dataset.color);
            updateAll();
            checkContrast();
        });
    });

    accentInput.addEventListener('input', () => {
        selectAccent(accentInput.value);
        updateAll();
        checkContrast();
    });

    resetBtn.addEventListener('click', () => {
        themeInput.value = 'symplissime';
        accentInput.value = THEMES.symplissime.primary;
        fontSelect.value = 'default';
        presetGallery.querySelectorAll('.preset-thumb').forEach(p => p.classList.toggle('selected', p.dataset.theme === 'symplissime'));
        selectAccent(accentInput.value);
        updateAll();
        checkContrast();
    });

    // initialize selections
    presetGallery.querySelectorAll('.preset-thumb').forEach(p => {
        if (p.dataset.theme === themeInput.value) p.classList.add('selected');
    });
    selectAccent(accentInput.value);
    checkContrast();

    document.getElementById('copySnippet').addEventListener('click', () => {
        const text = document.getElementById('snippet').value;
        navigator.clipboard.writeText(text).then(() => {
            alert('Snippet copié !');
        });
    });

    const profileInput = document.getElementById('profile_picture');
    const profilePreview = document.getElementById('profile_preview');
    const removeProfileBtn = document.getElementById('remove_profile');
    if (profileInput) {
        profileInput.addEventListener('input', () => {
            profilePreview.src = profileInput.value;
            profilePreview.style.display = profileInput.value ? 'block' : 'none';
            updateAll();
        });
        removeProfileBtn.addEventListener('click', () => {
            profileInput.value = '';
            profilePreview.src = '';
            profilePreview.style.display = 'none';
            updateAll();
        });
    }
</script>
</body>
</html>
