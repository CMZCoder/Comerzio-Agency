
import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// 1. Health Check (Critical for deployment troubleshooting)
// If this returns 200, the server IS running.
app.get('/health', (req, res) => {
    res.status(200).send('OK: Server is healthy');
});

// Override Hostinger's restrictive CSP - allow necessary features
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:;"
    );
    next();
});

// Validation helpers
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone) => /^[\d\+\-\(\) ]{7,}$/.test(phone); // Basic phone validation

// Transporter configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log("SMTP Connection Error:", error);
    } else {
        console.log("Server is ready to take our messages");
    }
});

app.post('/api/contact', async (req, res) => {
    const { name, email, phone, message } = req.body;

    // Server-side validation
    if (!name || /[\d!@#$%^&*(),.?":{}|<>]/.test(name)) {
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

    try {
        // 1. Send Email to Agency
        await transporter.sendMail({
            from: `"${name}" <${process.env.EMAIL_FROM}>`, // Using authenticated sender to avoid spam blocking
            to: process.env.SMTP_USER, // The admin email
            replyTo: email, // Reply to the customer
            subject: `New Contact Request from ${name}`,
            text: `
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}

Message:
${message}
            `,
            html: `
<h3>New Contact Request</h3>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
<br/>
<p><strong>Message:</strong></p>
<p>${message.replace(/\n/g, '<br>')}</p>
            `,
        });

        // 2. Send Confirmation to User
        await transporter.sendMail({
            from: `"Commerzio Agentur" <${process.env.EMAIL_FROM}>`,
            to: email,
            replyTo: 'sales@commerzio.online',
            subject: 'We received your message!',
            html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee;">
    <h2 style="color: #333;">Thank you for contacting Commerzio Agentur</h2>
    <p style="color: #555;">Hi ${name},</p>
    <p style="color: #555;">We have received your message and wanted to let you know that our team will be in touch with you very soon.</p>
    <p style="color: #555;">Here is a copy of your message:</p>
    <blockquote style="background-color: #fff; padding: 15px; border-left: 4px solid #007bff; color: #666; font-style: italic;">
        ${message.replace(/\n/g, '<br>')}
    </blockquote>
    <br/>
    <p style="color: #555;">If you have any urgent inquiries, feel free to reply directly to this email.</p>
    <br/>
    <p style="color: #333; font-weight: bold;">Best regards,</p>
    <p style="color: #007bff; font-weight: bold;">Commerzio Agentur Team</p>
    <p style="font-size: 12px; color: #999;">
        <a href="mailto:sales@commerzio.online" style="color: #007bff; text-decoration: none;">sales@commerzio.online</a> | 
        <a href="https://agency.commerzio.online" style="color: #007bff; text-decoration: none;">agency.commerzio.online</a>
    </p>
</div>
            `,
        });

        res.status(200).json({ success: true, message: 'Message sent successfully!' });

    } catch (error) {
        console.error('Email sending failed:', error);
        res.status(500).json({ error: 'Failed to send message. Please try again later.' });
    }
});


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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Node version: ${process.version}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
