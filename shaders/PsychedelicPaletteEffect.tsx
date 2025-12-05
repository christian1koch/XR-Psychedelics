"use client";
import { forwardRef, useMemo, useEffect } from "react";
import { Uniform, WebGLRenderer, WebGLRenderTarget } from "three";
import { Effect, BlendFunction } from "postprocessing";

/**
 * Psychedelic Palette Effect
 * Maps colors to a vibrant blue/purple/orange/cyan palette
 * Creates the signature psychedelic color look
 */
const paletteShader = /* glsl */ `
uniform float uTime;
uniform float uIntensity;
uniform float uSaturationBoost;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

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
    float time = uTime * 0.5;
    
    // Convert to HSV and shift hue
    vec3 hsv = rgb2hsv(inputColor.rgb);
    float hueShift = sin(time * 0.5 + dist * 5.0) * 0.3;
    hsv.x = fract(hsv.x + hueShift + time * 0.1);
    hsv.y = min(hsv.y * (1.0 + uSaturationBoost) + 0.3, 1.0);
    hsv.z = min(hsv.z * 1.2, 1.0);
    vec3 shiftedColor = hsv2rgb(hsv);
    
    // Psychedelic color palette
    vec3 palette1 = vec3(0.1, 0.3, 0.9);  // Deep blue
    vec3 palette2 = vec3(0.8, 0.2, 0.9);  // Purple/Magenta
    vec3 palette3 = vec3(1.0, 0.5, 0.1);  // Orange
    vec3 palette4 = vec3(0.0, 0.9, 0.9);  // Cyan
    
    float mix1 = sin(time + dist * 10.0) * 0.5 + 0.5;
    float mix2 = cos(time * 0.7 + dist * 8.0) * 0.5 + 0.5;
    
    vec3 palette = mix(
        mix(palette1, palette2, mix1),
        mix(palette3, palette4, mix2),
        sin(time * 0.3 + hsv.x * 6.28) * 0.5 + 0.5
    );
    
    // Blend with palette
    vec3 finalColor = mix(shiftedColor, palette * shiftedColor + palette * 0.2, uIntensity * 0.7);
    
    outputColor = vec4(finalColor, inputColor.a);
}
`;

class PsychedelicPaletteEffectImpl extends Effect {
    constructor(intensity = 1.0, saturationBoost = 0.5) {
        super("PsychedelicPaletteEffect", paletteShader, {
            blendFunction: BlendFunction.NORMAL,
            uniforms: new Map<string, Uniform>([
                ["uTime", new Uniform(0)],
                ["uIntensity", new Uniform(intensity)],
                ["uSaturationBoost", new Uniform(saturationBoost)],
            ]),
        });
    }

    update(_r: WebGLRenderer, _i: WebGLRenderTarget, deltaTime: number): void {
        this.uniforms.get("uTime")!.value =
            (this.uniforms.get("uTime")!.value as number) + deltaTime;
    }

    set intensity(v: number) {
        this.uniforms.get("uIntensity")!.value = v;
    }
    set saturationBoost(v: number) {
        this.uniforms.get("uSaturationBoost")!.value = v;
    }
}

export interface PsychedelicPaletteEffectProps {
    /** Palette blend intensity (0-2) @default 1.0 */
    intensity?: number;
    /** Saturation boost (0-1) @default 0.5 */
    saturationBoost?: number;
}

export const PsychedelicPaletteEffect = forwardRef<
    PsychedelicPaletteEffectImpl,
    PsychedelicPaletteEffectProps
>(function PsychedelicPaletteEffect(
    { intensity = 1.0, saturationBoost = 0.5 },
    ref
) {
    const effect = useMemo(
        () => new PsychedelicPaletteEffectImpl(intensity, saturationBoost),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );
    useEffect(() => {
        effect.intensity = intensity;
    }, [effect, intensity]);
    useEffect(() => {
        effect.saturationBoost = saturationBoost;
    }, [effect, saturationBoost]);
    return <primitive ref={ref} object={effect} dispose={null} />;
});

export { PsychedelicPaletteEffectImpl };
