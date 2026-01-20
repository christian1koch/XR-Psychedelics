import { Model as CinemaModel } from "@/app/demo/CinemaModel";
import { CinemaARModel } from "@/app/demo/CinemaARModel";
import { ForestModel } from "@/app/demo/ForestModel";
import { ForestARModel } from "@/app/demo/ForestARModel";
import { Model as InterrogationModel } from "@/app/demo/InterrogationModel";
import { Model as InterrogationARModel } from "@/app/demo/InterrogationARModel";
import { MetroModel } from "@/app/demo/MetroModel";
import { MetroARModel } from "@/app/demo/MetroARModel";
import { InitialPositions } from "@/lib/constants";
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
                <group position={InitialPositions.Empty}>
                    <mesh>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshStandardMaterial color="hotpink" />
                    </mesh>
                </group>
            )}
            {selectedScene === TripScene.Metro &&
                (isAR ? (
                    <group position={InitialPositions.Metro}>
                        <MetroARModel ref={modelRefCallback} />
                    </group>
                ) : (
                    <group position={InitialPositions.Metro}>
                        <MetroModel ref={modelRefCallback} />
                    </group>
                ))}
            {selectedScene === TripScene.Forest &&
                (isAR ? (
                    <group position={InitialPositions.Forest}>
                        <ForestARModel ref={modelRefCallback} />
                    </group>
                ) : (
                    <group position={InitialPositions.Forest}>
                        <ForestModel ref={modelRefCallback} />
                    </group>
                ))}
            {selectedScene === TripScene.Cinema &&
                (isAR ? (
                    <group position={InitialPositions.Cinema}>
                        <CinemaARModel ref={modelRefCallback} />
                    </group>
                ) : (
                    <group position={InitialPositions.Cinema}>
                        <CinemaModel ref={modelRefCallback} />
                    </group>
                ))}
            {selectedScene === TripScene.Interrogation &&
                (isAR ? (
                    <group position={InitialPositions.Interrogation}>
                        <InterrogationARModel ref={modelRefCallback} />
                    </group>
                ) : (
                    <group position={InitialPositions.Interrogation}>
                        <InterrogationModel ref={modelRefCallback} />
                    </group>
                ))}
        </>
    );
}
