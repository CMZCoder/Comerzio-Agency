import React, { useEffect, useRef } from 'react';

const SpaceBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        let width = window.innerWidth;
        let height = window.innerHeight;

        const setSize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        setSize();
        window.addEventListener('resize', setSize);

        // Star properties - balanced visibility
        const numStars = 250;
        const stars = [];
        const speed = 0.25;
        const depth = 1800;

        // Initialize stars spread across the screen
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: (Math.random() - 0.5) * width * 3,
                y: (Math.random() - 0.5) * height * 3,
                z: Math.random() * depth,
                brightness: Math.random() * 0.5 + 0.5 // 0.5 to 1.0
            });
        }

        // Planet properties - 3D orbiting planets
        const planets = [
            {
                baseX: width * 0.15,
                baseY: height * 0.3,
                z: 800,
                radius: 40,
                color: '#2d3748',
                ringColor: 'rgba(100, 120, 150, 0.3)',
                orbitRadius: 30,
                orbitSpeed: 0.0003,
                angle: 0
            },
            {
                baseX: width * 0.85,
                baseY: height * 0.6,
                z: 600,
                radius: 25,
                color: '#1a365d',
                ringColor: null,
                orbitRadius: 20,
                orbitSpeed: 0.0005,
                angle: Math.PI
            },
            {
                baseX: width * 0.7,
                baseY: height * 0.2,
                z: 1000,
                radius: 15,
                color: '#2c3e50',
                ringColor: null,
                orbitRadius: 15,
                orbitSpeed: 0.0004,
                angle: Math.PI / 2
            }
        ];

        let animationId;
        let time = 0;

        const animate = () => {
            time++;

            // Dark background
            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, width, height);

            const cx = width / 2;
            const cy = height / 2;

            // Draw planets (behind stars for depth)
            planets.forEach(planet => {
                // Update orbit position
                planet.angle += planet.orbitSpeed;
                const orbX = planet.baseX + Math.cos(planet.angle) * planet.orbitRadius;
                const orbY = planet.baseY + Math.sin(planet.angle * 0.5) * planet.orbitRadius * 0.3;

                // Subtle z-axis movement
                const zOffset = Math.sin(planet.angle) * 100;
                const effectiveZ = planet.z + zOffset;

                // Size based on depth
                const scale = 800 / effectiveZ;
                const size = planet.radius * scale;

                if (size > 2) {
                    // Planet glow
                    const gradient = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, size * 1.5);
                    gradient.addColorStop(0, planet.color);
                    gradient.addColorStop(0.7, planet.color);
                    gradient.addColorStop(1, 'transparent');

                    ctx.globalAlpha = 0.4 * scale;
                    ctx.beginPath();
                    ctx.arc(orbX, orbY, size * 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = gradient;
                    ctx.fill();

                    // Planet body
                    ctx.globalAlpha = 0.6 * scale;
                    ctx.beginPath();
                    ctx.arc(orbX, orbY, size, 0, Math.PI * 2);
                    ctx.fillStyle = planet.color;
                    ctx.fill();

                    // Ring if exists
                    if (planet.ringColor) {
                        ctx.globalAlpha = 0.3 * scale;
                        ctx.beginPath();
                        ctx.ellipse(orbX, orbY, size * 1.8, size * 0.4, 0.3, 0, Math.PI * 2);
                        ctx.strokeStyle = planet.ringColor;
                        ctx.lineWidth = size * 0.15;
                        ctx.stroke();
                    }
                }
            });

            // Draw Stars
            stars.forEach(star => {
                star.z -= speed;

                if (star.z <= 0) {
                    star.z = depth;
                    star.x = (Math.random() - 0.5) * width * 3;
                    star.y = (Math.random() - 0.5) * height * 3;
                }

                const k = 100.0 / star.z;
                const px = star.x * k + cx;
                const py = star.y * k + cy;

                if (px >= -50 && px <= width + 50 && py >= -50 && py <= height + 50) {
                    const size = (1 - star.z / depth) * 2;
                    const opacity = (1 - star.z / depth) * star.brightness * 0.8;

                    ctx.globalAlpha = opacity;
                    ctx.fillStyle = '#FFFFFF';
                    ctx.beginPath();
                    ctx.arc(px, py, Math.max(size, 0.5), 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            ctx.globalAlpha = 1;
            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', setSize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                pointerEvents: 'none'
            }}
        />
    );
};

export default SpaceBackground;
