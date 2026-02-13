<?php
/**
 * SMTP Configuration for Comerzio Contact Form
 * 
 * IMPORTANT: Copy this file as 'config.php' and fill in your actual credentials.
 * The config.php file is gitignored and must be created manually on the server.
 * 
 * On Hostinger, place config.php in the same directory as contact.php (dist/)
 */

return [
    'smtp_host' => 'authsmtp.securemail.pro',
    'smtp_port' => 465,
    'smtp_user' => 'sales@comerzio.ch',
    'smtp_password' => 'YOUR_PASSWORD_HERE',
    'email_from' => 'sales@comerzio.ch',
    'email_to' => 'info@comerzio.ch',
];
