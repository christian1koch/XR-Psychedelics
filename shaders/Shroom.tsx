"use client";
import {
    Bloom,
    ChromaticAberration,
    Noise,
    BrightnessContrast,
    Sepia,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export function AnimatedShroomPostFX() {
    const bloom = useRef<any>(null);
    const chroma = useRef<any>(null);
    const brightness = useRef<any>(null);

    useFrame(({ clock }) => {
        const t = clock.elapsedTime;

        // Soft breathing glow
        if (bloom.current) {
            bloom.current.intensity = 1.6 + Math.sin(t * 0.8) * 0.5;
        }

        // Color separation wobble
        if (chroma.current) {
            const offset = 0.0015 + Math.sin(t * 1.2) * 0.0008;
            chroma.current.offset.set(offset, offset * 0.7);
        }

        // Subtle contrast pulsing
        if (brightness.current) {
            brightness.current.brightness = 0.2 + Math.sin(t * 0.5) * 0.1;
        }
    });

    return (
        <>
            {/* Psychedelic base inversion */}
            <Sepia intensity={1} blendFunction={BlendFunction.DIFFERENCE} />

            {/* Breathing contrast */}
            <BrightnessContrast
                ref={brightness}
                brightness={0.25}
                contrast={0.9}
            />

            {/* Glowing hallucination edges */}
            <Bloom
                ref={bloom}
                intensity={1.6}
                luminanceThreshold={0.15}
                luminanceSmoothing={0.9}
            />

            {/* Wobbling color split */}
            <ChromaticAberration
                ref={chroma}
                offset={new Vector2(0.0015, 0.001)}
            />

            {/* Organic texture */}
            <Noise opacity={0.05} />
        </>
    );
}
