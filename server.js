
import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
