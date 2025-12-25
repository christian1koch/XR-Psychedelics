import { Vector2 } from "three";
import {
    BlendFunction,
    BloomEffect,
    ChromaticAberrationEffect,
    VignetteEffect,
} from "postprocessing";
import type { EffectSet } from "@/lib/types";
import { NoiseDistortionEffectImpl } from "@/shaders/NoiseDistortionEffect";
import { PsychedelicPaletteEffectImpl } from "@/shaders/PsychedelicPaletteEffect";
import { ElectricPatternEffectImpl } from "@/shaders/ElectricPatternEffect";

export function createShroomEffects(strength: number): EffectSet {
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
