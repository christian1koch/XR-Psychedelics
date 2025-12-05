"use client";
import { forwardRef, useMemo, useEffect } from "react";
import { Uniform, Vector2, WebGLRenderer, WebGLRenderTarget } from "three";
import { Effect, BlendFunction } from "postprocessing";

/**
 * Psychedelic shader that creates a trippy, colorful distortion effect
 * Features:
 * - Wavy distortions (like viewing through water)
 * - Color shifting to vibrant blues/purples/oranges
 * - Glow/bloom-like effect on bright areas
 * - Electric/neural patterns overlay
 * - Chromatic aberration
 */
const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uIntensity;
uniform float uWaveAmplitude;
uniform float uWaveFrequency;
uniform float uColorShift;
uniform float uGlowIntensity;
uniform float uDistortionStrength;
uniform vec2 uResolution;

// Simplex noise function for organic patterns
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                     + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                            dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

// FBM (Fractal Brownian Motion) for more complex noise
float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for(int i = 0; i < 5; i++) {
        value += amplitude * snoise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    return value;
}

// HSV to RGB conversion
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// RGB to HSV conversion
vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 centeredUv = uv - 0.5;
    float dist = length(centeredUv);
    
    // === WAVE DISTORTION ===
    float time = uTime * 0.5;
    
    // Multiple wave layers for more organic distortion
    float wave1 = sin(uv.y * uWaveFrequency + time * 2.0) * uWaveAmplitude;
    float wave2 = sin(uv.x * uWaveFrequency * 0.7 + time * 1.5) * uWaveAmplitude * 0.8;
    float wave3 = cos((uv.x + uv.y) * uWaveFrequency * 0.5 + time) * uWaveAmplitude * 0.5;
    
    // Noise-based distortion for more organic feel
    float noiseDistort = fbm(uv * 3.0 + time * 0.3) * uDistortionStrength;
    
    // Apply distortion to UV coordinates
    vec2 distortedUv = uv;
    distortedUv.x += wave1 + noiseDistort * 0.02;
    distortedUv.y += wave2 + noiseDistort * 0.02;
    distortedUv += vec2(wave3) * 0.5;
    
    // === CHROMATIC ABERRATION ===
    float aberrationStrength = 0.008 * uIntensity;
    vec2 direction = normalize(centeredUv + 0.001);
    
    vec4 colorR = texture2D(inputBuffer, distortedUv + direction * aberrationStrength);
    vec4 colorG = texture2D(inputBuffer, distortedUv);
    vec4 colorB = texture2D(inputBuffer, distortedUv - direction * aberrationStrength);
    
    vec3 baseColor = vec3(colorR.r, colorG.g, colorB.b);
    
    // === COLOR TRANSFORMATION ===
    vec3 hsv = rgb2hsv(baseColor);
    
    // Shift hue based on time and position - creates flowing rainbow effect
    float hueShift = uColorShift * sin(time * 0.5 + dist * 5.0 + noiseDistort * 2.0);
    hsv.x = fract(hsv.x + hueShift + time * 0.1);
    
    // Increase saturation for more vivid colors
    hsv.y = min(hsv.y * 1.5 + 0.3, 1.0);
    
    // Boost value slightly
    hsv.z = min(hsv.z * 1.2, 1.0);
    
    vec3 shiftedColor = hsv2rgb(hsv);
    
    // === PSYCHEDELIC COLOR MAPPING ===
    // Map to vibrant blue/purple/orange palette
    vec3 colorPalette1 = vec3(0.1, 0.3, 0.9);  // Deep blue
    vec3 colorPalette2 = vec3(0.8, 0.2, 0.9);  // Purple/Magenta
    vec3 colorPalette3 = vec3(1.0, 0.5, 0.1);  // Orange
    vec3 colorPalette4 = vec3(0.0, 0.9, 0.9);  // Cyan
    
    float paletteMix = sin(time + dist * 10.0 + noiseDistort * 3.0) * 0.5 + 0.5;
    float paletteMix2 = cos(time * 0.7 + dist * 8.0) * 0.5 + 0.5;
    
    vec3 palette = mix(
        mix(colorPalette1, colorPalette2, paletteMix),
        mix(colorPalette3, colorPalette4, paletteMix2),
        sin(time * 0.3 + hsv.x * 6.28) * 0.5 + 0.5
    );
    
    // Blend original shifted color with palette
    vec3 finalColor = mix(shiftedColor, palette * shiftedColor + palette * 0.2, uIntensity * 0.7);
    
    // === GLOW/BLOOM EFFECT ===
    float luminance = dot(baseColor, vec3(0.299, 0.587, 0.114));
    vec3 glow = finalColor * luminance * uGlowIntensity;
    finalColor += glow;
    
    // === ELECTRIC/NEURAL PATTERN OVERLAY ===
    float electricPattern = fbm(uv * 8.0 + time * 0.5);
    electricPattern = pow(abs(electricPattern), 2.0) * 2.0;
    
    // Only show electric patterns in bright areas
    vec3 electricColor = palette * electricPattern * luminance * uIntensity * 0.5;
    finalColor += electricColor;
    
    // === VIGNETTE (subtle darkening at edges) ===
    float vignette = 1.0 - dist * 0.3;
    finalColor *= vignette;
    
    // === FINAL OUTPUT ===
    outputColor = vec4(finalColor, inputColor.a);
}
`;

/**
 * PsychedelicEffect class for postprocessing
 */
class PsychedelicEffectImpl extends Effect {
    constructor({
        intensity = 1.0,
        waveAmplitude = 0.02,
        waveFrequency = 10.0,
        colorShift = 0.3,
        glowIntensity = 0.5,
        distortionStrength = 1.0,
    }: {
        intensity?: number;
        waveAmplitude?: number;
        waveFrequency?: number;
        colorShift?: number;
        glowIntensity?: number;
        distortionStrength?: number;
    } = {}) {
        super("PsychedelicEffect", fragmentShader, {
            blendFunction: BlendFunction.NORMAL,
            uniforms: new Map<string, Uniform>([
                ["uTime", new Uniform(0)],
                ["uIntensity", new Uniform(intensity)],
                ["uWaveAmplitude", new Uniform(waveAmplitude)],
                ["uWaveFrequency", new Uniform(waveFrequency)],
                ["uColorShift", new Uniform(colorShift)],
                ["uGlowIntensity", new Uniform(glowIntensity)],
                ["uDistortionStrength", new Uniform(distortionStrength)],
                ["uResolution", new Uniform(new Vector2(1, 1))],
            ]),
        });
    }

    update(
        _renderer: WebGLRenderer,
        _inputBuffer: WebGLRenderTarget,
        deltaTime: number
    ): void {
        const time = this.uniforms.get("uTime")!.value as number;
        this.uniforms.get("uTime")!.value = time + deltaTime;
    }

    // Getters and setters for all uniforms
    get intensity(): number {
        return this.uniforms.get("uIntensity")!.value as number;
    }
    set intensity(value: number) {
        this.uniforms.get("uIntensity")!.value = value;
    }

    get waveAmplitude(): number {
        return this.uniforms.get("uWaveAmplitude")!.value as number;
    }
    set waveAmplitude(value: number) {
        this.uniforms.get("uWaveAmplitude")!.value = value;
    }

    get waveFrequency(): number {
        return this.uniforms.get("uWaveFrequency")!.value as number;
    }
    set waveFrequency(value: number) {
        this.uniforms.get("uWaveFrequency")!.value = value;
    }

    get colorShift(): number {
        return this.uniforms.get("uColorShift")!.value as number;
    }
    set colorShift(value: number) {
        this.uniforms.get("uColorShift")!.value = value;
    }

    get glowIntensity(): number {
        return this.uniforms.get("uGlowIntensity")!.value as number;
    }
    set glowIntensity(value: number) {
        this.uniforms.get("uGlowIntensity")!.value = value;
    }

    get distortionStrength(): number {
        return this.uniforms.get("uDistortionStrength")!.value as number;
    }
    set distortionStrength(value: number) {
        this.uniforms.get("uDistortionStrength")!.value = value;
    }
}

export interface PsychedelicEffectProps {
    /**
     * Overall effect intensity (0-2)
     * @default 1.0
     */
    intensity?: number;
    /**
     * Amplitude of wave distortions (0-0.1)
     * @default 0.02
     */
    waveAmplitude?: number;
    /**
     * Frequency of wave distortions (1-30)
     * @default 10.0
     */
    waveFrequency?: number;
    /**
     * Amount of hue/color shifting (0-1)
     * @default 0.3
     */
    colorShift?: number;
    /**
     * Intensity of glow effect (0-2)
     * @default 0.5
     */
    glowIntensity?: number;
    /**
     * Strength of noise-based distortion (0-3)
     * @default 1.0
     */
    distortionStrength?: number;
}

/**
 * Psychedelic post-processing effect for React Three Fiber
 * Creates a trippy, colorful distortion with waves, color shifts, and glow
 *
 * @example
 * ```tsx
 * <EffectComposer>
 *   <PsychedelicEffect
 *     intensity={1.0}
 *     waveAmplitude={0.02}
 *     colorShift={0.3}
 *   />
 * </EffectComposer>
 * ```
 */
export const PsychedelicEffect = forwardRef<
    PsychedelicEffectImpl,
    PsychedelicEffectProps
>(function PsychedelicEffect(
    {
        intensity = 1.0,
        waveAmplitude = 0.02,
        waveFrequency = 10.0,
        colorShift = 0.3,
        glowIntensity = 0.5,
        distortionStrength = 1.0,
    },
    ref
) {
    const effect = useMemo(
        () =>
            new PsychedelicEffectImpl({
                intensity,
                waveAmplitude,
                waveFrequency,
                colorShift,
                glowIntensity,
                distortionStrength,
            }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    // Update uniforms when props change
    useEffect(() => {
        effect.intensity = intensity;
    }, [effect, intensity]);

    useEffect(() => {
        effect.waveAmplitude = waveAmplitude;
    }, [effect, waveAmplitude]);

    useEffect(() => {
        effect.waveFrequency = waveFrequency;
    }, [effect, waveFrequency]);

    useEffect(() => {
        effect.colorShift = colorShift;
    }, [effect, colorShift]);

    useEffect(() => {
        effect.glowIntensity = glowIntensity;
    }, [effect, glowIntensity]);

    useEffect(() => {
        effect.distortionStrength = distortionStrength;
    }, [effect, distortionStrength]);

    return <primitive ref={ref} object={effect} dispose={null} />;
});

// Export the implementation class for advanced use
export { PsychedelicEffectImpl };
