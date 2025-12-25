"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useXR } from "@react-three/xr";
import { Color, Vector2 } from "three";
import type { Camera, Scene, Vector4, WebGLRenderer } from "three";
import {
    ASCIIEffect,
    ASCIITexture,
    BlendFunction,
    BloomEffect,
    BrightnessContrastEffect,
    ChromaticAberrationEffect,
    EffectComposer,
    EffectPass,
    HueSaturationEffect,
    NoiseEffect,
    RenderPass,
    VignetteEffect,
} from "postprocessing";
import type { Effect } from "postprocessing";
import { Trip } from "@/lib/types";
import { useTripExperience } from "./TripExperienceContext";
import { NoiseDistortionEffectImpl } from "@/shaders/NoiseDistortionEffect";
import { PsychedelicPaletteEffectImpl } from "@/shaders/PsychedelicPaletteEffect";
import { ElectricPatternEffectImpl } from "@/shaders/ElectricPatternEffect";
import { AfterImageEffectImpl } from "@/shaders/AfterimageEffect";
import { PixelateEffect } from "@/shaders/CustomPixelEffect";
import { WaveDistortionEffectImpl } from "@/shaders/WaveDistortionEffect";
import { PsychEffectImpl } from "@/shaders/PsychEffect";

type EffectSet = {
    effects: Effect[];
    updateParams?: (strength: number) => void;
    updateFrame?: (delta: number, elapsed: number, strength: number) => void;
    dispose: () => void;
};

type StereoComposer = {
    composer: EffectComposer;
    renderPass: RenderPass;
    effectPass?: EffectPass;
};

export default function XRStereoPostprocessing() {
    const { selectedTrip, strength } = useTripExperience();
    const { mode } = useXR();
    const { gl, scene, camera, clock } = useThree();

    const isPresenting = mode === "immersive-vr" || mode === "immersive-ar";

    // One composer per eye to keep stereo effects isolated.
    const composersRef = useRef<{
        left?: StereoComposer;
        right?: StereoComposer;
    }>({});
    // Each eye gets its own effect instances to avoid shared uniforms.
    const effectSetsRef = useRef<{
        left?: EffectSet;
        right?: EffectSet;
    }>({});

    useEffect(() => {
        // Rebuild effects/composers when trip or strength changes.
        effectSetsRef.current.left?.dispose();
        effectSetsRef.current.right?.dispose();

        const leftSet = createEffectSet(selectedTrip, strength);
        const rightSet = createEffectSet(selectedTrip, strength);

        effectSetsRef.current.left = leftSet ?? undefined;
        effectSetsRef.current.right = rightSet ?? undefined;

        composersRef.current.left = setupComposer(
            composersRef.current.left?.composer,
            gl,
            scene,
            camera,
            leftSet.effects
        );
        composersRef.current.right = setupComposer(
            composersRef.current.right?.composer,
            gl,
            scene,
            camera,
            rightSet.effects
        );

        const cleanupLeft = leftSet;
        const cleanupRight = rightSet;

        return () => {
            cleanupLeft?.dispose();
            cleanupRight?.dispose();
        };
    }, [camera, gl, scene, selectedTrip, strength]);

    useFrame((state, delta) => {
        // Only run this pipeline inside an XR session.
        if (!isPresenting) {
            return;
        }

        const leftSet = effectSetsRef.current.left;
        const rightSet = effectSetsRef.current.right;
        const leftComposer = composersRef.current.left;
        const rightComposer = composersRef.current.right;

        if (!leftSet || !rightSet || !leftComposer || !rightComposer) {
            return;
        }

        // Pull the real XR eye cameras from the renderer.
        const xrManager = state.gl.xr as unknown as {
            getCamera: () => { cameras: Array<Camera & { viewport?: Vector4 }> };
            updateCamera: (camera: Camera) => void;
        };
        xrManager.updateCamera(state.camera);
        const xrCamera = xrManager.getCamera();
        const leftEye = xrCamera.cameras[0];
        const rightEye = xrCamera.cameras[1];

        if (!leftEye || !rightEye) {
            return;
        }

        // Update effect uniforms and time-based animations.
        leftSet.updateParams?.(strength);
        rightSet.updateParams?.(strength);

        const elapsed = clock.getElapsedTime();
        leftSet.updateFrame?.(delta, elapsed, strength);
        rightSet.updateFrame?.(delta, elapsed, strength);

        // Disable auto clear so we can draw both eyes into one frame.
        const prevAutoClear = gl.autoClear;
        gl.autoClear = false;
        gl.setScissorTest(true);

        // Save the main camera state so we can restore it later.
        const prevProjection = state.camera.projectionMatrix.clone();
        const prevProjectionInverse = state.camera.projectionMatrixInverse.clone();
        const prevMatrixWorld = state.camera.matrixWorld.clone();
        const prevMatrixWorldInverse = state.camera.matrixWorldInverse.clone();
        const prevPosition = state.camera.position.clone();
        const prevQuaternion = state.camera.quaternion.clone();
        const prevScale = state.camera.scale.clone();

        // Render left eye.
        state.camera.matrixWorld.copy(leftEye.matrixWorld);
        state.camera.matrixWorldInverse.copy(leftEye.matrixWorldInverse);
        state.camera.projectionMatrix.copy(leftEye.projectionMatrix);
        state.camera.projectionMatrixInverse.copy(leftEye.projectionMatrixInverse);
        state.camera.position.copy(leftEye.position);
        state.camera.quaternion.copy(leftEye.quaternion);
        state.camera.scale.copy(leftEye.scale);
        renderEye(gl, leftComposer, leftEye, delta);

        // Render right eye.
        state.camera.matrixWorld.copy(rightEye.matrixWorld);
        state.camera.matrixWorldInverse.copy(rightEye.matrixWorldInverse);
        state.camera.projectionMatrix.copy(rightEye.projectionMatrix);
        state.camera.projectionMatrixInverse.copy(rightEye.projectionMatrixInverse);
        state.camera.position.copy(rightEye.position);
        state.camera.quaternion.copy(rightEye.quaternion);
        state.camera.scale.copy(rightEye.scale);
        renderEye(gl, rightComposer, rightEye, delta);

        // Restore the main camera so the rest of the frame is consistent.
        state.camera.matrixWorld.copy(prevMatrixWorld);
        state.camera.matrixWorldInverse.copy(prevMatrixWorldInverse);
        state.camera.projectionMatrix.copy(prevProjection);
        state.camera.projectionMatrixInverse.copy(prevProjectionInverse);
        state.camera.position.copy(prevPosition);
        state.camera.quaternion.copy(prevQuaternion);
        state.camera.scale.copy(prevScale);

        gl.setScissorTest(false);
        gl.autoClear = prevAutoClear;
    }, 1);

    return null;
}

function setupComposer(
    existing: EffectComposer | undefined,
    gl: WebGLRenderer,
    scene: Scene,
    camera: Camera,
    effects: Effect[]
): StereoComposer {
    // Build the pass chain for a single eye.
    const composer = existing ?? new EffectComposer(gl);
    composer.removeAllPasses();

    const renderPass = new RenderPass(scene, camera);
    renderPass.clearPass.overrideClearColor = new Color(0x000000);
    renderPass.clearPass.overrideClearAlpha = 1;
    composer.addPass(renderPass);

    let effectPass: EffectPass | undefined;
    if (effects.length > 0) {
        effectPass = new EffectPass(camera, ...effects);
        effectPass.renderToScreen = true;
        composer.addPass(effectPass);
    } else {
        renderPass.renderToScreen = true;
    }

    return { composer, renderPass, effectPass };
}

function renderEye(
    gl: WebGLRenderer,
    stereo: StereoComposer,
    eyeCamera: Camera & { viewport?: Vector4 },
    delta: number
) {
    // Each XR eye provides a viewport inside the shared framebuffer.
    const viewport = eyeCamera.viewport;
    if (!viewport) {
        return;
    }

    const width = Math.max(1, Math.floor(viewport.z));
    const height = Math.max(1, Math.floor(viewport.w));

    // Match the composer buffers to the eye viewport.
    stereo.composer.setSize(width, height);
    const prevClearColor = new Color();
    gl.getClearColor(prevClearColor);
    const prevClearAlpha = gl.getClearAlpha();

    gl.setClearColor(0x000000, 1);
    gl.setViewport(viewport.x, viewport.y, width, height);
    gl.setScissor(viewport.x, viewport.y, width, height);
    gl.clear();

    // Force the effect chain to render into the XR render target.
    stereo.composer.setMainCamera(eyeCamera);
    const xrRenderTarget = gl.getRenderTarget();
    const originalSetRenderTarget = gl.setRenderTarget.bind(gl);
    const prevXrEnabled = gl.xr.enabled;
    gl.xr.enabled = false;
    if (xrRenderTarget) {
        gl.setRenderTarget = ((target, ...args) => {
            if (target === null) {
                const result = originalSetRenderTarget(xrRenderTarget, ...args);
                // Re-apply the eye viewport after internal target switches.
                gl.setViewport(viewport.x, viewport.y, width, height);
                gl.setScissor(viewport.x, viewport.y, width, height);
                gl.setScissorTest(true);
                return result;
            }
            return originalSetRenderTarget(target, ...args);
        }) as typeof gl.setRenderTarget;
    }

    // Render all passes for this eye.
    stereo.composer.render(delta);

    if (xrRenderTarget) {
        gl.setRenderTarget = originalSetRenderTarget;
    }
    gl.xr.enabled = prevXrEnabled;

    gl.setClearColor(prevClearColor, prevClearAlpha);
}

function createEffectSet(trip: Trip, strength: number): EffectSet {
    // Map the selected trip to the right effect stack.
    switch (trip) {
        case Trip.Shroom:
            return createShroomEffects(strength);
        case Trip.ASCII:
            return createAsciiEffects(strength);
        case Trip.AfterImage:
            return createAfterImageEffects(strength);
        case Trip.CustomPixelate:
            return createPixelateEffects(strength);
        case Trip.Test:
            return createTestEffects(strength);
        case Trip.PurpleVoid:
            return createPurpleVoidEffects(strength);
        case Trip.Psych:
            return createPsychEffects(strength);
        default:
            return createNoEffects();
    }
}

function createNoEffects(): EffectSet {
    return {
        effects: [],
        dispose: () => {},
    };
}

function createShroomEffects(strength: number): EffectSet {
    const noise = new NoiseDistortionEffectImpl(0.5 * strength, 4, 0.2);
    const chromatic = new ChromaticAberrationEffect({
        offset: new Vector2(0.004 * strength, 0.004 * strength),
        modulationOffset: 0.5,
        radialModulation: false,
    });
    const palette = new PsychedelicPaletteEffectImpl(
        1.0 * strength,
        0.5 * strength
    );
    const electric = new ElectricPatternEffectImpl(1.0 * strength, 8.0, 0.5);
    const bloom = new BloomEffect({
        intensity: 1.5 * strength,
        luminanceThreshold: 0.2,
        luminanceSmoothing: 0.9,
        mipmapBlur: true,
    });
    const vignette = new VignetteEffect({
        darkness: 0.3 * strength,
        offset: 0.3,
        blendFunction: BlendFunction.NORMAL,
    });

    const effects = [noise, chromatic, palette, electric, bloom, vignette];

    return {
        effects,
        updateParams: (s) => {
            noise.strength = 0.5 * s;
            noise.scale = 4;
            noise.speed = 0.2;
            chromatic.offset.set(0.004 * s, 0.004 * s);
            palette.intensity = 1.0 * s;
            palette.saturationBoost = 0.5 * s;
            electric.intensity = 1.0 * s;
            bloom.intensity = 1.5 * s;
            vignette.darkness = 0.3 * s;
        },
        dispose: () => {
            effects.forEach((effect) => effect.dispose());
        },
    };
}

function createAsciiEffects(strength: number): EffectSet {
    const asciiTexture = new ASCIITexture({
        characters: " .:-=+*#%@",
        font: "monospace",
        fontSize: 54,
        cellCount: 16,
    });
    const ascii = new ASCIIEffect({
        asciiTexture,
        cellSize: 16,
        color: "#00ff41",
    });
    const bloom = new BloomEffect({
        intensity: 1.5 * strength,
        luminanceThreshold: 0.2,
        luminanceSmoothing: 0.9,
        mipmapBlur: true,
    });
    const vignette = new VignetteEffect({
        offset: 0.3,
        darkness: 0.1 * strength,
        blendFunction: BlendFunction.NORMAL,
    });
    const noise = new NoiseEffect({ blendFunction: BlendFunction.OVERLAY });
    noise.blendMode.setOpacity(0.05 * strength);

    const effects = [ascii, bloom, vignette, noise];

    return {
        effects,
        updateParams: (s) => {
            bloom.intensity = 1.5 * s;
            vignette.darkness = 0.1 * s;
            noise.blendMode.setOpacity(0.05 * s);
        },
        dispose: () => {
            asciiTexture.dispose();
            effects.forEach((effect) => effect.dispose());
        },
    };
}

function createAfterImageEffects(strength: number): EffectSet {
    const afterImage = new AfterImageEffectImpl({ damp: 0.8 * strength });
    const effects = [afterImage];

    return {
        effects,
        updateParams: (s) => {
            afterImage.damp = 0.8 * s;
        },
        dispose: () => {
            effects.forEach((effect) => effect.dispose());
        },
    };
}

function createPixelateEffects(strength: number): EffectSet {
    const pixelate = new PixelateEffect(
        strength <= 0.01 ? 2048 : 200 / strength
    );
    const effects = [pixelate];

    return {
        effects,
        updateParams: (s) => {
            const pixelSize = s <= 0.01 ? 2048 : 200 / s;
            pixelate.uniforms.get("pixelSize")!.value = pixelSize;
        },
        dispose: () => {
            effects.forEach((effect) => effect.dispose());
        },
    };
}

function createTestEffects(strength: number): EffectSet {
    const wave = new WaveDistortionEffectImpl({
        amplitude: 0.01 * strength,
        frequency: 10,
        speed: 0.5,
    });
    const brightnessContrast = new BrightnessContrastEffect({
        brightness: 0,
        contrast: 0.5 * strength,
    });
    const electric = new ElectricPatternEffectImpl(0.5 * strength, 0.5, 0.02);
    electric.colorA = [141 / 255, 232 / 255, 189 / 255];
    electric.colorB = [141 / 255, 89 / 255, 232 / 255];
    const hueSaturation = new HueSaturationEffect({
        blendFunction: BlendFunction.COLOR_BURN,
        hue: Math.PI / 2,
        saturation: 0.999 * strength,
    });

    const effects = [wave, brightnessContrast, electric, hueSaturation];

    return {
        effects,
        updateParams: (s) => {
            wave.amplitude = 0.01 * s;
            brightnessContrast.contrast = 0.5 * s;
            electric.intensity = 0.5 * s;
            hueSaturation.saturation = 0.999 * s;
        },
        dispose: () => {
            effects.forEach((effect) => effect.dispose());
        },
    };
}

function createPurpleVoidEffects(strength: number): EffectSet {
    const initialStrength = strength;
    const wave = new WaveDistortionEffectImpl({
        amplitude: 0.01 * initialStrength,
        frequency: 9,
        speed: 0.5,
    });
    const brightness = new BrightnessContrastEffect({
        brightness: 0,
        contrast: 0,
    });
    const electric = new ElectricPatternEffectImpl(
        0.5 * initialStrength,
        0.5,
        0.02
    );
    electric.colorA = [141 / 255, 232 / 255, 189 / 255];
    electric.colorB = [141 / 255, 89 / 255, 232 / 255];
    const hue = new HueSaturationEffect({
        hue: 0,
        saturation: 0,
        blendFunction: BlendFunction.LINEAR_DODGE,
    });
    const afterImage = new AfterImageEffectImpl({
        damp: clamp(0.96 * initialStrength, 0, 0.99),
    });

    const effects = [wave, brightness, electric, hue, afterImage];

    return {
        effects,
        updateFrame: (_delta, elapsed, s) => {
            const ts = elapsed;

            wave.amplitude = (0.009 + Math.sin(ts * 1.25) * 0.004) * s;
            wave.frequency = 8.0 + Math.cos(ts * 0.8) * 2.5;
            wave.speed = 0.6 + Math.sin(ts * 0.4) * 0.4;

            afterImage.damp =
                (0.86 + (Math.sin(ts * 0.35) + 1.0) * 0.02) * s;

            electric.intensity =
                (0.35 + Math.max(0, Math.sin(ts * 3.0)) * 0.9) * s;
            electric.scale = 0.45 + (Math.sin(ts * 1.6) + 1.0) * 0.25;
            electric.speed = 0.01 + Math.abs(Math.sin(ts * 0.9)) * 0.04;

            const ca = [141 / 255, 232 / 255, 189 / 255] as [
                number,
                number,
                number
            ];
            const cb = [141 / 255, 89 / 255, 232 / 255] as [
                number,
                number,
                number
            ];
            const hueShift = (Math.sin(ts * 0.6) + 1) * 0.08;
            electric.colorA = [
                clamp(ca[0] + hueShift * 0.2, 0, 1),
                clamp(ca[1] + hueShift, 0, 1),
                clamp(ca[2] + hueShift * 0.6, 0, 1),
            ];
            electric.colorB = [
                clamp(cb[0] + hueShift * 0.3, 0, 1),
                clamp(cb[1] + hueShift * 0.4, 0, 1),
                clamp(cb[2] + hueShift * 0.9, 0, 1),
            ];

            brightness.brightness = clamp(
                (0.2 + Math.sin(ts * 0.7) * 0.1) * s,
                -0.5,
                0.5
            );
            brightness.contrast = clamp(
                (0.2 + Math.cos(ts * 0.5) * 0.1) * s,
                -0.5,
                0.5
            );

            hue.hue = Math.sin(ts * 0.15) * (Math.PI / 3) * s;
            hue.saturation = (0.95 + Math.sin(ts * 0.9) * 0.05) * s;
        },
        updateParams: (s) => {
            wave.amplitude = 0.01 * s;
        },
        dispose: () => {
            effects.forEach((effect) => effect.dispose());
        },
    };
}

function createPsychEffects(strength: number): EffectSet {
    const psych = new PsychEffectImpl({ intensity: 0.01 * strength });
    const effects = [psych];

    return {
        effects,
        updateParams: (s) => {
            psych.intensity = 0.01 * s;
        },
        dispose: () => {
            effects.forEach((effect) => effect.dispose());
        },
    };
}

function clamp(value: number, min = 0, max = 1) {
    return Math.max(min, Math.min(max, value));
}
