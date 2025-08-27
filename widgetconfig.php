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
        'theme' => 'symplissime'
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

    file_put_contents($configFile, json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}
$snippet = '<script src="symplissime-widget.js"></script>' . "\n";
$snippet .= '<div class="symplissime-chat-widget" '
    . 'data-api-endpoint="' . htmlspecialchars($config['attributes']['api_endpoint']) . '" '
    . 'data-workspace="' . htmlspecialchars($config['attributes']['workspace']) . '" '
    . 'data-title="' . htmlspecialchars($config['attributes']['title']) . '" '
    . 'data-auto-open="' . ($config['attributes']['auto_open'] ? 'true' : 'false') . '" '
    . 'data-position="' . htmlspecialchars($config['attributes']['position']) . '" '
    . 'data-theme="' . htmlspecialchars($config['attributes']['theme']) . '"></div>';
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configuration du Widget</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .tabs { margin-bottom: 10px; }
        .tabs button { padding: 10px; cursor: pointer; }
        .tabcontent { display: none; border: 1px solid #ccc; padding: 10px; }
        .tabcontent.active { display: block; }
        .theme-input { margin-bottom: 5px; }
        textarea { width: 100%; height: 100px; }
    </style>
</head>
<body>
<form method="post" id="configForm">
    <div class="tabs">
        <button type="button" class="tablink" data-tab="themes">Thèmes</button>
        <button type="button" class="tablink" data-tab="attributes">Attributs</button>
        <button type="button" class="tablink" data-tab="code">Code</button>
    </div>

    <div id="themes" class="tabcontent">
        <?php foreach ($themes as $key => $theme): ?>
            <fieldset>
                <legend><?php echo htmlspecialchars($theme['name']); ?></legend>
                <?php foreach ($theme as $prop => $val): if ($prop === 'name') continue; ?>
                    <label>
                        <?php echo $prop; ?>:
                        <?php if (strpos($val, '#') === 0): ?>
                            <input type="color" name="themes[<?php echo $key; ?>][<?php echo $prop; ?>]" value="<?php echo htmlspecialchars($val); ?>">
                        <?php else: ?>
                            <input type="text" name="themes[<?php echo $key; ?>][<?php echo $prop; ?>]" value="<?php echo htmlspecialchars($val); ?>">
                        <?php endif; ?>
                    </label><br>
                <?php endforeach; ?>
            </fieldset>
            <br>
        <?php endforeach; ?>
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
        </label><br><br>
        <label>Thème:
            <select name="theme">
                <?php foreach ($themes as $key => $t): ?>
                    <option value="<?php echo $key; ?>" <?php echo $config['attributes']['theme'] === $key ? 'selected' : ''; ?>><?php echo htmlspecialchars($t['name']); ?></option>
                <?php endforeach; ?>
            </select>
        </label>
    </div>

    <div id="code" class="tabcontent">
        <textarea readonly id="snippet"><?php echo htmlspecialchars($snippet); ?></textarea>
        <button type="button" id="copySnippet">Copier</button>
    </div>

    <br>
    <button type="submit">Sauvegarder</button>
</form>

<script>
    const tabs = document.querySelectorAll('.tablink');
    const contents = document.querySelectorAll('.tabcontent');
    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            contents.forEach(c => c.classList.remove('active'));
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });
    // Activate first tab by default
    document.querySelector('.tablink').click();

    // Update snippet on input change
    const form = document.getElementById('configForm');
    function updateSnippet() {
        const data = new FormData(form);
        const autoOpen = data.get('auto_open') ? 'true' : 'false';
        const snippet = `<script src="symplissime-widget.js"></script>\n` +
            `<div class="symplissime-chat-widget" data-api-endpoint="${data.get('api_endpoint')}" data-workspace="${data.get('workspace')}" data-title="${data.get('title')}" data-auto-open="${autoOpen}" data-position="${data.get('position')}" data-theme="${data.get('theme')}"></div>`;
        document.getElementById('snippet').value = snippet;
    }
    form.addEventListener('input', updateSnippet);

    document.getElementById('copySnippet').addEventListener('click', () => {
        const text = document.getElementById('snippet').value;
        navigator.clipboard.writeText(text).then(() => {
            alert('Snippet copié !');
        });
    });
</script>
</body>
</html>
