"use client";

import { useMemo, useEffect } from "react";
import { Uniform, WebGLRenderer, WebGLRenderTarget } from "three";
import { Effect, BlendFunction } from "postprocessing";

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uIntensity;
uniform float uScale;
uniform float uSpeed;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float time = uTime * uSpeed;
  vec2 p = uv;
  
  // Dizzy/Swirl effect
  p.x += sin(p.y * uScale + time) * uIntensity;
  p.y += sin(p.x * uScale + time) * uIntensity;

  vec4 color = texture2D(inputBuffer, p);
  outputColor = color;
}
`;

class PsychEffectImpl extends Effect {
    constructor({ intensity = 0.01, scale = 20.0, speed = 1.0 } = {}) {
        super("PsychEffect", fragmentShader, {
            blendFunction: BlendFunction.NORMAL,
            uniforms: new Map<string, Uniform>([
                ["uTime", new Uniform(0)],
                ["uIntensity", new Uniform(intensity)],
                ["uScale", new Uniform(scale)],
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

    get intensity(): number {
        return this.uniforms.get("uIntensity")!.value as number;
    }
    set intensity(value: number) {
        this.uniforms.get("uIntensity")!.value = value;
    }

    get scale(): number {
        return this.uniforms.get("uScale")!.value as number;
    }
    set scale(value: number) {
        this.uniforms.get("uScale")!.value = value;
    }

    get speed(): number {
        return this.uniforms.get("uSpeed")!.value as number;
    }
    set speed(value: number) {
        this.uniforms.get("uSpeed")!.value = value;
    }
}

export interface PsychEffectProps {
    /** Distortion intensity @default 0.01 */
    intensity?: number;
    /** Pattern scale/frequency @default 20.0 */
    scale?: number;
    /** Animation speed @default 1.0 */
    speed?: number;
    ref?: React.Ref<PsychEffectImpl>;
}

export function PsychEffect({
    intensity = 0.01,
    scale = 20.0,
    speed = 1.0,
    ref,
}: PsychEffectProps) {
    const effect = useMemo(
        () => new PsychEffectImpl({ intensity, scale, speed }),
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

    return <primitive ref={ref} object={effect} dispose={null} />;
}

export { PsychEffectImpl };
