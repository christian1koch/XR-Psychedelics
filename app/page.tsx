"use client";
import { Canvas } from "@react-three/fiber";
import { XR, createXRStore, XROrigin } from "@react-three/xr";
import { TripScene, SceneInitialPositions } from "@/lib/types";
import SceneContent from "@/components/SceneContent";
import { TripExperienceProvider } from "@/components/TripExperienceContext";
import Controllers2D from "@/components/Controllers2D";

const store = createXRStore();

const InitialPositions: SceneInitialPositions = {
    Metro: [8, 2.5, 5],
    Forest: [8, 2.5, 5],
    Cinema: [8, 2.5, 5],
    Interrogation: [8, 2.5, 5],
};

export default function App() {
    return (
        <TripExperienceProvider>
            <Controllers2D />
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                    className="rounded bg-white p-2 text-black"
                    onClick={() => store.enterVR()}
                >
                    Enter VR
                </button>
                <button
                    className="rounded bg-white p-2 text-black"
                    onClick={() => store.enterAR()}
                >
                    Enter AR
                </button>
            </div>
            <Canvas
                style={{ height: "100vh" }}
                camera={{ position: [0, 0, 0] }}
            >
                <XR store={store}>
                    <XROrigin>
                        <SceneContent />
                    </XROrigin>
                </XR>
            </Canvas>
        </TripExperienceProvider>
    );
}
