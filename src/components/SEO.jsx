import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const SEO = () => {
    const { i18n } = useTranslation();

    // Default SEO values
    const title = "Comerzio Agentur | Premium Web Development & AI Solutions";
    const description = "Premium web development studio crafting high-end websites, AI-powered automation, and scalable digital solutions. Swiss quality, global reach.";
    const keywords = "web development, AI agents, premium websites, automation, digital transformation, react, node.js, comerzio";
    const url = "https://agency.comerzio.ch";
    const image = "https://agency.comerzio.ch/og-image.jpg";

    const currentLang = i18n.language || 'en';

    return (
        <Helmet>
            {/* Standard Metrics */}
            <html lang={currentLang} />
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content="Comerzio Agentur" />
            <link rel="canonical" href={url} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:locale" content={currentLang} />
            <meta property="og:site_name" content="Comerzio Agentur" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={url} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Viewport & Charset are in index.html, but can be reinforced */}
        </Helmet>
    );
};

export default SEO;
