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

        // Texture loader
        const textureLoader = new THREE.TextureLoader();

        // Solar System Scope texture URLs (free, CC BY 4.0)
        const planetData = [
            {
                name: 'jupiter',
                texture: 'https://www.solarsystemscope.com/textures/download/2k_jupiter.jpg',
                position: { x: -300, y: 50, z: -500 },
                size: 60,
                rotationSpeed: 0.002
            },
            {
                name: 'saturn',
                texture: 'https://www.solarsystemscope.com/textures/download/2k_saturn.jpg',
                ringTexture: 'https://www.solarsystemscope.com/textures/download/2k_saturn_ring_alpha.png',
                position: { x: 400, y: -100, z: -800 },
                size: 50,
                rotationSpeed: 0.0015,
                hasRing: true
            },
            {
                name: 'mars',
                texture: 'https://www.solarsystemscope.com/textures/download/2k_mars.jpg',
                position: { x: 200, y: 150, z: -400 },
                size: 20,
                rotationSpeed: 0.003
            },
            {
                name: 'earth',
                texture: 'https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg',
                position: { x: -150, y: -80, z: -300 },
                size: 15,
                rotationSpeed: 0.002
            }
        ];

        const planets = [];

        // Create planets
        planetData.forEach(data => {
            const geometry = new THREE.SphereGeometry(data.size, 64, 64);
            const material = new THREE.MeshBasicMaterial({
                map: textureLoader.load(data.texture)
            });
            const planet = new THREE.Mesh(geometry, material);
            planet.position.set(data.position.x, data.position.y, data.position.z);
            planet.userData = {
                rotationSpeed: data.rotationSpeed,
                initialZ: data.position.z,
                driftSpeed: 0.05 + Math.random() * 0.05
            };
            scene.add(planet);
            planets.push(planet);

            // Add Saturn's ring
            if (data.hasRing) {
                const ringGeometry = new THREE.RingGeometry(data.size * 1.3, data.size * 2, 64);
                const ringMaterial = new THREE.MeshBasicMaterial({
                    map: textureLoader.load(data.ringTexture),
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.8
                });
                const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                ring.rotation.x = Math.PI / 2.5;
                planet.add(ring);
            }
        });

        // Create starfield
        const starsGeometry = new THREE.BufferGeometry();
        const starCount = 3000;
        const starPositions = new Float32Array(starCount * 3);
        const starColors = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            starPositions[i3] = (Math.random() - 0.5) * 4000;
            starPositions[i3 + 1] = (Math.random() - 0.5) * 4000;
            starPositions[i3 + 2] = -Math.random() * 3000;

            // Slight color variation
            const brightness = 0.7 + Math.random() * 0.3;
            starColors[i3] = brightness;
            starColors[i3 + 1] = brightness;
            starColors[i3 + 2] = brightness + Math.random() * 0.1;
        }

        starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        starsGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

        const starsMaterial = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });

        const stars = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(stars);

        // Animation
        let animationId;
        const clock = new THREE.Clock();

        const animate = () => {
            const elapsed = clock.getElapsedTime();

            // Rotate planets and simulate forward movement
            planets.forEach(planet => {
                planet.rotation.y += planet.userData.rotationSpeed;

                // Move planets towards camera (simulating forward travel)
                planet.position.z += planet.userData.driftSpeed;

                // Reset when planet passes camera
                if (planet.position.z > 200) {
                    planet.position.z = planet.userData.initialZ - 500;
                    planet.position.x = (Math.random() - 0.5) * 800;
                    planet.position.y = (Math.random() - 0.5) * 400;
                }
            });

            // Slowly move stars forward
            const positions = stars.geometry.attributes.position.array;
            for (let i = 0; i < starCount; i++) {
                const i3 = i * 3 + 2;
                positions[i3] += 0.3;
                if (positions[i3] > 100) {
                    positions[i3] = -3000;
                }
            }
            stars.geometry.attributes.position.needsUpdate = true;

            // Subtle camera sway
            camera.position.x = Math.sin(elapsed * 0.1) * 5;
            camera.position.y = Math.cos(elapsed * 0.15) * 3;

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
