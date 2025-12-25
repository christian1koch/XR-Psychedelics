import { BlendFunction, BrightnessContrastEffect, HueSaturationEffect } from "postprocessing";
import type { EffectSet } from "@/lib/types";
import { AfterImageEffectImpl } from "@/shaders/AfterimageEffect";
import { ElectricPatternEffectImpl } from "@/shaders/ElectricPatternEffect";
import { WaveDistortionEffectImpl } from "@/shaders/WaveDistortionEffect";

export function createPurpleVoidEffects(strength: number): EffectSet {
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

function clamp(value: number, min = 0, max = 1) {
    return Math.max(min, Math.min(max, value));
}
