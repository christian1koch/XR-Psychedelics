"use client";
import { forwardRef, useMemo, useEffect } from "react";
import { Uniform, WebGLRenderer, WebGLRenderTarget } from "three";
import { Effect, BlendFunction } from "postprocessing";

/**
 * Animated Color Shift Effect
 * Shifts hue over time for psychedelic color cycling
 */
const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uSpeed;
uniform float uIntensity;
uniform float uSaturationBoost;

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
    vec3 hsv = rgb2hsv(inputColor.rgb);
    
    // Animated hue shift based on time and position
    float hueShift = uTime * uSpeed + length(uv - 0.5) * uIntensity;
    hsv.x = fract(hsv.x + hueShift);
    
    // Boost saturation for more vivid colors
    hsv.y = min(hsv.y * (1.0 + uSaturationBoost), 1.0);
    
    outputColor = vec4(hsv2rgb(hsv), inputColor.a);
}
`;

class ColorShiftEffectImpl extends Effect {
    constructor({
        speed = 0.1,
        intensity = 0.5,
        saturationBoost = 0.3,
    }: {
        speed?: number;
        intensity?: number;
        saturationBoost?: number;
    } = {}) {
        super("ColorShiftEffect", fragmentShader, {
            blendFunction: BlendFunction.NORMAL,
            uniforms: new Map<string, Uniform>([
                ["uTime", new Uniform(0)],
                ["uSpeed", new Uniform(speed)],
                ["uIntensity", new Uniform(intensity)],
                ["uSaturationBoost", new Uniform(saturationBoost)],
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

    get speed(): number {
        return this.uniforms.get("uSpeed")!.value as number;
    }
    set speed(value: number) {
        this.uniforms.get("uSpeed")!.value = value;
    }

    get intensity(): number {
        return this.uniforms.get("uIntensity")!.value as number;
    }
    set intensity(value: number) {
        this.uniforms.get("uIntensity")!.value = value;
    }

    get saturationBoost(): number {
        return this.uniforms.get("uSaturationBoost")!.value as number;
    }
    set saturationBoost(value: number) {
        this.uniforms.get("uSaturationBoost")!.value = value;
    }
}

export interface ColorShiftEffectProps {
    /** Hue rotation speed @default 0.1 */
    speed?: number;
    /** Position-based color variation intensity @default 0.5 */
    intensity?: number;
    /** Saturation boost (0-1) @default 0.3 */
    saturationBoost?: number;
}

/**
 * Animated Color Shift Effect - cycles hue over time
 */
export const ColorShiftEffect = forwardRef<
    ColorShiftEffectImpl,
    ColorShiftEffectProps
>(function ColorShiftEffect(
    { speed = 0.1, intensity = 0.5, saturationBoost = 0.3 },
    ref
) {
    const effect = useMemo(
        () => new ColorShiftEffectImpl({ speed, intensity, saturationBoost }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    useEffect(() => {
        effect.speed = speed;
    }, [effect, speed]);

    useEffect(() => {
        effect.intensity = intensity;
    }, [effect, intensity]);

    useEffect(() => {
        effect.saturationBoost = saturationBoost;
    }, [effect, saturationBoost]);

    return <primitive ref={ref} object={effect} dispose={null} />;
});

export { ColorShiftEffectImpl };
