"use client";
import { useXR } from "@react-three/xr";
import XRStereoPostprocessing from "./XRStereoPostprocessing";
import NonXREffectPostprocessing from "./NonXREffectPostprocessing";

export default function EffectRenderer() {
    const { mode } = useXR();
    const isPresenting = mode === "immersive-vr" || mode === "immersive-ar";

    if (isPresenting) {
        return <XRStereoPostprocessing />;
    }

    return <NonXREffectPostprocessing />;
}
