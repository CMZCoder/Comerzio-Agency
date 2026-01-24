
import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// ======== SECURITY: Rate Limiting ========
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5; // Max 5 contact requests per minute per IP

const rateLimit = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, { count: 1, firstRequest: now });
        return next();
    }
    
    const record = rateLimitMap.get(ip);
    
    // Reset window if expired
    if (now - record.firstRequest > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(ip, { count: 1, firstRequest: now });
        return next();
    }
    
    // Check limit
    if (record.count >= MAX_REQUESTS) {
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    
    record.count++;
    next();
};

// Clean up old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitMap.entries()) {
        if (now - record.firstRequest > RATE_LIMIT_WINDOW * 2) {
            rateLimitMap.delete(ip);
        }
    }
}, RATE_LIMIT_WINDOW);

// ======== SECURITY: Input Sanitization ========
const sanitizeInput = (str) => {
    if (typeof str !== 'string') return '';
    return str
        .replace(/[<>]/g, '') // Remove HTML brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim()
        .slice(0, 5000); // Limit length
};

// Middleware
app.use(cors({
    origin: isProduction ? ['https://agency.commerzio.online', 'https://commerzio.online'] : true,
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json({ limit: '10kb' })); // Limit payload size

// Debug endpoint at root before anything else
app.get('/test-server', (req, res) => {
    res.type('text/plain').send('Express server is running! If you see this, the server works.');
});

// 1. Health Check (Critical for deployment troubleshooting)
// If this returns 200, the server IS running.
app.get('/health', (req, res) => {
    res.status(200).send('OK: Server is healthy');
});

// Override Hostinger's restrictive CSP - allow necessary features
app.use((req, res, next) => {
    const connectSrc = isProduction
        ? "connect-src 'self' https:;"
        : "connect-src 'self' https: http://localhost:* ws://localhost:*;";

    res.setHeader(
        'Content-Security-Policy',
        `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:; ${connectSrc}`
    );
    next();
});

// Validation helpers
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone) => /^[\d+() -]{7,}$/.test(phone); // Basic phone validation

// Transporter configuration - only if SMTP vars exist
let transporter = null;
try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_PORT == 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        // Verify connection - but don't let it crash the server
        transporter.verify(function (error) {
            if (error) {
                console.log("SMTP Connection Error:", error.message);
            } else {
                console.log("SMTP ready to send emails");
            }
        });
    } else {
        console.log("SMTP not configured - email sending disabled");
    }
} catch (err) {
    console.log("SMTP setup error (non-fatal):", err.message);
}

app.post('/api/contact', rateLimit, async (req, res) => {
    // Sanitize all inputs
    const name = sanitizeInput(req.body.name);
    const email = sanitizeInput(req.body.email);
    const phone = sanitizeInput(req.body.phone);
    const message = sanitizeInput(req.body.message);

    // Check if email sending is configured
    if (!transporter) {
        return res.status(503).json({ error: 'Email service is not configured. Please try again later.' });
    }

    // Server-side validation
    if (!name || name.length < 2 || /[\d!@#$%^&*(),.?":{}|<>]/.test(name)) {
        return res.status(400).json({ error: 'Invalid name. Name is required and must not contain numbers or symbols.' });
    }
    if (!email || !isValidEmail(email)) {
        return res.status(400).json({ error: 'Invalid email address.' });
    }
    if (phone && !isValidPhone(phone)) {
        return res.status(400).json({ error: 'Invalid phone number.' });
    }
    if (!message || message.length < 20) {
        return res.status(400).json({ error: 'Message is too short. Minimum 20 characters required.' });
    }
    if (message.length > 5000) {
        return res.status(400).json({ error: 'Message is too long. Maximum 5000 characters allowed.' });
    }

    // Additional spam protection - check for common spam patterns
    const spamPatterns = [/\b(viagra|casino|lottery|winner|prize)\b/i, /<script/i, /http[s]?:\/\/[^\s]+\.(ru|cn|tk)/i];
    if (spamPatterns.some(pattern => pattern.test(message))) {
        return res.status(400).json({ error: 'Message contains prohibited content.' });
    }

    try {
        // 1. Send Email to Agency
        await transporter.sendMail({
            from: `"${name}" <${process.env.EMAIL_FROM}>`, // Using authenticated sender to avoid spam blocking
            to: process.env.SMTP_USER, // The admin email
            replyTo: email, // Reply to the customer
            subject: `🚀 New Contact Request from ${name}`,
            text: `
New Contact Request
==================

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}

Message:
${message}
            `,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: linear-gradient(135deg, #12121a 0%, #1a1a2e 100%); border-radius: 24px; overflow: hidden; box-shadow: 0 25px 80px rgba(0,0,0,0.5);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #3B82F6 0%, #1d4ed8 100%); padding: 32px 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 2px;">COMMERZIO</h1>
                            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 14px; letter-spacing: 1px;">NEW CONTACT REQUEST</p>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <!-- Contact Info Cards -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                                <tr>
                                    <td style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 12px; padding: 16px 20px; margin-bottom: 12px;">
                                        <p style="margin: 0 0 4px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Name</p>
                                        <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 600;">${name}</p>
                                    </td>
                                </tr>
                            </table>
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                                <tr>
                                    <td style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 12px; padding: 16px 20px;">
                                        <p style="margin: 0 0 4px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Email</p>
                                        <a href="mailto:${email}" style="color: #3B82F6; font-size: 16px; text-decoration: none;">${email}</a>
                                    </td>
                                </tr>
                            </table>
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                                <tr>
                                    <td style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 12px; padding: 16px 20px;">
                                        <p style="margin: 0 0 4px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Phone</p>
                                        <p style="margin: 0; color: #ffffff; font-size: 16px;">${phone || 'Not provided'}</p>
                                    </td>
                                </tr>
                            </table>
                            <!-- Message -->
                            <div style="background: rgba(212, 175, 55, 0.05); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 12px; padding: 24px;">
                                <p style="margin: 0 0 12px; color: #D4AF37; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Message</p>
                                <p style="margin: 0; color: #e5e7eb; font-size: 15px; line-height: 1.7;">${message.replace(/\n/g, '<br>')}</p>
                            </div>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background: rgba(0,0,0,0.3); padding: 24px 40px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
                            <p style="margin: 0; color: #6b7280; font-size: 13px;">Reply directly to this email to respond to ${name}</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `,
        });

        // 2. Send Confirmation to User
        await transporter.sendMail({
            from: `"Commerzio Agentur" <${process.env.EMAIL_FROM}>`,
            to: email,
            replyTo: 'sales@commerzio.online',
            subject: '✨ We received your message - Commerzio',
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: linear-gradient(135deg, #12121a 0%, #1a1a2e 100%); border-radius: 24px; overflow: hidden; box-shadow: 0 25px 80px rgba(0,0,0,0.5);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #D4AF37 0%, #b8962e 100%); padding: 40px; text-align: center;">
                            <h1 style="margin: 0; color: #0a0a0f; font-size: 28px; font-weight: 700; letter-spacing: 2px;">COMMERZIO</h1>
                            <p style="margin: 12px 0 0; color: rgba(10,10,15,0.8); font-size: 14px;">Premium Web Agency & AI Consultancy</p>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 48px 40px;">
                            <h2 style="margin: 0 0 16px; color: #ffffff; font-size: 24px; font-weight: 600;">Thank you, ${name}!</h2>
                            <p style="margin: 0 0 24px; color: #a1a1aa; font-size: 16px; line-height: 1.7;">
                                We've received your message and appreciate you reaching out to us. Our team is reviewing your inquiry and will get back to you within <strong style="color: #ffffff;">24-48 hours</strong>.
                            </p>
                            
                            <!-- Divider -->
                            <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent); margin: 32px 0;"></div>
                            
                            <!-- Message Copy -->
                            <p style="margin: 0 0 12px; color: #D4AF37; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your Message</p>
                            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px;">
                                <p style="margin: 0; color: #d1d5db; font-size: 14px; line-height: 1.7; font-style: italic;">"${message.replace(/\n/g, '<br>')}"</p>
                            </div>
                            
                            <!-- Divider -->
                            <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent); margin: 32px 0;"></div>
                            
                            <!-- What's Next -->
                            <h3 style="margin: 0 0 16px; color: #ffffff; font-size: 16px; font-weight: 600;">What happens next?</h3>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding: 12px 0;">
                                        <table cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="width: 32px; height: 32px; background: rgba(59, 130, 246, 0.2); border-radius: 50%; text-align: center; vertical-align: middle; color: #3B82F6; font-weight: 700; font-size: 14px;">1</td>
                                                <td style="padding-left: 16px; color: #a1a1aa; font-size: 14px;">Our team reviews your inquiry</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0;">
                                        <table cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="width: 32px; height: 32px; background: rgba(59, 130, 246, 0.2); border-radius: 50%; text-align: center; vertical-align: middle; color: #3B82F6; font-weight: 700; font-size: 14px;">2</td>
                                                <td style="padding-left: 16px; color: #a1a1aa; font-size: 14px;">We prepare a tailored response</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0;">
                                        <table cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="width: 32px; height: 32px; background: rgba(212, 175, 55, 0.2); border-radius: 50%; text-align: center; vertical-align: middle; color: #D4AF37; font-weight: 700; font-size: 14px;">3</td>
                                                <td style="padding-left: 16px; color: #a1a1aa; font-size: 14px;">You'll receive a personalized reply</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background: rgba(0,0,0,0.3); padding: 32px 40px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
                            <p style="margin: 0 0 16px; color: #ffffff; font-size: 14px; font-weight: 600;">Need urgent assistance?</p>
                            <a href="mailto:sales@commerzio.online" style="display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600;">Reply to this email</a>
                            <p style="margin: 24px 0 0; color: #6b7280; font-size: 12px;">
                                <a href="https://agency.commerzio.online" style="color: #6b7280; text-decoration: none;">agency.commerzio.online</a>
                            </p>
                        </td>
                    </tr>
                </table>
                <!-- Unsubscribe -->
                <p style="margin: 24px 0 0; color: #4b5563; font-size: 11px; text-align: center;">
                    This is an automated message from Commerzio. Please do not reply to this email address directly.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
            `,
        });

        res.status(200).json({ success: true, message: 'Message sent successfully!' });

    } catch (error) {
        console.error('Email sending failed:', error);
        res.status(500).json({ error: 'Failed to send message. Please try again later.' });
    }
});


const startServer = async () => {
    if (!isProduction) {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa'
        });

        app.use(vite.middlewares);

        app.use('*', async (req, res, next) => {
            const url = req.originalUrl;
            try {
                const template = await fs.readFile(join(__dirname, 'index.html'), 'utf-8');
                const html = await vite.transformIndexHtml(url, template);
                res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
            } catch (error) {
                vite.ssrFixStacktrace(error);
                next(error);
            }
        });
    } else {
        // Serve static files from the dist directory
        const distPath = join(__dirname, 'dist');
        console.log(`Serving static files from: ${distPath}`);
        app.use(express.static(distPath));

        // Handle React routing, return all requests to React app
        app.get('*', (req, res) => {
            console.log(`Serving ${req.path}`);

            // If the request is for an asset (js, css, png, etc.) that wasn't found in dist, return 404
            if (req.path.includes('.') && !req.path.endsWith('.html')) {
                console.log(`Asset not found: ${req.path}`);
                return res.status(404).send('File not found');
            }

            // Serve index.html for all other routes (SPA)
            const indexPath = join(__dirname, 'dist', 'index.html');

            try {
                res.sendFile(indexPath, (err) => {
                    if (err) {
                        console.error(`Error serving index.html: ${err.message}`);
                        res.status(500).send('<h1>Server Error</h1><p>Could not load the application.</p>');
                    }
                });
            } catch (error) {
                console.error(`Critical error: ${error.message}`);
                res.status(500).send('<h1>Server Error</h1>');
            }
        });
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Node version: ${process.version}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
};

startServer();
