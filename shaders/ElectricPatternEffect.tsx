"use client";
import { forwardRef, useMemo, useEffect } from "react";
import { Uniform, WebGLRenderer, WebGLRenderTarget } from "three";
import { Effect, BlendFunction } from "postprocessing";

/**
 * Electric Pattern Effect
 * Adds glowing neural/electric patterns using FBM noise
 * Only visible in bright areas for a subtle overlay
 */
const electricShader = /* glsl */ `
uniform float uTime;
uniform float uIntensity;
uniform float uScale;
uniform float uSpeed;
uniform vec3 uColorA;
uniform vec3 uColorB;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m*m*m;
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

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    float time = uTime * uSpeed;
    
    // Electric/neural pattern from FBM
    float pattern = fbm(uv * uScale + time);
    pattern = pow(abs(pattern), 2.0) * 2.0;
    
    // Luminance of input
    float luminance = dot(inputColor.rgb, vec3(0.299, 0.587, 0.114));
    
    // Palette colors for the electric effect (customizable via uniforms)
    vec2 centeredUv = uv - 0.5;
    float dist = length(centeredUv);
    float mix1 = sin(time + dist * 10.0) * 0.5 + 0.5;
    vec3 electricColor = mix(uColorA, uColorB, mix1);
    
    // Only show in bright areas
    vec3 overlay = electricColor * pattern * luminance * uIntensity * 0.5;
    
    outputColor = vec4(inputColor.rgb + overlay, inputColor.a);
}
`;

class ElectricPatternEffectImpl extends Effect {
    constructor(intensity = 1.0, scale = 8.0, speed = 1.0) {
        super("ElectricPatternEffect", electricShader, {
            blendFunction: BlendFunction.NORMAL,
            uniforms: new Map<string, Uniform>([
                ["uTime", new Uniform(0)],
                ["uIntensity", new Uniform(intensity)],
                ["uScale", new Uniform(scale)],
                ["uSpeed", new Uniform(speed)],
                ["uColorA", new Uniform([0.1, 0.3, 0.9])],
                ["uColorB", new Uniform([0.8, 0.2, 0.9])],
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
    set scale(v: number) {
        this.uniforms.get("uScale")!.value = v;
    }
    set speed(v: number) {
        this.uniforms.get("uSpeed")!.value = v;
    }
    set colorA(v: [number, number, number]) {
        this.uniforms.get("uColorA")!.value = v;
    }
    set colorB(v: [number, number, number]) {
        this.uniforms.get("uColorB")!.value = v;
    }
}

export interface ElectricPatternEffectProps {
    /** Pattern intensity (0-2) @default 1.0 */
    intensity?: number;
    /** Pattern scale (1-15) @default 8.0 */
    scale?: number;

    /** Animation speed @default 0.5 */
    speed?: number;

    /** First palette color as [r,g,b] each 0..1. Default [0.1,0.3,0.9] */
    colorA?: [number, number, number];
    /** Second palette color as [r,g,b] each 0..1. Default [0.8,0.2,0.9] */
    colorB?: [number, number, number];
}

export const ElectricPatternEffect = forwardRef<
    ElectricPatternEffectImpl,
    ElectricPatternEffectProps
>(function ElectricPatternEffect(
    {
        intensity = 1.0,
        scale = 8.0,
        speed = 0.5,
        colorA = [0.1, 0.3, 0.9] as [number, number, number],
        colorB = [0.8, 0.2, 0.9] as [number, number, number],
    },
    ref
) {
    const effect = useMemo(
        () => new ElectricPatternEffectImpl(intensity, scale, speed),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );
    useEffect(() => {
        effect.intensity = intensity;
    }, [effect, intensity]);
    useEffect(() => {
        effect.scale = scale;
    }, [effect, scale]);
    useEffect(() => {
        effect.speed = speed;
    }, [effect, speed]);
    useEffect(() => {
        effect.colorA = colorA;
    }, [effect, colorA]);
    useEffect(() => {
        effect.colorB = colorB;
    }, [effect, colorB]);
    return <primitive ref={ref} object={effect} dispose={null} />;
});

export { ElectricPatternEffectImpl };
