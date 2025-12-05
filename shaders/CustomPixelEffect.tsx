import { Uniform, Vector2 } from "three";
import { forwardRef, Ref } from "react";
import { EffectComposer } from "@react-three/postprocessing";
import { ThreeElement, ThreeElements } from "@react-three/fiber";
import { Effect } from "postprocessing";

const fragmentShader = `
uniform float pixelSize;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 grid = floor(uv * pixelSize) / pixelSize;
    outputColor = texture2D(inputBuffer, grid);
}
`;

export class PixelateEffect extends Effect {
    constructor(pixelSize = 20) {
        super("PixelateEffect", fragmentShader, {
            uniforms: new Map([["pixelSize", new Uniform(pixelSize)]]),
        });
    }
}

export function CustomPixelateEffect({
    pixelSize = 200,
    ref,
}: {
    pixelSize?: number;
    ref?: Ref<ThreeElements["primitive"]>;
}) {
    const effect = new PixelateEffect(pixelSize);
    return <primitive ref={ref} object={effect} />;
}
