import { BlendFunction, BrightnessContrastEffect, HueSaturationEffect } from "postprocessing";
import type { EffectSet } from "@/lib/types";
import { WaveDistortionEffectImpl } from "@/shaders/WaveDistortionEffect";
import { ElectricPatternEffectImpl } from "@/shaders/ElectricPatternEffect";

export function createTestEffects(strength: number): EffectSet {
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
