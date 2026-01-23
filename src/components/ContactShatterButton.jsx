
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import ContactForm from './ContactForm';
import { AnimatePresence } from 'framer-motion';

// --- MATH HELPERS ---
const distance = (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

// GENERATOR: Main Trunk + Side Branches
const generateLightningTree = (width, height) => {
    // 1. Define Main Trunk (Diagonal-ish traversal)
    // Start: Somewhere left
    const startX = Math.random() * (width * 0.2);
    const startY = Math.random() * height;
    // End: Somewhere right
    const endX = width * 0.8 + Math.random() * (width * 0.2);
    const endY = Math.random() * height;

    const trunkSegments = [];
    const branches = [];

    // Recursive Displace for Trunk
    const buildLine = (x1, y1, x2, y2, displace, depth) => {
        if (displace < 5 || depth > 6) {
            trunkSegments.push({ x: x2, y: y2 });
            return;
        }

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        // Jitter
        const jx = midX + (Math.random() - 0.5) * displace;
        const jy = midY + (Math.random() - 0.5) * displace;

        buildLine(x1, y1, jx, jy, displace / 1.8, depth + 1);

        // CHANCE TO SPAWN BRANCH at this node
        if (depth < 4 && Math.random() < 0.4) {
            const angle = Math.atan2(y2 - y1, x2 - x1) + (Math.random() - 0.5) * 1.5;
            const len = distance(x1, y1, x2, y2) * (1 + Math.random());
            const bx = jx + Math.cos(angle) * len;
            const by = jy + Math.sin(angle) * len;

            branches.push({
                d: `M ${jx},${jy} ` + generateJaggedLine(jx, jy, bx, by, displace / 2),
                t: jx / width
            });
        }

        buildLine(jx, jy, x2, y2, displace / 1.8, depth + 1);
    };

    // Helper for Branch geometry
    const generateJaggedLine = (x1, y1, x2, y2, displace) => {
        if (displace < 3) return `L ${x2},${y2}`;
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const jx = midX + (Math.random() - 0.5) * displace;
        const jy = midY + (Math.random() - 0.5) * displace;
        return generateJaggedLine(x1, y1, jx, jy, displace / 1.5) + " " + generateJaggedLine(jx, jy, x2, y2, displace / 1.5);
    };

    // Kickoff
    trunkSegments.push({ x: startX, y: startY });
    buildLine(startX, startY, endX, endY, 40, 0);

    // Convert trunk
    let trunkD = `M ${startX},${startY}`;
    trunkSegments.forEach(p => trunkD += ` L ${p.x},${p.y}`);

    return { trunkD, branches };
};


const ContactShatterButton = () => {
    const { t } = useTranslation();
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const flashLayerRef = useRef(null);

    const trunkRef = useRef(null);
    const branchGroupRef = useRef(null);

    const WIDTH = 220;
    const HEIGHT = 80;

    // STATE LIFTED OUT OF EFFECT
    const [tree, setTree] = useState(() => generateLightningTree(WIDTH, HEIGHT));
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                onComplete: () => {
                    gsap.delayedCall(Math.random() * 2 + 1, () => {
                        setTree(generateLightningTree(WIDTH, HEIGHT));
                    });
                }
            });

            // 1. SETUP
            const trunkLen = trunkRef.current.getTotalLength();
            gsap.set(trunkRef.current, {
                strokeDasharray: trunkLen, strokeDashoffset: trunkLen,
                opacity: 1, strokeWidth: 1, stroke: 'rgba(180, 220, 255, 0.6)',
                filter: 'none'
            });

            gsap.set(".branch-path", { opacity: 0, strokeWidth: 1 });

            // 2. STEPPED LEADER ANIMATION (The "Slow Build")
            const buildDuration = 2.5;

            tl.to(trunkRef.current, {
                strokeDashoffset: 0,
                duration: buildDuration,
                ease: "power1.inOut"
            });

            tree.branches.forEach((b, i) => {
                const branchEl = branchGroupRef.current.children[i];
                if (branchEl) {
                    const bLen = branchEl.getTotalLength();
                    gsap.set(branchEl, { strokeDasharray: bLen, strokeDashoffset: bLen, opacity: 0.6, stroke: 'rgba(180, 220, 255, 0.4)' });

                    const startTime = b.t * buildDuration;

                    tl.to(branchEl, {
                        opacity: 0.8,
                        strokeDashoffset: 0,
                        duration: 0.5 + Math.random() * 0.5,
                        ease: "power1.out"
                    }, startTime);
                }
            });

            // 3. RETURN STROKE (The FLASH)
            const flashTime = buildDuration;

            // Trunk Bright
            tl.to(trunkRef.current, {
                duration: 0.05,
                stroke: '#ffffff',
                strokeWidth: 3.5,
                filter: "drop-shadow(0 0 10px #fff) drop-shadow(0 0 20px #8000ff)",
                ease: "none"
            }, flashTime);

            // Branches Bright
            tl.to(".branch-path", {
                duration: 0.05,
                stroke: '#e0f0ff',
                strokeWidth: 1.5,
                filter: "drop-shadow(0 0 5px cyan)",
                opacity: 1
            }, flashTime);

            // Screen Flash
            tl.to(flashLayerRef.current, {
                duration: 0.05,
                opacity: 0.4,
                background: 'rgba(255, 255, 255, 1)'
            }, flashTime);

            // 4. DECAY & TEXT EFFECT (The Fix)
            // Electrocute Text during flash
            tl.to(textRef.current, {
                duration: 0.4,
                x: "random(-2, 2)",
                y: "random(-1, 1)",
                color: "#ffffff",
                textShadow: "0 0 10px #fff, 0 0 20px cyan, 0 0 40px #aa00ff", // Heavy glow
                repeat: 3,
                yoyo: true,
                ease: "rough({ strength: 2, points: 10, randomize: true })"
            }, flashTime);

            // Flickering decay of lightning
            tl.to([trunkRef.current, ".branch-path"], {
                duration: 0.1,
                opacity: 0.5,
                strokeWidth: 1
            }, flashTime + 0.1);
            tl.to([trunkRef.current, ".branch-path"], {
                duration: 0.1,
                opacity: 1, // Restrike
                strokeWidth: 2
            }, flashTime + 0.2);

            // Fade out lightning
            tl.to([trunkRef.current, ".branch-path"], {
                duration: 0.8,
                opacity: 0,
                strokeWidth: 0,
                ease: "power2.in"
            }, flashTime + 0.3);

            // Fade out Flash Layer separately
            tl.to(flashLayerRef.current, {
                duration: 1.0,
                opacity: 0
            }, flashTime + 0.3);

            // Return Text to Normal separately
            tl.to(textRef.current, {
                duration: 0.5,
                textShadow: "none",
                color: "#e0f7ff",
                x: 0,
                y: 0,
                ease: "power2.out"
            }, flashTime + 0.6);

        }, containerRef);

        return () => ctx.revert();
    }, [tree]);

    return (
        <>
            <button
                onClick={() => setIsFormOpen(true)}
                ref={containerRef}
                className="btn btn-glass"
                style={{
                    position: 'relative', isolation: 'isolate', overflow: 'hidden',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    verticalAlign: 'middle', textDecoration: 'none',
                    background: 'rgba(5, 10, 25, 0.8)',
                    borderColor: 'rgba(100, 100, 255, 0.2)',
                    boxShadow: '0 0 10px rgba(80, 0, 255, 0.1)',
                    cursor: 'pointer'
                }}
            >
                {/* AMBIENT GLOW */}
                <div style={{
                    position: 'absolute', inset: 0, borderRadius: 'inherit',
                    pointerEvents: 'none',
                    background: 'radial-gradient(circle at center, rgba(80,0,255,0.05) 0%, transparent 70%)',
                }}
                />

                {/* LIGHTNING LAYER */}
                <svg
                    style={{
                        position: 'absolute', inset: 0, width: '100%', height: '100%',
                        pointerEvents: 'none', borderRadius: 'inherit',
                        overflow: 'visible'
                    }}
                    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                    preserveAspectRatio="none"
                >
                    <g ref={branchGroupRef}>
                        {tree.branches.map((b, i) => (
                            <path key={i} className="branch-path" d={b.d} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        ))}
                    </g>
                    <path ref={trunkRef} d={tree.trunkD || ""} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

                {/* FLASH OVERLAY */}
                <div ref={flashLayerRef}
                    style={{
                        position: 'absolute', inset: 0,
                        background: 'white', opacity: 0,
                        mixBlendMode: 'overlay', pointerEvents: 'none'
                    }}
                />

                {/* TEXT */}
                <span ref={textRef}
                    style={{
                        position: 'relative', zIndex: 10,
                        color: '#e0f7ff',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        // Removed CSS transition to let GSAP handle it fully
                    }}>
                    {t('contact_us')}
                </span>
            </button>

            <AnimatePresence>
                {isFormOpen && (
                    <ContactForm onClose={() => setIsFormOpen(false)} />
                )}
            </AnimatePresence>
        </>
    );
};

export default ContactShatterButton;
