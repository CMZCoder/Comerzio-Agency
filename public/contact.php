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

// Load SMTP config
$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'Server configuration missing. Please contact the administrator.']);
    exit();
}
$config = require $configFile;

// Load PHPMailer via Composer autoload
// On Hostinger, vendor/ is at the repo root (one level above dist/)
$autoloadPaths = [
    __DIR__ . '/vendor/autoload.php',
    __DIR__ . '/../vendor/autoload.php',
    dirname(__DIR__) . '/vendor/autoload.php',
];

$autoloaded = false;
foreach ($autoloadPaths as $path) {
    if (file_exists($path)) {
        require_once $path;
        $autoloaded = true;
        break;
    }
}

if (!$autoloaded) {
    http_response_code(500);
    echo json_encode(['error' => 'PHPMailer not installed. Run: composer require phpmailer/phpmailer']);
    exit();
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

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

// ======== SEND NOTIFICATION EMAIL TO ADMIN ========
try {
    $mail = new PHPMailer(true);

    // SMTP Configuration
    $mail->isSMTP();
    $mail->Host = $config['smtp_host'];
    $mail->SMTPAuth = true;
    $mail->Username = $config['smtp_user'];
    $mail->Password = $config['smtp_password'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port = $config['smtp_port'];

    // Email settings
    $mail->setFrom($config['email_from'], 'Comerzio Website');
    $mail->addAddress($config['email_to']);
    $mail->addReplyTo($email, $name);

    $mail->isHTML(true);
    $mail->Subject = "New Contact Request from $name";
    $mail->Body = "
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
    </html>";

    $mail->send();

    // ======== SEND CONFIRMATION EMAIL TO USER ========
    $confirm = new PHPMailer(true);

    $confirm->isSMTP();
    $confirm->Host = $config['smtp_host'];
    $confirm->SMTPAuth = true;
    $confirm->Username = $config['smtp_user'];
    $confirm->Password = $config['smtp_password'];
    $confirm->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $confirm->Port = $config['smtp_port'];

    $confirm->setFrom($config['email_from'], 'Comerzio');
    $confirm->addAddress($email, $name);

    $confirm->isHTML(true);
    $confirm->Subject = "We received your message - Comerzio";
    $confirm->Body = "
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
            <h2>Thank you for contacting Comerzio</h2>
            <p>Hi $name,</p>
            <p>We have received your message and our team will get back to you soon.</p>
            <p><strong>Your message:</strong></p>
            <div class='message-copy'>
                " . nl2br($message) . "
            </div>
            <p>Best regards,<br>The Comerzio Team</p>
        </div>
    </body>
    </html>";

    $confirm->send();

    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Message sent successfully!']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send message. Please try again later.', 'debug' => $mail->ErrorInfo]);
}
?>