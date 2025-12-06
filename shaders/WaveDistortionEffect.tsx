"use client";
import { forwardRef, useMemo, useEffect } from "react";
import { Uniform, WebGLRenderer, WebGLRenderTarget } from "three";
import { Effect, BlendFunction } from "postprocessing";

/**
 * Simple Wave Distortion Effect
 * Only handles wavy UV distortions - use with other postprocessing effects for full psychedelic look
 */
const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uSpeed;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    float time = uTime * uSpeed;
    
    // Multiple wave layers for organic distortion
    float wave1 = sin(uv.y * uFrequency + time) * uAmplitude;
    float wave2 = sin(uv.x * uFrequency * 0.7 + time * 0.8) * uAmplitude * 0.7;
    float wave3 = cos((uv.x + uv.y) * uFrequency * 0.5 + time * 0.5) * uAmplitude * 0.4;
    
    // Apply distortion to UV coordinates
    vec2 distortedUv = uv;
    distortedUv.x += wave1 + wave3;
    distortedUv.y += wave2 + wave3;
    
    // Sample the input buffer with distorted UVs
    outputColor = texture2D(inputBuffer, distortedUv);
}
`;

class WaveDistortionEffectImpl extends Effect {
    constructor({
        amplitude = 0.02,
        frequency = 10.0,
        speed = 1.0,
    }: {
        amplitude?: number;
        frequency?: number;
        speed?: number;
    } = {}) {
        super("WaveDistortionEffect", fragmentShader, {
            blendFunction: BlendFunction.NORMAL,
            uniforms: new Map<string, Uniform>([
                ["uTime", new Uniform(0)],
                ["uAmplitude", new Uniform(amplitude)],
                ["uFrequency", new Uniform(frequency)],
                ["uSpeed", new Uniform(speed)],
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

    get amplitude(): number {
        return this.uniforms.get("uAmplitude")!.value as number;
    }
    set amplitude(value: number) {
        this.uniforms.get("uAmplitude")!.value = value;
    }

    get frequency(): number {
        return this.uniforms.get("uFrequency")!.value as number;
    }
    set frequency(value: number) {
        this.uniforms.get("uFrequency")!.value = value;
    }

    get speed(): number {
        return this.uniforms.get("uSpeed")!.value as number;
    }
    set speed(value: number) {
        this.uniforms.get("uSpeed")!.value = value;
    }
}

export interface WaveDistortionEffectProps {
    /** Wave amplitude (0-0.1) @default 0.02 */
    amplitude?: number;
    /** Wave frequency (1-30) @default 10.0 */
    frequency?: number;
    /** Animation speed (0-3) @default 1.0 */
    speed?: number;

    ref?: React.Ref<WaveDistortionEffectImpl>;
}

/**
 * Wave Distortion Effect - creates wavy UV distortions
 * Combine with ChromaticAberration, HueSaturation, Bloom, etc. for psychedelic effects
 */
export function WaveDistortionEffect({
    amplitude = 0.02,
    frequency = 10.0,
    speed = 0.5,
    ref,
}: WaveDistortionEffectProps) {
    const effect = useMemo(
        () => new WaveDistortionEffectImpl({ amplitude, frequency, speed }),
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
}

export { WaveDistortionEffectImpl };
