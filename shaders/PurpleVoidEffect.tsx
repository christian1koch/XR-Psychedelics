"use client";
import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import {
    BlendFunction,
    BrightnessContrastEffect,
    HueSaturationEffect,
} from "postprocessing";

import {
    WaveDistortionEffect,
    WaveDistortionEffectImpl,
} from "./WaveDistortionEffect";
import { AfterImageEffect, AfterImageEffectImpl } from "./AfterimageEffect";
import {
    ElectricPatternEffect,
    ElectricPatternEffectImpl,
} from "./ElectricPatternEffect";
/**
 * PurpleVoidEffect
 * Composes several existing effects (WaveDistortion, BrightnessContrast, AfterImage,
 * ElectricPattern, HueSaturation) and animates parameters with useFrame for a fluid,
 * psychedelic look.
 *
 * Usage: place <PurpleVoidEffect /> inside your EffectComposer / effects list.
 */
export function PurpleVoidEffect({
    speed = 1,
    strength = 1,
}: {
    speed?: number;
    strength?: number;
}) {
    const waveRef = useRef<WaveDistortionEffectImpl | null>(null);
    const afterRef = useRef<AfterImageEffectImpl | null>(null);
    const electricRef = useRef<ElectricPatternEffectImpl | null>(null);

    // Manual effect instances
    const brightnessEffect = useMemo(
        () => new BrightnessContrastEffect({ brightness: 0, contrast: 0 }),
        []
    );
    const hueEffect = useMemo(
        () =>
            new HueSaturationEffect({
                hue: 0,
                saturation: 0,
                blendFunction: BlendFunction.LINEAR_DODGE,
            }),
        []
    );

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        const ts = t * speed; // scaled time for global speed control

        // Wave: subtle breathing + layered motion
        const w = waveRef.current;
        if (w) {
            w.amplitude = (0.009 + Math.sin(ts * 1.25) * 0.004) * strength; // 0.005..0.013
            w.frequency = 8.0 + Math.cos(ts * 0.8) * 2.5; // 5.5..10.5
            w.speed = 0.6 + Math.sin(ts * 0.4) * 0.4; // 0.2..1.0
        }

        // AfterImage: trail length pulses gently
        const a = afterRef.current;
        if (a) {
            // keep the damp mostly high for visible trails but pulse slightly
            a.damp = (0.86 + (Math.sin(ts * 0.35) + 1.0) * 0.02) * strength; // ~0.86..0.90
        }

        // Electric pattern: flash intensity and scale movement
        const e = electricRef.current;
        if (e) {
            // fast pulsing intensity in bright spots
            e.intensity =
                (0.35 + Math.max(0, Math.sin(ts * 3.0)) * 0.9) * strength; // 0.35..1.25
            e.scale = 0.45 + (Math.sin(ts * 1.6) + 1.0) * 0.25; // ~0.45..0.95
            e.speed = 0.01 + Math.abs(Math.sin(ts * 0.9)) * 0.04; // ~0.01..0.05

            // gently shift colors over time (keep within 0..1)
            const ca = [141 / 255, 232 / 255, 189 / 255];
            const cb = [141 / 255, 89 / 255, 232 / 255];
            const hueShift = (Math.sin(ts * 0.6) + 1) * 0.08; // small tint shift
            // nudge green/blue channels for a subtle color sweep
            e.colorA = [
                clamp(ca[0] + hueShift * 0.2, 0, 1),
                clamp(ca[1] + hueShift, 0, 1),
                clamp(ca[2] + hueShift * 0.6, 0, 1),
            ];
            e.colorB = [
                clamp(cb[0] + hueShift * 0.3, 0, 1),
                clamp(cb[1] + hueShift * 0.4, 0, 1),
                clamp(cb[2] + hueShift * 0.9, 0, 1),
            ];
        }

        // Brightness & Contrast: subtle breathing to make flashes pop
        const b = brightnessEffect;
        if (b) {
            // Scaled down for standard effect range (-1 to 1)
            const rawBrightNormalized =
                (0.2 + Math.sin(ts * 0.7) * 0.1) * strength;
            b.brightness = clamp(rawBrightNormalized, -0.5, 0.5);

            const rawContrast = (0.2 + Math.cos(ts * 0.5) * 0.1) * strength;
            b.contrast = clamp(rawContrast, -0.5, 0.5);
        }

        // Hue/Saturation: rotate hue slowly + slight saturation bounce
        const h = hueEffect;
        if (h) {
            h.hue = Math.sin(ts * 0.15) * (Math.PI / 3) * strength; // -pi/3 .. pi/3
            h.saturation = (0.95 + Math.sin(ts * 0.9) * 0.05) * strength; // slight wobble
        }
    });

    return (
        <>
            <WaveDistortionEffect
                ref={waveRef}
                amplitude={0.01}
                frequency={9}
                speed={0.5}
            />
            <primitive object={brightnessEffect} dispose={null} />
            <ElectricPatternEffect
                ref={electricRef}
                intensity={0.5}
                scale={0.5}
                speed={0.02}
                colorA={[141 / 255, 232 / 255, 189 / 255]}
                colorB={[141 / 255, 89 / 255, 232 / 255]}
            />
            <primitive object={hueEffect} dispose={null} />
            <AfterImageEffect ref={afterRef} damp={0.96} />
        </>
    );
}

function clamp(v: number, a = 0, b = 1) {
    return Math.max(a, Math.min(b, v));
}

export default PurpleVoidEffect;
