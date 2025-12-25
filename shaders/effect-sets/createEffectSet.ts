import { EffectSet, Trip } from "@/lib/types";
import { createAsciiEffects } from "@/shaders/effect-sets/createAsciiEffects";
import { createAfterImageEffects } from "@/shaders/effect-sets/createAfterImageEffects";
import { createNoEffects } from "@/shaders/effect-sets/createNoEffects";
import { createPixelateEffects } from "@/shaders/effect-sets/createPixelateEffects";
import { createPsychEffects } from "@/shaders/effect-sets/createPsychEffects";
import { createPurpleVoidEffects } from "@/shaders/effect-sets/createPurpleVoidEffects";
import { createShroomEffects } from "@/shaders/effect-sets/createShroomEffects";
import { createTestEffects } from "@/shaders/effect-sets/createTestEffects";

export function createEffectSet(trip: Trip, strength: number): EffectSet {
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
