<?php
// Minimal example of exchanging Discord OAuth2 code for tokens in PHP.
// Ensure sessions are started and HTTPS is used in production.

session_start();

$input = json_decode(file_get_contents('php://input'), true);
$code = $input['code'] ?? null;
$verifier = $input['code_verifier'] ?? null;
$redirectUri = $input['redirect_uri'] ?? null;

if (!$code) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing code']);
    exit;
}

$postData = http_build_query([
    'client_id' => '<YOUR_CLIENT_ID>',
    'client_secret' => '<YOUR_CLIENT_SECRET>',
    'grant_type' => 'authorization_code',
    'code' => $code,
    'redirect_uri' => $redirectUri,
    'code_verifier' => $verifier,
]);

$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
        'content' => $postData,
    ],
]);

$tokenRes = file_get_contents('https://discord.com/api/oauth2/token', false, $context);
if ($tokenRes === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Token request failed']);
    exit;
}
$tokens = json_decode($tokenRes, true);

$opts = [
    'http' => [
        'header' => 'Authorization: Bearer ' . $tokens['access_token'],
    ],
];
$userRes = file_get_contents('https://discord.com/api/users/@me', false, stream_context_create($opts));
$user = json_decode($userRes, true);

// Store tokens securely on the server side.
$_SESSION['tokens'] = $tokens;

echo json_encode(['user' => $user, 'tokens' => ['access_token' => 'hidden']]);
