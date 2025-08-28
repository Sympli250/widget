<?php
header('Content-Type: application/json');

$input = file_get_contents('php://input');
$data = json_decode($input, true);
if (!$data || empty($data['owner'])) {
    http_response_code(400);
    echo json_encode(['error' => 'missing owner email']);
    exit;
}

$to = $data['owner'];
$subject = $data['subject'] ?? 'Chat Conversation';
$body = "Conversation from " . ($data['url'] ?? '') . "\n\n";
if (!empty($data['messages']) && is_array($data['messages'])) {
    foreach ($data['messages'] as $msg) {
        $from = $msg['from'] ?? '';
        $message = $msg['message'] ?? '';
        $body .= "[$from] $message\n";
    }
}
$headers = "Content-Type: text/plain; charset=UTF-8\r\n";
if (!empty($data['cc'])) {
    $headers .= 'Cc: ' . implode(',', (array)$data['cc']) . "\r\n";
}
if (!empty($data['bcc'])) {
    $headers .= 'Bcc: ' . implode(',', (array)$data['bcc']) . "\r\n";
}
$sent = @mail($to, $subject, $body, $headers);
if ($sent) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'send failed']);
}
?>
