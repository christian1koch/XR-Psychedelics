import type { EffectSet } from "@/lib/types";

export function createNoEffects(): EffectSet {
    return {
        effects: [],
        dispose: () => {},
    };
}
