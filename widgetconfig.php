<?php
$configFile = __DIR__ . '/widget_config.json';
$defaultConfig = [
    'themes' => ['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff'],
    'attributes' => [
        'workspace' => '',
        'title' => '',
        'auto_open' => false,
        'position' => 'bottom-right'
    ]
];

$config = $defaultConfig;
if (file_exists($configFile)) {
    $json = json_decode(file_get_contents($configFile), true);
    if (is_array($json)) {
        $config = array_replace_recursive($config, $json);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $themes = $_POST['themes'] ?? [];
    for ($i = 0; $i < 5; $i++) {
        $config['themes'][$i] = $themes[$i] ?? $config['themes'][$i];
    }

    $config['attributes']['workspace'] = $_POST['workspace'] ?? '';
    $config['attributes']['title'] = $_POST['title'] ?? '';
    $config['attributes']['auto_open'] = isset($_POST['auto_open']);
    $config['attributes']['position'] = $_POST['position'] ?? 'bottom-right';

    file_put_contents($configFile, json_encode($config, JSON_PRETTY_PRINT));
}

$snippet = '<script src="symplissime-widget.js" '
    . 'data-workspace="' . htmlspecialchars($config['attributes']['workspace']) . '" '
    . 'data-title="' . htmlspecialchars($config['attributes']['title']) . '" '
    . 'data-auto-open="' . ($config['attributes']['auto_open'] ? '1' : '0') . '" '
    . 'data-position="' . htmlspecialchars($config['attributes']['position']) . '"></' . 'script>';
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
        <?php for ($i = 0; $i < 5; $i++): ?>
            <div class="theme-input">
                <label>Couleur <?php echo $i + 1; ?>:
                    <input type="color" name="themes[]" value="<?php echo htmlspecialchars($config['themes'][$i]); ?>">
                </label>
            </div>
        <?php endfor; ?>
    </div>

    <div id="attributes" class="tabcontent">
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

    <div id="code" class="tabcontent">
        <textarea readonly id="snippet"><?php echo htmlspecialchars($snippet); ?></textarea>
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
        const autoOpen = data.get('auto_open') ? '1' : '0';
        const snippet = `<script src="symplissime-widget.js" data-workspace="${data.get('workspace')}" data-title="${data.get('title')}" data-auto-open="${autoOpen}" data-position="${data.get('position')}"></` + 'script>';
        document.getElementById('snippet').value = snippet;
    }
    form.addEventListener('input', updateSnippet);
</script>
</body>
</html>
