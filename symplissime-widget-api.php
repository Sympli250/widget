<?php
/**
 * Symplissime AI Widget API - Backend simplifié
 * Point d'entrée unique pour le widget de chat
 */

// Configuration
$BASE_URL = 'http://storage.symplissime.fr:3002';
$API_KEY = 'DV90GFR-8YR4RW2-G9BMCQ9-9X96PW5';
$DEFAULT_WORKSPACE = 'support-windows';

// Headers CORS et sécurité
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

// Gestion des requêtes OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Démarrage de session pour maintenir le contexte
session_start();

// Handler principal
if ($_POST['action'] === 'chat') {
    handleChatRequest();
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Action non supportée']);
}

function handleChatRequest() {
    global $BASE_URL, $API_KEY, $DEFAULT_WORKSPACE;
    
    $message = trim($_POST['message'] ?? '');
    $workspace = $_POST['workspace'] ?? $DEFAULT_WORKSPACE;
    
    // Validation
    if (empty($message)) {
        echo json_encode(['error' => 'Message vide']);
        return;
    }
    
    if (strlen($message) > 500) {
        echo json_encode(['error' => 'Message trop long (max 500 caractères)']);
        return;
    }
    
    // Session ID pour maintenir le contexte
    if (!isset($_SESSION['widget_session_id'])) {
        $_SESSION['widget_session_id'] = uniqid('widget_', true);
    }
    
    $sessionId = $_SESSION['widget_session_id'];
    
    // Préparer la requête vers l'API Symplissime
    $url = "$BASE_URL/api/v1/workspace/$workspace/chat";
    $postData = [
        'message' => $message,
        'mode' => 'chat',
        'sessionId' => $sessionId
    ];
    
    // Configuration cURL
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($postData),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $API_KEY,
            'Accept: application/json'
        ],
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_FOLLOWLOCATION => true
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    // Gestion des erreurs
    if ($error) {
        echo json_encode(['error' => 'Erreur de connexion: ' . $error]);
        return;
    }
    
    if ($httpCode !== 200) {
        echo json_encode(['error' => "Erreur serveur (HTTP $httpCode)"]);
        return;
    }
    
    // Traitement de la réponse
    $responseData = json_decode($response, true);
    
    if (!$responseData || json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode(['error' => 'Réponse invalide du serveur']);
        return;
    }
    
    // Extraction du message de réponse
    $assistantMessage = 
        $responseData['textResponse'] ?? 
        $responseData['response'] ?? 
        $responseData['message'] ?? 
        'Aucune réponse disponible';
    
    // Réponse finale
    echo json_encode([
        'success' => true,
        'message' => $assistantMessage,
        'sessionId' => $sessionId
    ]);
}
?>