"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Camera, Scene, WebGLRenderer } from "three";
import { EffectComposer, EffectPass, RenderPass } from "postprocessing";
import type { Effect } from "postprocessing";
import type { EffectSet } from "@/lib/types";
import { createEffectSet } from "@/shaders/effect-sets/createEffectSet";
import { useTripExperience } from "./TripExperienceContext";

export default function NonXREffectPostprocessing() {
    const { selectedTrip, strength } = useTripExperience();
    const { gl, scene, camera, size, clock } = useThree();

    const composerRef = useRef<MonoComposer | null>(null);
    const effectSetRef = useRef<EffectSet | null>(null);

    useEffect(() => {
        const effectSet = createEffectSet(selectedTrip, strength);
        effectSetRef.current = effectSet;
        composerRef.current = setupComposer(
            composerRef.current?.composer,
            gl,
            scene,
            camera,
            effectSet.effects
        );

        return () => {
            effectSet.dispose();
        };
    }, [camera, gl, scene, selectedTrip, strength]);

    useEffect(() => {
        if (!composerRef.current) {
            return;
        }
        composerRef.current.composer.setSize(size.width, size.height);
    }, [size.height, size.width]);

    useFrame((_state, delta) => {
        const effectSet = effectSetRef.current;
        const composer = composerRef.current;

        if (!effectSet || !composer) {
            return;
        }

        effectSet.updateParams?.(strength);
        effectSet.updateFrame?.(delta, clock.getElapsedTime(), strength);
        composer.composer.render(delta);
    }, 1);

    return null;
}

type MonoComposer = {
    composer: EffectComposer;
    renderPass: RenderPass;
    effectPass?: EffectPass;
};

function setupComposer(
    existing: EffectComposer | undefined,
    gl: WebGLRenderer,
    scene: Scene,
    camera: Camera,
    effects: Effect[]
): MonoComposer {
    const composer = existing ?? new EffectComposer(gl);
    composer.removeAllPasses();

    const renderPass = new RenderPass(scene, camera);
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
