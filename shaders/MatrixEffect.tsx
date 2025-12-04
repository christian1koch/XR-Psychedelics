"use client";
import {
    EffectComposer,
    Vignette,
    Noise,
    HueSaturation,
    BrightnessContrast,
    ChromaticAberration,
    Bloom,
    Scanline,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";

interface MatrixEffectProps {
    /** Psychedelic intensity - cranks up all effects (0-1, default: 0.5) */
    intensity?: number;
}

/**
 * Matrix-style post-processing effect
 *
 * Creates a green-tinted cyberpunk look inspired by The Matrix.
 * With bloom glow, scanlines, chromatic aberration, and more!
 *
 * @example
 * <Canvas>
 *   <YourScene />
 *   <MatrixEffect intensity={0.8} />
 * </Canvas>
 */
export function MatrixEffect({ intensity = 0.5 }: MatrixEffectProps) {
    // Scale effects based on intensity
    const saturation = 0.5 + intensity * 0.3;
    const bloomAmount = 0.8 + intensity * 0.7;
    const chromaticOffset = 0.003 + intensity * 0.005;
    const noiseAmount = 0.1 + intensity * 0.08;

    return (
        <EffectComposer>
            <HueSaturation
                blendFunction={BlendFunction.NORMAL}
                hue={-0.5}
                saturation={saturation}
            />
            <BrightnessContrast brightness={-0.15} contrast={0.35} />
            <Bloom
                luminanceThreshold={0.2}
                luminanceSmoothing={0.9}
                intensity={bloomAmount}
                mipmapBlur
            />
            <ChromaticAberration
                blendFunction={BlendFunction.NORMAL}
                offset={new Vector2(chromaticOffset, chromaticOffset)}
            />
            <Scanline
                blendFunction={BlendFunction.OVERLAY}
                density={1.5}
                opacity={0.15}
            />
            <Vignette
                offset={0.15}
                darkness={0.9}
                blendFunction={BlendFunction.NORMAL}
            />
            <Noise
                opacity={noiseAmount}
                blendFunction={BlendFunction.OVERLAY}
            />
        </EffectComposer>
    );
}
