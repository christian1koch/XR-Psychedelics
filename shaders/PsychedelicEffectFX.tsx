"use client";
import { forwardRef, useMemo, useEffect } from "react";
import { Uniform, Vector2, WebGLRenderer, WebGLRenderTarget } from "three";
import { Effect, BlendFunction } from "postprocessing";
import {
    Bloom,
    ChromaticAberration,
    Vignette,
    Noise,
} from "@react-three/postprocessing";
import { AfterImageEffect } from "./AfterimageEffect";
import { NoiseDistortionEffect } from "./NoiseDistortionEffect";
import { PsychedelicPaletteEffect } from "./PsychedelicPaletteEffect";
import { ElectricPatternEffect } from "./ElectricPatternEffect";

// ============================================================================
// WAVE DISTORTION EFFECT (Custom)
// ============================================================================
const waveFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uSpeed;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    float time = uTime * uSpeed;
    
    float wave1 = sin(uv.y * uFrequency + time) * uAmplitude;
    float wave2 = sin(uv.x * uFrequency * 0.7 + time * 0.8) * uAmplitude * 0.7;
    float wave3 = cos((uv.x + uv.y) * uFrequency * 0.5 + time * 0.5) * uAmplitude * 0.4;
    
    vec2 distortedUv = uv;
    distortedUv.x += wave1 + wave3;
    distortedUv.y += wave2 + wave3;
    
    outputColor = texture2D(inputBuffer, distortedUv);
}
`;

class WaveDistortionEffectImpl extends Effect {
    constructor(amplitude = 0.02, frequency = 10.0, speed = 1.0) {
        super("WaveDistortionEffect", waveFragmentShader, {
            blendFunction: BlendFunction.NORMAL,
            uniforms: new Map<string, Uniform>([
                ["uTime", new Uniform(0)],
                ["uAmplitude", new Uniform(amplitude)],
                ["uFrequency", new Uniform(frequency)],
                ["uSpeed", new Uniform(speed)],
            ]),
        });
    }

    update(_r: WebGLRenderer, _i: WebGLRenderTarget, deltaTime: number): void {
        this.uniforms.get("uTime")!.value =
            (this.uniforms.get("uTime")!.value as number) + deltaTime;
    }

    set amplitude(v: number) {
        this.uniforms.get("uAmplitude")!.value = v;
    }
    set frequency(v: number) {
        this.uniforms.get("uFrequency")!.value = v;
    }
    set speed(v: number) {
        this.uniforms.get("uSpeed")!.value = v;
    }
}
// ============================================================================
// REACT COMPONENTS FOR CUSTOM EFFECTS
// ============================================================================
interface WaveDistortionProps {
    amplitude?: number;
    frequency?: number;
    speed?: number;
}

const WaveDistortion = forwardRef<
    WaveDistortionEffectImpl,
    WaveDistortionProps
>(function WaveDistortion(
    { amplitude = 0.02, frequency = 10, speed = 1 },
    ref
) {
    const effect = useMemo(
        () => new WaveDistortionEffectImpl(amplitude, frequency, speed),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );
    useEffect(() => {
        effect.amplitude = amplitude;
    }, [effect, amplitude]);
    useEffect(() => {
        effect.frequency = frequency;
    }, [effect, frequency]);
    useEffect(() => {
        effect.speed = speed;
    }, [effect, speed]);
    return <primitive ref={ref} object={effect} dispose={null} />;
});

// ============================================================================
// MAIN PSYCHEDELIC EFFECT FX COMPONENT
// ============================================================================
export interface PsychedelicEffectFXProps {
    // Wave distortion
    waveAmplitude?: number;
    waveFrequency?: number;
    waveSpeed?: number;
    // Noise distortion (FBM organic flow)
    noiseDistortionStrength?: number;
    noiseDistortionScale?: number;
    // Psychedelic palette
    paletteIntensity?: number;
    paletteSaturation?: number;
    // Electric patterns
    electricIntensity?: number;
    electricScale?: number;
    // AfterImage (trail)
    trailDamp?: number;
    // Chromatic aberration
    chromaticOffset?: number;
    // Bloom
    bloomIntensity?: number;
    bloomThreshold?: number;
    // Vignette
    vignetteDarkness?: number;
    // Noise
    noiseOpacity?: number;
    // Toggle individual effects
    enableWave?: boolean;
    enableNoiseDistortion?: boolean;
    enablePalette?: boolean;
    enableElectric?: boolean;
    enableTrail?: boolean;
    enableChromatic?: boolean;
    enableBloom?: boolean;
    enableVignette?: boolean;
    enableNoise?: boolean;
}

/**
 * PsychedelicEffectFX - Combines built-in postprocessing effects with custom shaders
 *
 * Built-in effects used:
 * - ChromaticAberration, Bloom, Vignette, Noise from @react-three/postprocessing
 *
 * Custom effects:
 * - WaveDistortion (wavy UV distortion)
 * - ColorShift (animated hue cycling)
 * - AfterImage (trailing/ghosting)
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <YourScene />
 *   <PsychedelicEffectFX
 *     waveAmplitude={0.025}
 *     colorShiftSpeed={0.15}
 *     bloomIntensity={1.5}
 *   />
 * </Canvas>
 * ```
 */
export function PsychedelicEffectFX({
    // Wave
    waveAmplitude = 0.025,
    waveFrequency = 12,
    waveSpeed = 1.5,
    // Noise distortion
    noiseDistortionStrength = 1.0,
    noiseDistortionScale = 3.0,
    // Psychedelic palette
    paletteIntensity = 1.0,
    paletteSaturation = 0.5,
    // Electric patterns
    electricIntensity = 1.0,
    electricScale = 8.0,
    // Trail
    trailDamp = 0.85,
    // Chromatic
    chromaticOffset = 0.008,
    // Bloom
    bloomIntensity = 1.5,
    bloomThreshold = 0.2,
    // Vignette
    vignetteDarkness = 0.3,
    // Noise
    noiseOpacity = 0.1,
    // Toggles
    enableWave = true,
    enableNoiseDistortion = true,
    enablePalette = true,
    enableElectric = true,
    enableTrail = true,
    enableChromatic = true,
    enableBloom = true,
    enableVignette = true,
    enableNoise = false,
}: PsychedelicEffectFXProps) {
    const chromaticOffsetVector = useMemo(
        () => new Vector2(chromaticOffset, chromaticOffset),
        [chromaticOffset]
    );

    // Build effects array based on enabled flags
    // Order matters! This matches the old PsychedelicEffect processing order
    const effects: React.ReactElement[] = [];

    // 1. Trail effect (AfterImage)
    if (enableTrail) {
        effects.push(<AfterImageEffect key="trail" damp={trailDamp} />);
    }

    // 2. Wave distortion (sine waves)
    if (enableWave) {
        effects.push(
            <WaveDistortion
                key="wave"
                amplitude={waveAmplitude}
                frequency={waveFrequency}
                speed={waveSpeed}
            />
        );
    }

    // 3. Noise distortion (FBM organic flow) - CUSTOM
    if (enableNoiseDistortion) {
        effects.push(
            <NoiseDistortionEffect
                key="noiseDistort"
                strength={noiseDistortionStrength}
                scale={noiseDistortionScale}
            />
        );
    }

    // 4. Chromatic aberration (built-in)
    if (enableChromatic) {
        effects.push(
            <ChromaticAberration
                key="chromatic"
                offset={chromaticOffsetVector}
                radialModulation={true}
                modulationOffset={0.5}
            />
        );
    }

    // 5. Psychedelic palette mapping - CUSTOM
    if (enablePalette) {
        effects.push(
            <PsychedelicPaletteEffect
                key="palette"
                intensity={paletteIntensity}
                saturationBoost={paletteSaturation}
            />
        );
    }

    // 6. Electric/neural patterns - CUSTOM
    if (enableElectric) {
        effects.push(
            <ElectricPatternEffect
                key="electric"
                intensity={electricIntensity}
                scale={electricScale}
            />
        );
    }

    // 7. Bloom/glow (built-in)
    if (enableBloom) {
        effects.push(
            <Bloom
                key="bloom"
                intensity={bloomIntensity}
                luminanceThreshold={bloomThreshold}
                luminanceSmoothing={0.9}
            />
        );
    }

    // 8. Vignette (built-in)
    if (enableVignette) {
        effects.push(
            <Vignette key="vignette" darkness={vignetteDarkness} offset={0.3} />
        );
    }

    // 9. Film grain noise (built-in)
    if (enableNoise) {
        effects.push(
            <Noise
                key="noise"
                opacity={noiseOpacity}
                blendFunction={BlendFunction.OVERLAY}
            />
        );
    }

    return effects;
}

// Export individual components for granular use
export { WaveDistortion };
export { WaveDistortionEffectImpl };
