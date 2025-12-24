"use client";
import { Canvas } from "@react-three/fiber";
import { FirstPersonCamera } from "@/components/FirstPersonCamera";
import { TripScene, SceneInitialPositions } from "@/lib/types";
import EffectRenderer from "@/components/EffectRenderer";
import SceneRenderer from "@/components/SceneRenderer";
import {
    TripExperienceProvider,
    useTripExperience,
} from "@/components/TripExperienceContext";
import Controllers2D from "@/components/Controllers2D";

const InitialPositions: SceneInitialPositions = {
    Metro: [8, 3, 5],
    Forest: [8, 3, 5],
};

function DemoContent() {
    const { selectedScene } = useTripExperience();

    return (
        <>
            <Controllers2D />
            <Canvas
                className="canvas"
                camera={{ fov: 75, near: 0.1, far: 1000 }}
            >
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[8, 4, 5]} intensity={0.5} />
                <FirstPersonCamera
                    key={selectedScene}
                    initialCameraPos={InitialPositions[TripScene.Metro]}
                />
                <SceneRenderer />
                <EffectRenderer />
            </Canvas>
        </>
    );
}

export default function DemoPage() {
    return (
        <TripExperienceProvider>
            <DemoContent />
        </TripExperienceProvider>
    );
}
