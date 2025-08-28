<?php
function renderSnippet(array $config): string {
    $welcome = str_replace("\n", '&#10;', $config['greetings']['welcome_message']);
    $welcome = htmlspecialchars($welcome, ENT_QUOTES);
    $quick = str_replace("\n", '|', $config['attributes']['quick_messages']);
    $quick = htmlspecialchars($quick, ENT_QUOTES);
    $api = htmlspecialchars($config['attributes']['api_endpoint'], ENT_QUOTES);
    $workspace = htmlspecialchars($config['attributes']['workspace'], ENT_QUOTES);
    $title = htmlspecialchars($config['attributes']['title'], ENT_QUOTES);
    $greetingMode = htmlspecialchars($config['greetings']['display_mode'], ENT_QUOTES);
    $greetingDelay = htmlspecialchars($config['greetings']['display_delay'], ENT_QUOTES);
    $autoOpen = $config['attributes']['auto_open'] ? 'true' : 'false';
    $position = htmlspecialchars($config['attributes']['position'], ENT_QUOTES);
    $theme = htmlspecialchars($config['attributes']['theme'], ENT_QUOTES);
    $accentColor = htmlspecialchars($config['attributes']['accent_color'], ENT_QUOTES);
    $font = htmlspecialchars($config['attributes']['font_family'], ENT_QUOTES);
    $displayName = htmlspecialchars($config['general']['display_name'], ENT_QUOTES);
    $profilePicture = htmlspecialchars($config['general']['profile_picture'], ENT_QUOTES);
    $bubbleIcon = htmlspecialchars($config['general']['bubble_icon'], ENT_QUOTES);
    $bubblePosition = htmlspecialchars($config['general']['bubble_position'], ENT_QUOTES);
    $sendHistoryEmail = $config['general']['send_history_email'] ? 'true' : 'false';
    $ownerEmail = htmlspecialchars($config['general']['owner_email'], ENT_QUOTES);
    $footerEnabled = $config['general']['footer_enabled'] ? 'true' : 'false';
    $footerText = htmlspecialchars($config['general']['footer_text'], ENT_QUOTES);
    $language = htmlspecialchars($config['general']['language'], ENT_QUOTES);
    $timeZone = htmlspecialchars($config['general']['time_zone'], ENT_QUOTES);
    return <<<HTML
<script src="symplissime-widget.js"></script>
<div class="symplissime-chat-widget"
     data-api-endpoint="$api"
     data-workspace="$workspace"
     data-title="$title"
     data-welcome-message="$welcome"
     data-quick-messages="$quick"
     data-greeting-mode="$greetingMode"
     data-greeting-delay="$greetingDelay"
     data-auto-open="$autoOpen"
     data-position="$position"
     data-theme="$theme"
     data-accent-color="$accentColor"
     data-font="$font"
     data-display-name="$displayName"
     data-profile-picture="$profilePicture"
     data-bubble-icon="$bubbleIcon"
     data-bubble-position="$bubblePosition"
     data-send-history-email="$sendHistoryEmail"
     data-owner-email="$ownerEmail"
     data-footer-enabled="$footerEnabled"
     data-footer-text="$footerText"
     data-language="$language"
     data-time-zone="$timeZone"
></div>
HTML;
}
?>
