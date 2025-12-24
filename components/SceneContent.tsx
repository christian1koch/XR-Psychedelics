"use client";

import EffectRenderer from "@/components/EffectRenderer";
import SceneRenderer from "@/components/SceneRenderer";

export default function SceneContent() {
    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <pointLight position={[8, 4, 5]} intensity={0.5} />
            <SceneRenderer />
            <EffectRenderer />
        </>
    );
}
