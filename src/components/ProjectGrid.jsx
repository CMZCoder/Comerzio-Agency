import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import AutoScrollGallery from './AutoScrollGallery';

const projects = [
    {
        id: 'comerzio',
        title: 'Comerzio - Services',
        descriptionKey: 'comerzio_desc',
        url: 'https://comerzio.ch',
        images: ['/assets/Comerzio_home.png', '/assets/Comerzio_home_2.png', '/assets/Comerzio_preview2.png'],
        stackKeys: ['React', 'Node.js', 'PostgreSQL', 'tech_escrow', 'tech_geo'],
        color: '#3B82F6'
    },
    {
        id: 'beygat',
        title: 'Le Cronache di Beygat',
        descriptionKey: 'beygat_desc',
        url: 'https://beygat.it',
        images: ['/assets/beygat.png', '/assets/beygat2.png'],
        stackKeys: ['Next.js', 'Tailwind', 'Framer Motion', 'tech_editorial'],
        color: '#D4AF37'
    },
    {
        id: 'officina',
        title: 'Officina del Gusto',
        descriptionKey: 'officina_desc',
        url: 'https://officinadelgusto.ro',
        images: ['/assets/Officinadelgusto.png', '/assets/Officinadelgusto2.png', '/assets/OOfficinadelgusto3.png'],
        stackKeys: ['React', 'Firebase', 'Stripe', 'tech_ordering'],
        color: '#ff6b6b'
    }
];

const ProjectCard = ({ project, index }) => {
    const { t } = useTranslation();
    const ref = useRef(null);
    const MotionDiv = motion.div;

    return (
        <div className="project-card-wrapper">
            <MotionDiv
                ref={ref}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="project-card"
            >
                <div className="project-image-container">
                    <AutoScrollGallery images={project.images} title={project.title} />
                </div>


                <div className="project-info">
                    <div>
                        <h3 className="project-title">{project.title}</h3>
                        <p style={{ color: '#ccc', marginBottom: '1rem', fontSize: '0.95rem', lineHeight: '1.4', maxWidth: '600px' }}>
                            {t(project.descriptionKey)}
                        </p>
                        <div className="tech-stack">
                            {project.stackKeys.map(techKey => (
                                <span key={techKey} className="tech-tag">
                                    {/* If key starts with 'tech_', translate it, otherwise leave as is */}
                                    {techKey.startsWith('tech_') ? t(techKey) : techKey}
                                </span>
                            ))}
                        </div>
                    </div>

                    {project.id !== 'comerzio' && (
                        <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-visit"
                            style={{ padding: '0.75rem 1.5rem', fontSize: '0.8rem' }}
                        >
                            <span>{t('visit')}</span>
                            <ExternalLink size={16} />
                        </a>
                    )}
                </div>
            </MotionDiv>
        </div>
    );
};

const ProjectGrid = () => {
    const { t } = useTranslation();

    return (
        <section className="projects-section">
            <div className="container">
                <h2 className="section-title">
                    <span className="animated-gradient-title">{t('projects_title')}</span>
                </h2>

                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {projects.map((project, index) => (
                        <ProjectCard key={project.id} project={project} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProjectGrid;
