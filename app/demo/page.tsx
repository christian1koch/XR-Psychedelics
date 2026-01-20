"use client";
import { Canvas } from "@react-three/fiber";
import { FirstPersonCamera } from "@/components/FirstPersonCamera";
import {
    TripExperienceProvider,
    useTripExperience,
} from "@/components/TripExperienceContext";
import Controllers2D from "@/components/Controllers2D";
import SceneContent from "@/components/SceneContent";
import { InitialPositions } from "@/lib/constants";

function DemoContent() {
    const { selectedScene } = useTripExperience();

    return (
        <>
            <Controllers2D />
            <Canvas
                className="canvas"
                camera={{ fov: 75, near: 0.1, far: 1000 }}
            >
                <FirstPersonCamera
                    key={selectedScene}
                    initialCameraPos={InitialPositions[selectedScene]}
                />
                <SceneContent />
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
