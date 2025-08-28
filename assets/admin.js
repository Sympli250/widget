    (async function() {
        const THEMES = await fetch('widget-themes.json').then(r => r.json());
        window.WidgetConfig = { getThemes: () => THEMES };
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

      function updateSnippet() {
        const data = new FormData(form);
        SymplissimeWidget.fetch("generate_snippet.php", { method: "POST", body: data })
            .then(r => r.text())
            .then(text => { document.getElementById("snippet").value = text; });
      }

      function renderPreview() {
        const data = new FormData(form);
        const preview = document.getElementById("previewArea");
        preview.innerHTML = "";
        const widget = document.createElement("div");
        widget.className = "symplissime-chat-widget";
        widget.dataset.apiEndpoint = data.get("api_endpoint");
        widget.dataset.workspace = data.get("workspace");
        widget.dataset.title = data.get("title");
        widget.dataset.welcomeMessage = data.get("welcome_message");
        widget.dataset.quickMessages = data.get("quick_messages").split("\n").map(m => m.trim()).filter(Boolean).join("|");
        widget.dataset.greetingMode = data.get("display_mode");
        widget.dataset.greetingDelay = data.get("display_delay");
        widget.dataset.autoOpen = data.get("auto_open") ? "true" : "false";
        widget.dataset.position = data.get("position");
        widget.dataset.theme = data.get("theme");
        widget.dataset.accentColor = data.get("accent_color");
        widget.dataset.font = data.get("font_family");
        widget.dataset.displayName = data.get("display_name");
        widget.dataset.profilePicture = data.get("profile_picture");
        widget.dataset.bubbleIcon = data.get("bubble_icon");
        widget.dataset.bubblePosition = data.get("bubble_position");
        widget.dataset.footerEnabled = data.get("footer_enabled") ? "true" : "false";
        widget.dataset.footerText = data.get("footer_text");
        widget.dataset.language = data.get("language");
        widget.dataset.timeZone = data.get("time_zone");
        widget.dataset.emailEnabled = data.get("email_enabled") ? "true" : "false";
        widget.dataset.emailOwner = data.get("email_owner");
        widget.dataset.emailCc = data.get("email_cc");
        widget.dataset.emailBcc = data.get("email_bcc");
        widget.dataset.emailSubject = data.get("email_subject");
        widget.dataset.emailBodyFormat = data.get("email_body_format");
        widget.dataset.emailAttach = data.get("email_attach");
        widget.dataset.emailTriggerClose = data.get("email_trigger_on_close") ? "true" : "false";
        widget.dataset.emailInactivity = data.get("email_inactivity_minutes");
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
    })();

