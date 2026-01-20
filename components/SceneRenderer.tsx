import { Model as CinemaModel } from "@/app/demo/CinemaModel";
import { ForestModel } from "@/app/demo/ForestModel";
import { Model as InterrogationModel } from "@/app/demo/InterrogationModel";
import { Model as InterrogationARModel } from "@/app/demo/InterrogationARModel";
import { MetroModel } from "@/app/demo/MetroModel";
import { TripScene } from "@/lib/types";
import { Group, Mesh } from "three";

import { useTripExperience } from "./TripExperienceContext";
import { useXR } from "@react-three/xr";

export default function SceneRenderer() {
    const { mode } = useXR();
    const isAR = mode === "immersive-ar";
    const { selectedScene, collidersRef } = useTripExperience();
    const modelRefCallback = (group: Group | null) => {
        if (group) {
            const meshes: Mesh[] = [];
            group.traverse((child) => {
                if ((child as Mesh).isMesh) {
                    meshes.push(child as Mesh);
                }
            });
            collidersRef.current = meshes;
        }
    };
    return (
        <>
            {selectedScene === TripScene.Empty &&
                // Empty scene for AR passthrough testing - renders nothing
                null}
            {selectedScene === TripScene.Empty && (
                <mesh>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="hotpink" />
                </mesh>
            )}
            {selectedScene === TripScene.Metro && (
                <group position={[-8, -2.5, -5]}>
                    <MetroModel ref={modelRefCallback} />
                </group>
            )}
            {selectedScene === TripScene.Forest && (
                <ForestModel ref={modelRefCallback} />
            )}
            {selectedScene === TripScene.Cinema && (
                <CinemaModel ref={modelRefCallback} />
            )}
            {selectedScene === TripScene.Interrogation &&
                (isAR ? (
                    <InterrogationARModel ref={modelRefCallback} />
                ) : (
                    <InterrogationModel ref={modelRefCallback} />
                ))}
        </>
    );
}
