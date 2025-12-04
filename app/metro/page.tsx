"use client";
import { ASCIIEffect, MatrixEffect } from "@/shaders";
import { AnimatedShroomPostFX } from "@/shaders/Shroom";
import { useGLTF, PointerLockControls } from "@react-three/drei";
import { Canvas, ThreeElements, useThree, useFrame } from "@react-three/fiber";
import { forwardRef, useEffect, useRef, MutableRefObject } from "react";
import { Group, Vector3, Raycaster, Mesh } from "three";

// First-person camera with collision detection
function FirstPersonCamera({
    collidersRef,
}: {
    collidersRef: MutableRefObject<Mesh[]>;
}) {
    const { camera } = useThree();
    const direction = useRef(new Vector3());
    const raycaster = useRef(new Raycaster());

    const moveState = useRef({
        forward: false,
        backward: false,
        left: false,
        right: false,
    });

    const SPEED = 5;
    const COLLISION_DISTANCE = 0.5;

    useEffect(() => {
        // Start inside the metro station
        camera.position.set(8, 3, 5);

        const onKeyDown = (e: KeyboardEvent) => {
            switch (e.code) {
                case "KeyW":
                case "ArrowUp":
                    moveState.current.forward = true;
                    break;
                case "KeyS":
                case "ArrowDown":
                    moveState.current.backward = true;
                    break;
                case "KeyA":
                case "ArrowLeft":
                    moveState.current.left = true;
                    break;
                case "KeyD":
                case "ArrowRight":
                    moveState.current.right = true;
                    break;
            }
        };

        const onKeyUp = (e: KeyboardEvent) => {
            switch (e.code) {
                case "KeyW":
                case "ArrowUp":
                    moveState.current.forward = false;
                    break;
                case "KeyS":
                case "ArrowDown":
                    moveState.current.backward = false;
                    break;
                case "KeyA":
                case "ArrowLeft":
                    moveState.current.left = false;
                    break;
                case "KeyD":
                case "ArrowRight":
                    moveState.current.right = false;
                    break;
            }
        };

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
        };
    }, [camera]);

    useFrame((_, delta) => {
        const { forward, backward, left, right } = moveState.current;

        // Get camera direction
        direction.current.set(0, 0, 0);

        const frontVector = new Vector3(
            0,
            0,
            Number(backward) - Number(forward)
        );
        const sideVector = new Vector3(Number(left) - Number(right), 0, 0);

        direction.current
            .subVectors(frontVector, sideVector)
            .normalize()
            .multiplyScalar(SPEED * delta)
            .applyEuler(camera.rotation);

        // Only move horizontally (no flying)
        direction.current.y = 0;

        // Check collision before moving
        if (direction.current.length() > 0 && collidersRef.current.length > 0) {
            const newPosition = camera.position.clone().add(direction.current);

            // Cast rays in movement direction
            raycaster.current.set(
                camera.position,
                direction.current.clone().normalize()
            );
            const intersects = raycaster.current.intersectObjects(
                collidersRef.current,
                true
            );

            if (
                intersects.length === 0 ||
                intersects[0].distance > COLLISION_DISTANCE
            ) {
                camera.position.copy(newPosition);
            }
        }
    });

    return <PointerLockControls />;
}

export default function MetroPage() {
    const collidersRef = useRef<Mesh[]>([]);

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
        <Canvas camera={{ fov: 75, near: 0.1, far: 1000 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <pointLight position={[8, 4, 5]} intensity={0.5} />
            <FirstPersonCamera collidersRef={collidersRef} />
            <Model ref={modelRefCallback} />
            <AnimatedShroomPostFX />
        </Canvas>
    );
}

const Model = forwardRef<Group, ThreeElements["group"]>(
    function Model(props, ref) {
        const { nodes, materials } = useGLTF("/Metro.glb") as any;
        return (
            <group {...props} dispose={null} ref={ref}>
                <group
                    position={[11.978, 3.714, 1.086]}
                    rotation={[-Math.PI, Math.PI / 2, 0]}
                    scale={-0.756}
                >
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.St_01_1.geometry}
                        material={materials.Tiles}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.St_01_2.geometry}
                        material={materials.TactilePaving}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.St_01_3.geometry}
                        material={materials.road_rails}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.St_01_4.geometry}
                        material={materials.tile_tile}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.St_01_5.geometry}
                        material={materials.metal_02}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.St_01_6.geometry}
                        material={materials.ConcreteBare}
                    />
                </group>
                <group
                    position={[8.097, 2.901, 6.79]}
                    rotation={[0, -Math.PI / 2, 0]}
                    scale={1.875}
                >
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.subway_car_1.geometry}
                        material={materials.metal}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.subway_car_2.geometry}
                        material={materials.metal_01}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.subway_car_3.geometry}
                        material={materials.metal_03}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.subway_car_4.geometry}
                        material={materials.Floor}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.subway_car_5.geometry}
                        material={materials.metal_04}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.subway_car_6.geometry}
                        material={materials.Trains_01}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.subway_car_7.geometry}
                        material={materials.metal_02}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.subway_car_8.geometry}
                        material={materials.Trains}
                    />
                </group>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.seats.geometry}
                    material={materials.seats}
                    position={[9.616, 1.922, 3.257]}
                    scale={-0.031}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.seats001.geometry}
                    material={materials.seats}
                    position={[9.616, 1.922, -2.061]}
                    scale={-0.031}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Railing_V.geometry}
                    material={materials.metal_05}
                    position={[9.343, 3.268, 3.295]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Railing_V001.geometry}
                    material={materials.metal_05}
                    position={[9.389, 3.084, -2.056]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.seats002.geometry}
                    material={materials.seats}
                    position={[9.616, 1.922, 10.231]}
                    scale={-0.031}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Railing_V002.geometry}
                    material={materials.metal_05}
                    position={[9.343, 3.268, 10.269]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.seats003.geometry}
                    material={materials.seats}
                    position={[9.616, 1.922, 15.64]}
                    scale={-0.031}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Railing_V003.geometry}
                    material={materials.metal_05}
                    position={[9.389, 3.084, 15.645]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.seats004.geometry}
                    material={materials.seats}
                    position={[6.574, 1.922, 3.257]}
                    rotation={[-Math.PI, 0, 0]}
                    scale={0.031}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.seats005.geometry}
                    material={materials.seats}
                    position={[6.574, 1.922, -2.061]}
                    rotation={[-Math.PI, 0, 0]}
                    scale={0.031}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Railing_V004.geometry}
                    material={materials.metal_05}
                    position={[6.847, 3.268, 3.295]}
                    rotation={[-Math.PI, 0, 0]}
                    scale={-1}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Railing_V005.geometry}
                    material={materials.metal_05}
                    position={[6.801, 3.084, -2.056]}
                    rotation={[-Math.PI, 0, 0]}
                    scale={-1}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.seats006.geometry}
                    material={materials.seats}
                    position={[6.574, 1.922, 10.231]}
                    rotation={[-Math.PI, 0, 0]}
                    scale={0.031}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Railing_V006.geometry}
                    material={materials.metal_05}
                    position={[6.847, 3.268, 10.269]}
                    rotation={[-Math.PI, 0, 0]}
                    scale={-1}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.seats007.geometry}
                    material={materials.seats}
                    position={[6.574, 1.922, 15.64]}
                    rotation={[-Math.PI, 0, 0]}
                    scale={0.031}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Railing_V007.geometry}
                    material={materials.metal_05}
                    position={[6.801, 3.084, 15.645]}
                    rotation={[-Math.PI, 0, 0]}
                    scale={-1}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Railing_V008.geometry}
                    material={materials.metal_05}
                    position={[8.097, 4.231, 10.662]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Railing_V009.geometry}
                    material={materials.metal_05}
                    position={[8.097, 4.231, 2.941]}
                />
                <group
                    position={[6.293, 2.745, -1.027]}
                    rotation={[0, -1.571, 0]}
                    scale={[1, 1, 0.735]}
                >
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door_1.geometry}
                        material={materials.Door}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door_2.geometry}
                        material={materials.metal_02}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door_3.geometry}
                        material={materials.Glass}
                    />
                </group>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Glass001.geometry}
                    material={materials.Glass}
                    position={[6.31, 3.138, -2.774]}
                />
                <group
                    position={[6.293, 2.745, 0.606]}
                    rotation={[-Math.PI, Math.PI / 2, 0]}
                    scale={[-1, -1, -0.735]}
                >
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door002_1.geometry}
                        material={materials.Door}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door002_2.geometry}
                        material={materials.metal_02}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door002_3.geometry}
                        material={materials.Glass}
                    />
                </group>
                <group
                    position={[6.293, 2.745, 5.973]}
                    rotation={[0, -1.571, 0]}
                    scale={[1, 1, 0.735]}
                >
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door003_1.geometry}
                        material={materials.Door}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door003_2.geometry}
                        material={materials.metal_02}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door003_3.geometry}
                        material={materials.Glass}
                    />
                </group>
                <group
                    position={[6.293, 2.745, 7.605]}
                    rotation={[-Math.PI, Math.PI / 2, 0]}
                    scale={[-1, -1, -0.735]}
                >
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door004_1.geometry}
                        material={materials.Door}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door004_2.geometry}
                        material={materials.metal_02}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door004_3.geometry}
                        material={materials.Glass}
                    />
                </group>
                <group
                    position={[6.293, 2.745, 12.959]}
                    rotation={[0, -1.571, 0]}
                    scale={[1, 1, 0.735]}
                >
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door005_1.geometry}
                        material={materials.Door}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door005_2.geometry}
                        material={materials.metal_02}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door005_3.geometry}
                        material={materials.Glass}
                    />
                </group>
                <group
                    position={[6.293, 2.745, 14.591]}
                    rotation={[-Math.PI, Math.PI / 2, 0]}
                    scale={[-1, -1, -0.735]}
                >
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door006_1.geometry}
                        material={materials.Door}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door006_2.geometry}
                        material={materials.metal_02}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door006_3.geometry}
                        material={materials.Glass}
                    />
                </group>
                <group
                    position={[9.904, 2.745, -1.027]}
                    rotation={[0, -1.571, 0]}
                    scale={[1, 1, 0.735]}
                >
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door007_1.geometry}
                        material={materials.Door}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door007_2.geometry}
                        material={materials.metal_02}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door007_3.geometry}
                        material={materials.Glass}
                    />
                </group>
                <group
                    position={[9.904, 2.745, 0.606]}
                    rotation={[-Math.PI, Math.PI / 2, 0]}
                    scale={[-1, -1, -0.735]}
                >
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door008_1.geometry}
                        material={materials.Door}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door008_2.geometry}
                        material={materials.metal_02}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door008_3.geometry}
                        material={materials.Glass}
                    />
                </group>
                <group
                    position={[9.904, 2.745, 5.973]}
                    rotation={[0, -1.571, 0]}
                    scale={[1, 1, 0.735]}
                >
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door009_1.geometry}
                        material={materials.Door}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door009_2.geometry}
                        material={materials.metal_02}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door009_3.geometry}
                        material={materials.Glass}
                    />
                </group>
                <group
                    position={[9.904, 2.745, 7.605]}
                    rotation={[-Math.PI, Math.PI / 2, 0]}
                    scale={[-1, -1, -0.735]}
                >
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door010_1.geometry}
                        material={materials.Door}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door010_2.geometry}
                        material={materials.metal_02}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door010_3.geometry}
                        material={materials.Glass}
                    />
                </group>
                <group
                    position={[9.904, 2.745, 12.959]}
                    rotation={[0, -1.571, 0]}
                    scale={[1, 1, 0.735]}
                >
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door011_1.geometry}
                        material={materials.Door}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door011_2.geometry}
                        material={materials.metal_02}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door011_3.geometry}
                        material={materials.Glass}
                    />
                </group>
                <group
                    position={[9.904, 2.745, 14.591]}
                    rotation={[-Math.PI, Math.PI / 2, 0]}
                    scale={[-1, -1, -0.735]}
                >
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door012_1.geometry}
                        material={materials.Door}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door012_2.geometry}
                        material={materials.metal_02}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door012_3.geometry}
                        material={materials.Glass}
                    />
                </group>
                <group
                    position={[6.293, 2.745, 17.408]}
                    rotation={[-Math.PI, Math.PI / 2, 0]}
                    scale={[-1, -1, -0.735]}
                >
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door013_1.geometry}
                        material={materials.Door}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door013_2.geometry}
                        material={materials.metal_02}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door013_3.geometry}
                        material={materials.Glass}
                    />
                </group>
                <group
                    position={[9.904, 2.745, 17.408]}
                    rotation={[-Math.PI, Math.PI / 2, 0]}
                    scale={[-1, -1, -0.735]}
                >
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door014_1.geometry}
                        material={materials.Door}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door014_2.geometry}
                        material={materials.metal_02}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door014_3.geometry}
                        material={materials.Glass}
                    />
                </group>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Glass002.geometry}
                    material={materials.Glass}
                    position={[6.31, 3.138, 3.842]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Glass003.geometry}
                    material={materials.Glass}
                    position={[6.31, 3.138, 10.829]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Glass004.geometry}
                    material={materials.Glass}
                    position={[6.31, 3.138, 15.639]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Glass005.geometry}
                    material={materials.Glass}
                    position={[9.908, 3.138, -2.774]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Glass006.geometry}
                    material={materials.Glass}
                    position={[9.908, 3.138, 3.842]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Glass007.geometry}
                    material={materials.Glass}
                    position={[9.908, 3.138, 10.829]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Glass012.geometry}
                    material={materials.Glass}
                    position={[9.908, 3.138, 15.639]}
                />
                <group position={[7.72, 2.745, -4.724]} scale={[1, 1, 0.735]}>
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door015_1.geometry}
                        material={materials.Door}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door015_2.geometry}
                        material={materials.metal_02}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door015_3.geometry}
                        material={materials.Glass}
                    />
                </group>
                <group position={[7.72, 2.745, 18.318]} scale={[1, 1, 0.735]}>
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door016.geometry}
                        material={materials.Door}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door016_1.geometry}
                        material={materials.metal_02}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Door016_2.geometry}
                        material={materials.Glass}
                    />
                </group>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Glass008.geometry}
                    material={materials.Glass}
                    position={[9.288, 3.298, 18.334]}
                    rotation={[0, 1.571, 0]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Glass009.geometry}
                    material={materials.Glass}
                    position={[6.912, 3.298, 18.334]}
                    rotation={[0, 1.571, 0]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Glass010.geometry}
                    material={materials.Glass}
                    position={[9.288, 3.298, -4.716]}
                    rotation={[0, 1.571, 0]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Glass011.geometry}
                    material={materials.Glass}
                    position={[6.912, 3.298, -4.716]}
                    rotation={[0, 1.571, 0]}
                />
                <group
                    position={[12.306, 3.877, 5.549]}
                    rotation={[-Math.PI, Math.PI / 2, 0]}
                    scale={[-0.664, -0.756, -0.667]}
                >
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Column_1.geometry}
                        material={materials.tile_tile}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Column_2.geometry}
                        material={materials.ConcreteBare}
                    />
                </group>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.ticket_machine.geometry}
                    material={materials.ticket_machine}
                    position={[18.592, 2.333, -2.218]}
                    rotation={[0, 1.571, 0]}
                    scale={0.475}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.trash_can.geometry}
                    material={materials.trash_can}
                    position={[16.714, 2.313, -12.574]}
                    rotation={[0, 1.571, 0]}
                    scale={0.878}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Chair.geometry}
                    material={materials.Chair}
                    position={[18.546, 1.865, -5.546]}
                    rotation={[0, 1.571, 0]}
                    scale={1.139}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Vending_machine.geometry}
                    material={materials.Vending_machine}
                    position={[18.823, 2.699, -0.657]}
                    rotation={[0, 1.571, 0]}
                    scale={1.132}
                />
                <group
                    position={[11.305, 4.372, -14.116]}
                    rotation={[-Math.PI, Math.PI / 2, 0]}
                    scale={-0.756}
                >
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.St_1.geometry}
                        material={materials.Tiles}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.St_2.geometry}
                        material={materials.TactilePaving}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.St_3.geometry}
                        material={materials.road_rails}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.St_4.geometry}
                        material={materials.tile_tile}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.St_5.geometry}
                        material={materials.metal_02}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.St_6.geometry}
                        material={materials.ConcreteBare}
                    />
                </group>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Door_A.geometry}
                    material={materials.Door_01}
                    position={[16.968, 2.734, -17.74]}
                    scale={0.573}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Estruc.geometry}
                    material={materials.tile_tile}
                    position={[14.586, 3.751, -19.313]}
                    rotation={[-Math.PI, Math.PI / 2, 0]}
                    scale={-0.756}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Frame_01.geometry}
                    material={materials.metal_02}
                    position={[15.644, 3.177, -17.76]}
                    rotation={[0, 1.571, 0]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Glass.geometry}
                    material={materials.Glass}
                    position={[14.482, 3.298, -17.76]}
                />
                <group
                    position={[11.978, 3.714, 30.346]}
                    rotation={[-Math.PI, Math.PI / 2, 0]}
                    scale={-0.756}
                >
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.St_03_1.geometry}
                        material={materials.Tiles}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.St_03_2.geometry}
                        material={materials.TactilePaving}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.St_03_3.geometry}
                        material={materials.road_rails}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.St_03_4.geometry}
                        material={materials.tile_tile}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.St_03_5.geometry}
                        material={materials.metal_02}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.St_03_6.geometry}
                        material={materials.ConcreteBare}
                    />
                </group>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Stairs.geometry}
                    material={materials.Tiles}
                    position={[15.447, 1.511, 55.109]}
                    rotation={[-Math.PI, Math.PI / 2, 0]}
                    scale={-0.756}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Stairs_01.geometry}
                    material={materials.Tiles}
                    position={[22.928, 8.607, 76.202]}
                    rotation={[-Math.PI, 0, 0]}
                    scale={-0.756}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Railing.geometry}
                    material={materials.metal_01}
                    position={[22.516, 12.123, 76.242]}
                    rotation={[0, 1.571, 0]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.metro_map.geometry}
                    material={materials.metro_map}
                    position={[18.895, 3.658, -7.315]}
                    rotation={[0, 1.571, 0]}
                    scale={0.645}
                />
                <group
                    position={[11.978, 3.714, 13.154]}
                    rotation={[-Math.PI, Math.PI / 2, 0]}
                    scale={-0.756}
                >
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.St_02_1.geometry}
                        material={materials.Tiles}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.St_02_2.geometry}
                        material={materials.TactilePaving}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.St_02_3.geometry}
                        material={materials.road_rails}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.St_02_4.geometry}
                        material={materials.tile_tile}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.St_02_5.geometry}
                        material={materials.metal_02}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.St_02_6.geometry}
                        material={materials.ConcreteBare}
                    />
                </group>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Door_A_01.geometry}
                    material={materials.Door_01}
                    position={[12.922, 6.912, 68.13]}
                    rotation={[0, Math.PI / 2, 0]}
                    scale={0.573}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Estruc001.geometry}
                    material={materials.tile_tile}
                    position={[11.349, 7.93, 70.513]}
                    rotation={[-Math.PI, 0, 0]}
                    scale={-0.756}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Frame.geometry}
                    material={materials.metal_02}
                    position={[12.905, 7.367, 69.727]}
                    rotation={[Math.PI, 0, Math.PI]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Glass_01.geometry}
                    material={materials.Glass}
                    position={[12.921, 7.476, 69.66]}
                    rotation={[0, 1.571, 0]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Poster_01.geometry}
                    material={materials.Posters}
                    position={[18.879, 4.421, -13.474]}
                    rotation={[0, -1.571, 0]}
                    scale={1.013}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Poster_02.geometry}
                    material={materials.Posters}
                    position={[18.879, 4.421, -12.343]}
                    rotation={[0, -1.571, 0]}
                    scale={1.013}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Poster_03.geometry}
                    material={materials.Posters}
                    position={[18.879, 4.421, -11.169]}
                    rotation={[0, -1.571, 0]}
                    scale={1.013}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Poster_04.geometry}
                    material={materials.Posters}
                    position={[18.879, 4.421, -9.983]}
                    rotation={[0, -1.571, 0]}
                    scale={1.013}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Poster_05.geometry}
                    material={materials.Posters}
                    position={[18.879, 2.976, -13.474]}
                    rotation={[0, -1.571, 0]}
                    scale={1.013}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Poster_06.geometry}
                    material={materials.Posters}
                    position={[18.879, 2.976, -12.367]}
                    rotation={[0, -1.571, 0]}
                    scale={1.013}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Poster_07.geometry}
                    material={materials.Posters}
                    position={[18.879, 2.976, -11.126]}
                    rotation={[0, -1.571, 0]}
                    scale={1.013}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Poster_08.geometry}
                    material={materials.Posters}
                    position={[18.879, 2.976, -10.008]}
                    rotation={[0, -1.571, 0]}
                    scale={1.013}
                />
            </group>
        );
    }
);

useGLTF.preload("/Metro.glb");
