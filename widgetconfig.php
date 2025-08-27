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
        'quick_messages' => []
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
      $quick = $_POST['quick_messages'] ?? [];
      $quick = array_slice(array_filter(array_map('trim', $quick)), 0, 6);
      $config['attributes']['quick_messages'] = $quick;

      file_put_contents($configFile, json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
  }
$snippet = '<script src="symplissime-widget.js"></script>' . "\n";
$snippet .= '<div class="symplissime-chat-widget" '
    . 'data-api-endpoint="' . htmlspecialchars($config['attributes']['api_endpoint']) . '" '
    . 'data-workspace="' . htmlspecialchars($config['attributes']['workspace']) . '" '
    . 'data-title="' . htmlspecialchars($config['attributes']['title']) . '" '
    . 'data-auto-open="' . ($config['attributes']['auto_open'] ? 'true' : 'false') . '" '
    . 'data-position="' . htmlspecialchars($config['attributes']['position']) . '" '
    . 'data-theme="' . htmlspecialchars($config['attributes']['theme']) . '" '
    . 'data-quick-messages="' . htmlspecialchars(implode('|', $config['attributes']['quick_messages'])) . '"></div>';
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
          .quick-reply-item {
              display: flex;
              gap: 10px;
              margin-bottom: 5px;
          }
          .quick-reply-item input {
              flex: 1;
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
    </style>
</head>
<body>
<div class="container">
<form method="post" id="configForm">
    <div class="tabs">
        <button type="button" class="tablink active" data-tab="themes">Thèmes</button>
        <button type="button" class="tablink" data-tab="attributes">Attributs</button>
        <button type="button" class="tablink" data-tab="greetings">Greetings</button>
        <button type="button" class="tablink" data-tab="code">Code</button>
        <button type="button" class="tablink" data-tab="preview">Preview</button>
    </div>

    <div id="themes" class="tabcontent">
        <?php foreach ($themes as $key => $theme): ?>
            <fieldset>
                <legend><?php echo htmlspecialchars($theme['name']); ?></legend>
                <div class="theme-inputs">
                <?php foreach ($theme as $prop => $val): if ($prop === 'name') continue; ?>
                    <label>
                        <span><?php echo $prop; ?></span>
                        <?php if (strpos($val, '#') === 0): ?>
                            <input type="color" name="themes[<?php echo $key; ?>][<?php echo $prop; ?>]" value="<?php echo htmlspecialchars($val); ?>">
                        <?php else: ?>
                            <input type="text" name="themes[<?php echo $key; ?>][<?php echo $prop; ?>]" value="<?php echo htmlspecialchars($val); ?>">
                        <?php endif; ?>
                    </label>
                <?php endforeach; ?>
                </div>
            </fieldset>
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

      <div id="greetings" class="tabcontent">
          <fieldset>
              <legend>Quick Replies (max 6)</legend>
              <div id="quickRepliesContainer">
                  <?php foreach ($config['attributes']['quick_messages'] as $msg): ?>
                      <div class="quick-reply-item">
                          <input type="text" name="quick_messages[]" value="<?php echo htmlspecialchars($msg); ?>">
                          <button type="button" class="removeQuickReply">Supprimer</button>
                      </div>
                  <?php endforeach; ?>
              </div>
              <button type="button" id="addQuickReply">Ajouter une réponse rapide</button>
          </fieldset>
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
      const quickContainer = document.getElementById('quickRepliesContainer');
      const addQuick = document.getElementById('addQuickReply');

      addQuick.addEventListener('click', () => {
          if (quickContainer.children.length >= 6) return;
          const div = document.createElement('div');
          div.className = 'quick-reply-item';
          div.innerHTML = '<input type="text" name="quick_messages[]"><button type="button" class="removeQuickReply">Supprimer</button>';
          quickContainer.appendChild(div);
          updateAll();
      });

      quickContainer.addEventListener('click', (e) => {
          if (e.target.classList.contains('removeQuickReply')) {
              e.target.parentElement.remove();
              updateAll();
          }
      });

      function buildSnippet(data) {
          const autoOpen = data.get('auto_open') ? 'true' : 'false';
          const quick = data.getAll('quick_messages[]').map(q => q.trim()).filter(Boolean).join('|');
          return '<script src="symplissime-widget.js"><\/script>\n' +
              `<div class="symplissime-chat-widget" data-api-endpoint="${data.get('api_endpoint')}" data-workspace="${data.get('workspace')}" data-title="${data.get('title')}" data-auto-open="${autoOpen}" data-position="${data.get('position')}" data-theme="${data.get('theme')}" data-quick-messages="${quick}"></div>`;
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
        widget.dataset.autoOpen = data.get('auto_open') ? 'true' : 'false';
        widget.dataset.position = data.get('position');
          widget.dataset.theme = data.get('theme');
          widget.dataset.quickMessages = data.getAll('quick_messages[]').map(q => q.trim()).filter(Boolean).join('|');
          preview.appendChild(widget);
          if (typeof initializeWidgets === 'function') {
              initializeWidgets();
          }
      }

    function updateAll() {
        updateSnippet();
        renderPreview();
    }

    form.addEventListener('input', updateAll);
    updateAll();

    document.getElementById('copySnippet').addEventListener('click', () => {
        const text = document.getElementById('snippet').value;
        navigator.clipboard.writeText(text).then(() => {
            alert('Snippet copié !');
        });
    });
</script>
</body>
</html>
