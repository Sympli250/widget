<?php
$configFile = __DIR__ . '/widget_config.json';
$themesFile = __DIR__ . '/widget-themes.json';
require_once __DIR__ . '/snippet.php';

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
        'bubble_icon' => 'default_icon',
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

$themes = [];
if (file_exists($themesFile)) {
    $json = json_decode(file_get_contents($themesFile), true);
    if (is_array($json)) {
        $themes = $json;
    }
}

$saved = false;
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
    $config['general']['bubble_icon'] = $_POST['bubble_icon'] ?? 'default_icon';
    $config['general']['bubble_position'] = $_POST['bubble_position'] ?? 'right';
    $config['general']['send_history_email'] = isset($_POST['send_history_email']);
    $config['general']['owner_email'] = $_POST['owner_email'] ?? '';
    $config['general']['footer_enabled'] = isset($_POST['footer_enabled']);
    $config['general']['footer_text'] = $_POST['footer_text'] ?? '';
    $config['general']['language'] = $_POST['language'] ?? 'fr';
    $config['general']['time_zone'] = $_POST['time_zone'] ?? $defaultConfig['general']['time_zone'];

    file_put_contents($configFile, json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    $saved = true;
}
$snippet = renderSnippet($config);
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configuration du Widget</title>
    <link rel="stylesheet" href="assets/admin.css">
</head>
<body>
<div class="container">
<?php if (!empty($saved)) : ?>
    <div class="notice success">Configuration sauvegardée.</div>
<?php endif; ?>
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
            <input type="text" name="display_name" maxlength="60" placeholder="Nom affiché dans le widget" value="<?php echo htmlspecialchars($config['general']['display_name']); ?>">
            <small class="help">Nom visible par vos utilisateurs (60 caractères max).</small>
        </label><br><br>
        <label>Profile Picture URL:
            <input type="text" name="profile_picture" id="profile_picture" placeholder="https://exemple.com/avatar.png" value="<?php echo htmlspecialchars($config['general']['profile_picture']); ?>">
            <img id="profile_preview" src="<?php echo htmlspecialchars($config['general']['profile_picture']); ?>" alt="" style="max-width:50px;<?php echo $config['general']['profile_picture'] ? '' : 'display:none'; ?>">
            <button type="button" id="remove_profile">Retirer</button>
            <small class="help">URL complète de l'image de profil.</small>
        </label><br><br>
        <label>Bubble Icon:
            <select name="bubble_icon" id="bubble_icon">
                <?php
                $icons = ['default_icon', 'message', 'question', 'robot', 'support', 'star'];
                foreach ($icons as $icon) {
                    $selected = $config['general']['bubble_icon'] === $icon ? 'selected' : '';
                    $label = ucwords(str_replace('_', ' ', $icon));
                    echo "<option value=\"$icon\" $selected>$label</option>";
                }
                ?>
            </select>
            <small class="help">Icône affichée dans la bulle de chat.</small>
        </label><br><br>
        <label>Bubble Position:
            <select name="bubble_position">
                <option value="right" <?php echo $config['general']['bubble_position'] === 'right' ? 'selected' : ''; ?>>Right</option>
                <option value="left" <?php echo $config['general']['bubble_position'] === 'left' ? 'selected' : ''; ?>>Left</option>
            </select>
            <small class="help">Choisissez le coin d'affichage de la bulle.</small>
        </label><br><br>
        <label>Send Chat History to Email:
            <input type="checkbox" name="send_history_email" <?php echo $config['general']['send_history_email'] ? 'checked' : ''; ?>>
            <small class="help">Envoie la conversation à l'utilisateur par e-mail.</small>
        </label><br><br>
        <label>Owner Email:
            <input type="email" name="owner_email" placeholder="nom@exemple.com" value="<?php echo htmlspecialchars($config['general']['owner_email']); ?>">
            <small class="help">Adresse e‑mail recevant les discussions.</small>
        </label><br><br>
        <label>Footer:
            <input type="checkbox" name="footer_enabled" <?php echo $config['general']['footer_enabled'] ? 'checked' : ''; ?>>
            <small class="help">Active un texte personnalisé sous le widget.</small>
        </label><br><br>
        <label>Footer Text:
            <textarea name="footer_text" placeholder="Texte du pied de page"><?php echo htmlspecialchars($config['general']['footer_text']); ?></textarea>
            <small class="help">Texte court affiché sous le widget.</small>
        </label><br><br>
        <label>Language:
            <select name="language">
                <option value="fr" <?php echo $config['general']['language'] === 'fr' ? 'selected' : ''; ?>>Français</option>
                <option value="en" <?php echo $config['general']['language'] === 'en' ? 'selected' : ''; ?>>English</option>
            </select>
            <small class="help">Langue de l'interface du widget.</small>
        </label><br><br>
        <label>Time Zone:
            <input type="text" name="time_zone" placeholder="Europe/Paris" value="<?php echo htmlspecialchars($config['general']['time_zone']); ?>">
            <small class="help">Fuseau horaire IANA, ex. Europe/Paris.</small>
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
            <input type="text" name="api_endpoint" placeholder="symplissime-widget-api.php" value="<?php echo htmlspecialchars($config['attributes']['api_endpoint']); ?>">
            <small class="help">Chemin ou URL du script API.</small>
        </label><br><br>
        <label>Workspace:
            <input type="text" name="workspace" placeholder="ex : monespace" value="<?php echo htmlspecialchars($config['attributes']['workspace']); ?>">
            <small class="help">Identifiant de votre espace.</small>
        </label><br><br>
        <label>Titre:
            <input type="text" name="title" placeholder="Titre du widget" value="<?php echo htmlspecialchars($config['attributes']['title']); ?>">
            <small class="help">Titre affiché en haut de la fenêtre.</small>
        </label><br><br>
        <label>Auto-ouvrir:
            <input type="checkbox" name="auto_open" <?php echo $config['attributes']['auto_open'] ? 'checked' : ''; ?>>
            <small class="help">Ouvre le widget à l'arrivée sur la page.</small>
        </label><br><br>
        <label>Position:
            <select name="position">
                <?php $positions = ['bottom-right', 'bottom-left', 'top-right', 'top-left']; ?>
                <?php foreach ($positions as $pos): ?>
                    <option value="<?php echo $pos; ?>" <?php echo $config['attributes']['position'] === $pos ? 'selected' : ''; ?>><?php echo $pos; ?></option>
                <?php endforeach; ?>
            </select>
            <small class="help">Emplacement de la fenêtre sur l'écran.</small>
        </label>
    </div>

    <div id="greetings" class="tabcontent">
        <label>Welcome message:<br>
            <textarea name="welcome_message" placeholder="Message de bienvenue..."><?php echo htmlspecialchars($config['greetings']['welcome_message']); ?></textarea>
            <small class="help">Texte affiché lors de l'ouverture du widget.</small>
        </label>
        <br><br>
        <label>Quick replies (one per line):<br>
            <textarea name="quick_messages" placeholder="Bonjour&#10;J'ai une question..."><?php echo htmlspecialchars($config['attributes']['quick_messages']); ?></textarea>
            <small class="help">Une ligne par suggestion de réponse rapide.</small>
        </label>
        <br><br>
        <label>Display mode:<br>
            <select name="display_mode">
                <option value="bubble_immediate" <?php echo $config['greetings']['display_mode'] === 'bubble_immediate' ? 'selected' : ''; ?>>Au-dessus de la bulle – immédiat</option>
                <option value="bubble_delay" <?php echo $config['greetings']['display_mode'] === 'bubble_delay' ? 'selected' : ''; ?>>Au-dessus de la bulle – après délai</option>
                <option value="chat" <?php echo $config['greetings']['display_mode'] === 'chat' ? 'selected' : ''; ?>>Dans la fenêtre de chat uniquement</option>
            </select>
            <small class="help">Emplacement du message de bienvenue.</small>
        </label>
        <br><br>
        <label>Delay (s):<br>
            <input type="number" name="display_delay" min="0" placeholder="30" value="<?php echo htmlspecialchars($config['greetings']['display_delay']); ?>">
            <small class="help">Délai avant affichage du message (en secondes).</small>
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
<script src="assets/admin.js"></script>
</body>
</html>
