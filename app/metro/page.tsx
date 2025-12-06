"use client";
import { MetroModel } from "@/app/metro/MetroModel";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AfterImageEffect,
    ASCIIEffect,
    ElectricPatternEffect,
    PsychedelicEffect,
    PsychedelicEffectFX,
    WaveDistortion,
    WaveDistortionEffect,
} from "@/shaders";
import { CustomPixelateEffect } from "@/shaders/CustomPixelEffect";
import { MatrixEffect } from "@/shaders/MatrixEffect";
import PurpleVoidEffect from "@/shaders/PurpleVoidEffect";
import { AnimatedShroomPostFX } from "@/shaders/Shroom";
import { PointerLockControls, Stars } from "@react-three/drei";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
    ASCII,
    Bloom,
    BrightnessContrast,
    EffectComposer,
    HueSaturation,
    Noise,
    Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useEffect, useRef, RefObject, useState } from "react";
import { Group, Vector3, Raycaster, Mesh } from "three";

// First-person camera with collision detection
function FirstPersonCamera({
    collidersRef,
}: {
    collidersRef: RefObject<Mesh[]>;
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

    return <PointerLockControls selector=".canvas" />;
}
enum Trip {
    NONE = "None",
    ASCII = "ASCII",
    Shroom = "Shroom",
    AfterImage = "AfterImage (dizzy 🤮)",
    CustomPixelate = "CustomPixelate",
    Test = "Test",
    PurpleVoid = "PurpleVoid",
}
export default function MetroPage() {
    const [selectedTrip, setSelectedTrip] = useState<Trip>(Trip.NONE);
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
        <>
            <div className="absolute">
                <div className="absolute top-4 left-4 z-10">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">Change Trip 💊</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <>
                                {Object.values(Trip).map((trip) => (
                                    <DropdownMenuCheckboxItem
                                        key={trip}
                                        checked={trip === selectedTrip}
                                        onCheckedChange={() =>
                                            setSelectedTrip(trip)
                                        }
                                    >
                                        {trip}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="bg-background mt-2 w-full justify-center rounded-md p-1 text-center">
                        Click anywhere and move around
                    </div>
                </div>
            </div>
            <Canvas
                className="canvas"
                camera={{ fov: 75, near: 0.1, far: 1000 }}
            >
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[8, 4, 5]} intensity={0.5} />
                <FirstPersonCamera collidersRef={collidersRef} />
                <MetroModel ref={modelRefCallback} />
                {selectedTrip === Trip.Shroom && (
                    <EffectComposer enableNormalPass={false} multisampling={2}>
                        <PsychedelicEffectFX
                            waveSpeed={2}
                            noiseDistortionStrength={0.5}
                            noiseDistortionScale={4}
                            noiseDistortionSpeed={0.2}
                            chromaticOffset={0.004}
                        />
                    </EffectComposer>
                )}
                {selectedTrip === Trip.ASCII && <ASCIIEffect />}
                {selectedTrip === Trip.AfterImage && (
                    <EffectComposer>
                        <AfterImageEffect damp={0.8} />
                    </EffectComposer>
                )}
                {selectedTrip === Trip.CustomPixelate && (
                    <EffectComposer>
                        <CustomPixelateEffect />
                    </EffectComposer>
                )}
                {selectedTrip === Trip.Test && (
                    <>
                        <EffectComposer>
                            {/* <Vignette key="vignette" darkness={0.5} offset={0.3} /> */}
                            {/* <AnimatedShroomPostFX /> */}
                            <WaveDistortionEffect amplitude={0.01} />
                            <BrightnessContrast
                                brightness={50}
                                contrast={100}
                            />
                            <AfterImageEffect damp={0.7} />
                            <ElectricPatternEffect
                                intensity={0.5}
                                scale={0.5}
                                speed={0.02}
                                colorA={[141 / 255, 232 / 255, 189 / 255]}
                                // purple
                                colorB={[141 / 255, 89 / 255, 232 / 255]}
                            />
                            <HueSaturation
                                blendFunction={BlendFunction.COLOR_BURN} // blend mode
                                hue={Math.PI / 2} // hue in radians
                                saturation={0.999} // saturation in radians
                            />
                        </EffectComposer>
                    </>
                )}
                {selectedTrip === Trip.PurpleVoid && (
                    <EffectComposer>
                        <PurpleVoidEffect />
                    </EffectComposer>
                )}
            </Canvas>
        </>
    );
}
