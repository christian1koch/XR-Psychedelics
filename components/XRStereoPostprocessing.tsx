"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useXR } from "@react-three/xr";
import { Color } from "three";
import type { Camera, Scene, Vector4, WebGLRenderer } from "three";
import { EffectComposer, EffectPass, RenderPass } from "postprocessing";
import type { Effect } from "postprocessing";
import { EffectSet } from "@/lib/types";
import { useTripExperience } from "./TripExperienceContext";
import { createEffectSet } from "@/shaders/effect-sets/createEffectSet";

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
