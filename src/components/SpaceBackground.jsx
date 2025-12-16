import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const SpaceBackground = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
        camera.position.z = 100;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        // Create procedural planet texture
        const createPlanetTexture = (colors, bands = 8) => {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');

            // Create banded pattern
            const bandHeight = canvas.height / bands;
            for (let i = 0; i < bands; i++) {
                const colorIndex = i % colors.length;
                const nextColorIndex = (i + 1) % colors.length;

                const gradient = ctx.createLinearGradient(0, i * bandHeight, 0, (i + 1) * bandHeight);
                gradient.addColorStop(0, colors[colorIndex]);
                gradient.addColorStop(0.5, colors[nextColorIndex]);
                gradient.addColorStop(1, colors[colorIndex]);

                ctx.fillStyle = gradient;
                ctx.fillRect(0, i * bandHeight, canvas.width, bandHeight);
            }

            // Add noise for realism
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < imageData.data.length; i += 4) {
                const noise = (Math.random() - 0.5) * 20;
                imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + noise));
                imageData.data[i + 1] = Math.max(0, Math.min(255, imageData.data[i + 1] + noise));
                imageData.data[i + 2] = Math.max(0, Math.min(255, imageData.data[i + 2] + noise));
            }
            ctx.putImageData(imageData, 0, 0);

            const texture = new THREE.CanvasTexture(canvas);
            texture.wrapS = THREE.RepeatWrapping;
            return texture;
        };

        // Planet configurations with procedural textures
        const planetConfigs = [
            {
                name: 'jupiter',
                colors: ['#c9a86c', '#e0c9a6', '#a08050', '#d4b896', '#8b7355'],
                size: 50,
                position: { x: -250, y: 40, z: -400 },
                rotationSpeed: 0.003,
                bands: 12
            },
            {
                name: 'saturn',
                colors: ['#e4d4a5', '#c9b896', '#dbc99c', '#b8a480'],
                size: 40,
                position: { x: 300, y: -60, z: -600 },
                rotationSpeed: 0.002,
                hasRing: true,
                bands: 10
            },
            {
                name: 'mars',
                colors: ['#c1440e', '#8b3a0e', '#a04010', '#6b2a06'],
                size: 18,
                position: { x: 180, y: 100, z: -300 },
                rotationSpeed: 0.004,
                bands: 6
            },
            {
                name: 'neptune',
                colors: ['#3b5998', '#4169e1', '#1e3a5f', '#2e5090'],
                size: 25,
                position: { x: -120, y: -90, z: -500 },
                rotationSpeed: 0.0025,
                bands: 8
            }
        ];

        const planets = [];

        // Create planets
        planetConfigs.forEach(config => {
            const geometry = new THREE.SphereGeometry(config.size, 64, 64);
            const texture = createPlanetTexture(config.colors, config.bands);
            const material = new THREE.MeshBasicMaterial({ map: texture });
            const planet = new THREE.Mesh(geometry, material);

            planet.position.set(config.position.x, config.position.y, config.position.z);
            planet.rotation.x = Math.random() * 0.3;
            planet.userData = {
                rotationSpeed: config.rotationSpeed,
                initialZ: config.position.z,
                driftSpeed: 0.08 + Math.random() * 0.04
            };

            scene.add(planet);
            planets.push(planet);

            // Saturn's ring
            if (config.hasRing) {
                const ringGeometry = new THREE.RingGeometry(config.size * 1.4, config.size * 2.2, 64);
                const ringMaterial = new THREE.MeshBasicMaterial({
                    color: 0xc9b896,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.6
                });
                const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                ring.rotation.x = Math.PI / 2.2;
                planet.add(ring);
            }

            // Atmosphere glow
            const glowGeometry = new THREE.SphereGeometry(config.size * 1.15, 32, 32);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: config.colors[0],
                transparent: true,
                opacity: 0.1
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            planet.add(glow);
        });

        // Create starfield with proper sizes
        const starsGeometry = new THREE.BufferGeometry();
        const starCount = 2000;
        const starPositions = new Float32Array(starCount * 3);
        const starSizes = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            starPositions[i3] = (Math.random() - 0.5) * 3000;
            starPositions[i3 + 1] = (Math.random() - 0.5) * 2000;
            starPositions[i3 + 2] = -Math.random() * 2000 - 100;
            starSizes[i] = Math.random() * 2 + 0.5;
        }

        starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        starsGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1.5,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });

        const stars = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(stars);

        // Animation
        let animationId;
        const clock = new THREE.Clock();

        const animate = () => {
            const elapsed = clock.getElapsedTime();

            // Rotate and move planets towards camera
            planets.forEach(planet => {
                planet.rotation.y += planet.userData.rotationSpeed;
                planet.position.z += planet.userData.driftSpeed;

                // Reset when past camera
                if (planet.position.z > 150) {
                    planet.position.z = planet.userData.initialZ - 300 - Math.random() * 200;
                    planet.position.x = (Math.random() - 0.5) * 600;
                    planet.position.y = (Math.random() - 0.5) * 300;
                }
            });

            // Move stars forward
            const positions = stars.geometry.attributes.position.array;
            for (let i = 0; i < starCount; i++) {
                const i3 = i * 3 + 2;
                positions[i3] += 0.4;
                if (positions[i3] > 50) {
                    positions[i3] = -2000 - Math.random() * 500;
                    positions[i3 - 2] = (Math.random() - 0.5) * 3000;
                    positions[i3 - 1] = (Math.random() - 0.5) * 2000;
                }
            }
            stars.geometry.attributes.position.needsUpdate = true;

            // Subtle camera movement
            camera.position.x = Math.sin(elapsed * 0.05) * 3;
            camera.position.y = Math.cos(elapsed * 0.07) * 2;

            renderer.render(scene, camera);
            animationId = requestAnimationFrame(animate);
        };

        animate();

        // Handle resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
            if (containerRef.current && renderer.domElement) {
                containerRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                pointerEvents: 'none',
                background: '#050505'
            }}
        />
    );
};

export default SpaceBackground;
