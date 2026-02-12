import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const OpenClawCharacter = ({ className, variant = 'default' }) => {
    const containerRef = useRef(null);
    const bodyRef = useRef(null);
    const leftClawRef = useRef(null);
    const rightClawRef = useRef(null);
    const leftEyeRef = useRef(null);
    const rightEyeRef = useRef(null);
    const antennaLeftRef = useRef(null);
    const antennaRightRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // GLOBAL: Blinking Eyes (Always active, human-like)
            const blink = () => {
                const tl = gsap.timeline({
                    onComplete: () => {
                        // Random delay between 2 and 4 seconds for natural blinking
                        gsap.delayedCall(Math.random() * 2 + 2, blink);
                    }
                });
                
                // Blink closed then open
                tl.to([leftEyeRef.current, rightEyeRef.current], {
                    scaleY: 0.1,
                    transformOrigin: "center center",
                    duration: 0.15,
                    ease: "power2.in"
                })
                .to([leftEyeRef.current, rightEyeRef.current], {
                    scaleY: 1,
                    duration: 0.1,
                    ease: "power2.out"
                });
            };

            // GLOBAL: Antenna Wiggle (Faster & wider for visibility)
            gsap.to(antennaLeftRef.current, { rotation: 25, transformOrigin: "100% 100%", duration: 0.8, yoyo: true, repeat: -1, ease: "sine.inOut" });
            gsap.to(antennaRightRef.current, { rotation: -25, transformOrigin: "0% 100%", duration: 0.9, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 0.1 });

            // Start blinking loop
            gsap.delayedCall(1, blink);

            if (variant === 'default') {
                // 1. Floating Body (Sine wave y-axis)
                gsap.to(bodyRef.current, { y: -6, duration: 2.5, yoyo: true, repeat: -1, ease: "sine.inOut" });

                // 2. Claw Waving
                gsap.to(leftClawRef.current, { rotation: 10, scale: 1.05, transformOrigin: "90% 90%", duration: 1.8, yoyo: true, repeat: -1, ease: "power1.inOut" });
                gsap.to(rightClawRef.current, { rotation: -10, scale: 1.05, transformOrigin: "10% 90%", duration: 2.0, yoyo: true, repeat: -1, ease: "power1.inOut", delay: 0.3 });
                

            } else if (variant === 'peek') {
                // PEEK ANIMATION sequence
                // Masking is now handled by the parent container (overflow: hidden).
                // SVG viewBox is 0-120. Character occupies ~10-110.
                // To hide completely below the 120 bottom, we need y > 110.
                // Start Y=130 (completely out of view).
                gsap.set(bodyRef.current, { y: 130, rotation: 45, scale: 0.8 }); // Start tucked
                
                const masterTl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

                // 1. Slide Up + Untuck (Physical reveal)
                masterTl.to(bodyRef.current, {
                        y: 35,
                        rotation: 0,
                        scale: 1,
                        duration: 2.2,
                        ease: "sine.out" 
                    }
                )
                
                // 2. Look Left
                .to(bodyRef.current, { rotation: -6, x: -1, duration: 0.9, ease: "sine.inOut" }, "+=0.3")
                .to([leftEyeRef.current, rightEyeRef.current], { x: -2.5, duration: 0.8, ease: "sine.inOut" }, "<")

                // 3. Look Right
                .to(bodyRef.current, { rotation: 6, x: 1, duration: 1.1, ease: "sine.inOut" }, "+=0.1")
                .to([leftEyeRef.current, rightEyeRef.current], { x: 2.5, duration: 1.0, ease: "sine.inOut" }, "<")

                // 4. Center
                .to(bodyRef.current, { rotation: 0, x: 0, duration: 0.6, ease: "sine.out" }, "+=0.2")
                .to([leftEyeRef.current, rightEyeRef.current], { x: 0, duration: 0.6, ease: "sine.out" }, "<")

                // 5. Wave (Right claw)
                .to(rightClawRef.current, { rotation: -20, duration: 0.5, transformOrigin: "15% 85%", ease: "sine.out" }, "+=0.1")
                .to(rightClawRef.current, { rotation: 5, duration: 0.5, ease: "sine.inOut" })
                .to(rightClawRef.current, { rotation: -15, duration: 0.5, ease: "sine.inOut" })
                .to(rightClawRef.current, { rotation: 0, duration: 0.6, ease: "sine.out" })

                // 6. Stay visible longer
                .to({}, { duration: 3.5 }) 

                // 7. Tuck & Slide Down (Creative Hide)
                .to(bodyRef.current, {
                    y: 130, // Back into the "pocket"
                    rotation: 45, // Tuck head away
                    scale: 0.8, // Shrink into depth
                    duration: 1.5,
                    ease: "power2.in"
                });
            }

        }, containerRef);
        return () => ctx.revert();
    }, [variant]);

    return (
        <div ref={containerRef} className={className}>
            <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="lobster-gradient-anim" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff4d4d"/>
                  <stop offset="100%" stopColor="#991b1b"/>
                </linearGradient>
                <filter id="glow-anim">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
              </defs>
              
              {/* Group Body and Claws together so they float together */}
              <g ref={bodyRef}>
                  
                  {/* Body Shape */}
                  <path d="M60 10 C30 10 15 35 15 55 C15 75 30 95 45 100 L45 110 L55 110 L55 100 C55 100 60 102 65 100 L65 110 L75 110 L75 100 C90 95 105 75 105 55 C105 35 90 10 60 10Z" fill="url(#lobster-gradient-anim)"/>
                  
                  {/* Claws */}
                  <path ref={leftClawRef} d="M20 45 C5 40 0 50 5 60 C10 70 20 65 25 55 C28 48 25 45 20 45Z" fill="url(#lobster-gradient-anim)"/>
                  <path ref={rightClawRef} d="M100 45 C115 40 120 50 115 60 C110 70 100 65 95 55 C92 48 95 45 100 45Z" fill="url(#lobster-gradient-anim)"/>

                  {/* Antennae */}
                  <path ref={antennaLeftRef} d="M45 15 Q35 5 30 8" stroke="#ff4d4d" strokeWidth="3" strokeLinecap="round"/>
                  <path ref={antennaRightRef} d="M75 15 Q85 5 90 8" stroke="#ff4d4d" strokeWidth="3" strokeLinecap="round"/>

                  {/* Eyes (Pupil + Highlight) */}
                  <g ref={leftEyeRef}>
                    <circle cx="45" cy="35" r="6" fill="#050810"/>
                    <circle cx="46" cy="34" r="2.5" fill="#00e5cc"/>
                  </g>
                  <g ref={rightEyeRef}>
                    <circle cx="75" cy="35" r="6" fill="#050810"/>
                    <circle cx="76" cy="34" r="2.5" fill="#00e5cc"/>
                  </g>
              </g>
            </svg>
        </div>
    );
};
export default OpenClawCharacter;
