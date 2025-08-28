<?php
require_once __DIR__ . '/snippet.php';

$config = [
    'attributes' => [
        'api_endpoint' => $_POST['api_endpoint'] ?? 'symplissime-widget-api.php',
        'workspace' => $_POST['workspace'] ?? '',
        'title' => $_POST['title'] ?? '',
        'auto_open' => isset($_POST['auto_open']),
        'position' => $_POST['position'] ?? 'bottom-right',
        'theme' => $_POST['theme'] ?? 'symplissime',
        'accent_color' => $_POST['accent_color'] ?? '#48bb78',
        'font_family' => $_POST['font_family'] ?? 'default',
        'quick_messages' => $_POST['quick_messages'] ?? '',
    ],
    'greetings' => [
        'welcome_message' => $_POST['welcome_message'] ?? '',
        'display_mode' => $_POST['display_mode'] ?? 'bubble_immediate',
        'display_delay' => isset($_POST['display_delay']) ? (int)$_POST['display_delay'] : 0,
    ],
    'general' => [
        'display_name' => trim(preg_replace('/\s+/', ' ', $_POST['display_name'] ?? '')),
        'profile_picture' => $_POST['profile_picture'] ?? '',
        'bubble_icon' => $_POST['bubble_icon'] ?? 'default_icon',
        'bubble_position' => $_POST['bubble_position'] ?? 'right',
        'send_history_email' => isset($_POST['send_history_email']),
        'owner_email' => $_POST['owner_email'] ?? '',
        'footer_enabled' => isset($_POST['footer_enabled']),
        'footer_text' => $_POST['footer_text'] ?? '',
        'language' => $_POST['language'] ?? 'fr',
        'time_zone' => $_POST['time_zone'] ?? 'Europe/Paris',
    ],
];

header('Content-Type: text/plain; charset=UTF-8');
echo renderSnippet($config);
