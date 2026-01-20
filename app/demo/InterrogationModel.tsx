"use client";
import React from "react";
import { useGLTF } from "@react-three/drei";
import { ThreeElements } from "@react-three/fiber";
import { Group } from "three";

type InterrogationModelProps = ThreeElements["group"] & {
    ref?: React.Ref<Group>;
};

export function Model({ ref, ...props }: InterrogationModelProps) {
    const { nodes, materials } = useGLTF("/interrogation.glb") as any;
    return (
        <group {...props} dispose={null} ref={ref}>
            <group>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.mirror_1.geometry}
                    material={materials.mirror}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.mirror_2.geometry}
                    material={materials.texture_2}
                />
            </group>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.door.geometry}
                material={materials.texture_3}
                position={[0.85, 1, 2.51]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.slope.geometry}
                material={materials.texture_3}
                position={[1.4, 0, 2.48]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.table.geometry}
                material={materials.texture_2}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.chair_1.geometry}
                material={materials.texture_2}
                position={[-1.295, 0, 0]}
            />
            <group position={[0, 2.255, -2.5]}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.camera_1.geometry}
                    material={materials.mirror}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.camera_2.geometry}
                    material={materials.alpha_0}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.camera_3.geometry}
                    material={materials.texture_3}
                />
            </group>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.vent.geometry}
                material={materials.texture_3}
                position={[-2.5, 2.25, 2.2]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.trashcan.geometry}
                material={materials.texture_2}
                position={[2.265, 0, -2.262]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.light_switch.geometry}
                material={materials.texture_2}
                position={[0.6, 1.3, 2.5]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.button_light_switch.geometry}
                material={materials.texture_2}
                position={[0.6, 1.3, 2.49]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.ashtray.geometry}
                material={materials.texture_2}
                position={[-0.3, 0.86, 0]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.plastic_cup.geometry}
                material={materials.texture_3}
                position={[-0.3, 0.86, 0.2]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.chair_2.geometry}
                material={materials.texture_2}
                position={[-0.212, 0, -1.791]}
                rotation={[0, -1.108, 0]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.interrogation_1.geometry}
                material={materials.light}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.interrogation_2.geometry}
                material={materials.texture_1}
            />
        </group>
    );
}

useGLTF.preload("/interrogation.glb");
