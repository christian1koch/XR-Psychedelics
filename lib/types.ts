import type { Effect } from "postprocessing";

export enum Trip {
    NONE = "None",
    ASCII = "ASCII",
    Shroom = "Shroom",
    AfterImage = "AfterImage (dizzy 🤮)",
    CustomPixelate = "CustomPixelate",
    Test = "Test",
    PurpleVoid = "PurpleVoid",
    Psych = "Psych",
}

export interface SelectionProps<T> {
    selectedItem: T;
    onItemSelect: (item: T) => void;
}

export enum TripScene {
    Metro = "Metro",
    Forest = "Forest",
}

export type SceneInitialPositions = {
    [tripScene in TripScene]: [number, number, number];
};

export type EffectSet = {
    effects: Effect[];
    updateParams?: (strength: number) => void;
    updateFrame?: (delta: number, elapsed: number, strength: number) => void;
    dispose: () => void;
};
