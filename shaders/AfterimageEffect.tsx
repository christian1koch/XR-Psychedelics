"use client";
import { forwardRef, useMemo } from "react";
import {
    Uniform,
    HalfFloatType,
    NearestFilter,
    WebGLRenderTarget,
    ShaderMaterial,
    PlaneGeometry,
    Mesh,
    OrthographicCamera,
    Scene,
} from "three";
import { Effect, BlendFunction } from "postprocessing";
import type {
    WebGLRenderer,
    WebGLRenderTarget as RenderTargetType,
} from "three";

// AfterImage shader - blends previous accumulated frame with current frame
const fragmentShader = /* glsl */ `
uniform sampler2D tOld;
uniform float damp;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec4 texelOld = texture2D(tOld, uv);
    // Blend: take the max of damped old accumulated color and new input
    outputColor = max(inputColor, texelOld * damp);
}
`;

// Blending shader - renders the blended result to our save buffer
const blendVertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const blendFragmentShader = /* glsl */ `
uniform sampler2D tNew;
uniform sampler2D tOld;
uniform float damp;
varying vec2 vUv;

void main() {
    vec4 newColor = texture2D(tNew, vUv);
    vec4 oldColor = texture2D(tOld, vUv);
    gl_FragColor = max(newColor, oldColor * damp);
}
`;

/**
 * AfterImage effect implementation
 * Accumulates frames over time for a trailing/ghosting effect
 */
export class AfterImageEffectImpl extends Effect {
    // Two buffers for ping-pong rendering
    private textureA: RenderTargetType;
    private textureB: RenderTargetType;
    private currentBuffer: "A" | "B" = "A";

    // For rendering the blended result to save buffer
    private blendMaterial: ShaderMaterial;
    private blendScene: Scene;
    private blendCamera: OrthographicCamera;

    constructor({ damp = 0.96 }: { damp?: number } = {}) {
        super("AfterImageEffect", fragmentShader, {
            blendFunction: BlendFunction.NORMAL,
            uniforms: new Map<string, Uniform>([
                ["damp", new Uniform(damp)],
                ["tOld", new Uniform(null)],
            ]),
        });

        const width = typeof window !== "undefined" ? window.innerWidth : 1024;
        const height = typeof window !== "undefined" ? window.innerHeight : 768;

        const params = {
            magFilter: NearestFilter,
            minFilter: NearestFilter,
            type: HalfFloatType,
        };

        // Create two render targets for ping-pong buffering
        this.textureA = new WebGLRenderTarget(width, height, params);
        this.textureB = new WebGLRenderTarget(width, height, params);

        // Setup blend material for saving the blended result
        this.blendMaterial = new ShaderMaterial({
            uniforms: {
                tNew: { value: null },
                tOld: { value: null },
                damp: { value: damp },
            },
            vertexShader: blendVertexShader,
            fragmentShader: blendFragmentShader,
        });

        this.blendCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.blendScene = new Scene();
        const mesh = new Mesh(new PlaneGeometry(2, 2), this.blendMaterial);
        this.blendScene.add(mesh);
    }

    /**
     * Updates the effect - called every frame
     * We use this to:
     * 1. Provide the previous accumulated frame to our shader
     * 2. Save the current blended result for next frame
     */
    update(renderer: WebGLRenderer, inputBuffer: RenderTargetType): void {
        // Determine read/write buffers
        const readBuffer =
            this.currentBuffer === "A" ? this.textureA : this.textureB;
        const writeBuffer =
            this.currentBuffer === "A" ? this.textureB : this.textureA;

        // Set the accumulated texture for the main effect shader
        this.uniforms.get("tOld")!.value = readBuffer.texture;

        // Now render the blended result to writeBuffer for next frame
        // This blends inputBuffer (current scene) with readBuffer (accumulated)
        this.blendMaterial.uniforms.tNew.value = inputBuffer.texture;
        this.blendMaterial.uniforms.tOld.value = readBuffer.texture;
        this.blendMaterial.uniforms.damp.value = this.uniforms.get("damp")!
            .value as number;

        const currentRT = renderer.getRenderTarget();
        renderer.setRenderTarget(writeBuffer);
        renderer.render(this.blendScene, this.blendCamera);
        renderer.setRenderTarget(currentRT);

        // Swap for next frame
        this.currentBuffer = this.currentBuffer === "A" ? "B" : "A";
    }

    setSize(width: number, height: number): void {
        this.textureA.setSize(width, height);
        this.textureB.setSize(width, height);
    }

    dispose(): void {
        super.dispose();
        this.textureA.dispose();
        this.textureB.dispose();
        this.blendMaterial.dispose();
    }

    get damp(): number {
        return this.uniforms.get("damp")!.value as number;
    }

    set damp(value: number) {
        this.uniforms.get("damp")!.value = value;
    }
}

export interface AfterImageEffectProps {
    /**
     * The damping intensity (0-1).
     * Higher values = longer, more visible trails.
     * @default 0.96
     */
    damp?: number;
}

/**
 * AfterImage post-processing effect for React Three Fiber
 */
export const AfterImageEffect = forwardRef<
    AfterImageEffectImpl,
    AfterImageEffectProps
>(function AfterImageEffect({ damp = 0.96 }, ref) {
    const effect = useMemo(() => new AfterImageEffectImpl({ damp }), [damp]);

    return <primitive ref={ref} object={effect} dispose={null} />;
});
