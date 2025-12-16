<?php
// Enable error reporting for debugging (disable in production)
error_reporting(0);

// Set headers for JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate required fields
if (empty($data['name']) || empty($data['email']) || empty($data['message'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Name, email, and message are required.']);
    exit();
}

// Sanitize input
$name = htmlspecialchars(strip_tags(trim($data['name'])));
$email = filter_var(trim($data['email']), FILTER_SANITIZE_EMAIL);
$phone = isset($data['phone']) ? htmlspecialchars(strip_tags(trim($data['phone']))) : 'Not provided';
$message = htmlspecialchars(strip_tags(trim($data['message'])));

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address.']);
    exit();
}

// Validate message length
if (strlen($message) < 20) {
    http_response_code(400);
    echo json_encode(['error' => 'Message is too short. Minimum 20 characters required.']);
    exit();
}

// Email configuration
$to = 'info@commerzio.online';
$subject = "New Contact Request from $name";

// HTML email body
$htmlBody = "
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        h2 { color: #333; }
        .field { margin-bottom: 10px; }
        .label { font-weight: bold; color: #555; }
        .message { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px; }
    </style>
</head>
<body>
    <div class='container'>
        <h2>New Contact Request</h2>
        <div class='field'><span class='label'>Name:</span> $name</div>
        <div class='field'><span class='label'>Email:</span> $email</div>
        <div class='field'><span class='label'>Phone:</span> $phone</div>
        <div class='message'>
            <span class='label'>Message:</span><br><br>
            " . nl2br($message) . "
        </div>
    </div>
</body>
</html>
";

// Email headers
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: Commerzio Website <noreply@commerzio.online>\r\n";
$headers .= "Reply-To: sales@commerzio.online\r\n";

// Send main email
$mailSent = mail($to, $subject, $htmlBody, $headers);

if ($mailSent) {
    // Send confirmation email to user
    $confirmSubject = "We received your message - Commerzio";
    $confirmBody = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
            h2 { color: #333; }
            .message-copy { background: #fff; padding: 15px; border-left: 4px solid #007bff; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class='container'>
            <h2>Thank you for contacting Commerzio</h2>
            <p>Hi $name,</p>
            <p>We have received your message and our team will get back to you soon.</p>
            <p><strong>Your message:</strong></p>
            <div class='message-copy'>
                " . nl2br($message) . "
            </div>
            <p>Best regards,<br>The Commerzio Team</p>
        </div>
    </body>
    </html>
    ";

    $confirmHeaders = "MIME-Version: 1.0\r\n";
    $confirmHeaders .= "Content-Type: text/html; charset=UTF-8\r\n";
    $confirmHeaders .= "From: Commerzio <noreply@commerzio.online>\r\n";

    mail($email, $confirmSubject, $confirmBody, $confirmHeaders);

    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Message sent successfully!']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send message. Please try again later.']);
}
?>