import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { useTripExperience } from "./TripExperienceContext";
import { Trip } from "@/lib/types";

const shaderHelpers = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m*m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for(int i = 0; i < 5; i++) {
        value += amplitude * snoise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    return value;
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}
`;

const shaderMainLogic = `
    vec2 xr_uv = vXrUv;
    vec2 xr_centeredUv = xr_uv - 0.5;
    float xr_dist = length(xr_centeredUv);
    
    vec3 xr_finalEffectColor = vec3(0.0);
    float xr_effectAlpha = 0.0;
    
    // Use a small epsilon for float comparison or just cast to int if supported, 
    // but float comparison with tolerance is safer in some contexts.
    // Here we assume uMode is set to exact integer values as floats.
    
    if (abs(uMode - 1.0) < 0.1) { // Shroom
        float noiseScale = 3.0;
        float noiseSpeed = 0.3;
        float time = uTime * noiseSpeed;
        float noiseX = fbm(xr_uv * noiseScale + time);
        float noiseY = fbm(xr_uv * noiseScale + time + 100.0);
        vec2 distortedUv = xr_uv + vec2(noiseX, noiseY) * uStrength * 0.05;
        
        float electricScale = 8.0;
        float electricPattern = fbm(distortedUv * electricScale + uTime);
        electricPattern = pow(abs(electricPattern), 2.0) * 2.0;
        
        vec3 colorA = vec3(0.1, 0.3, 0.9);
        vec3 colorB = vec3(0.8, 0.2, 0.9);
        float mixElectric = sin(uTime + xr_dist * 10.0) * 0.5 + 0.5;
        vec3 electricColor = mix(colorA, colorB, mixElectric);
        
        vec3 palette1 = vec3(0.1, 0.3, 0.9);
        vec3 palette2 = vec3(0.8, 0.2, 0.9);
        vec3 palette3 = vec3(1.0, 0.5, 0.1);
        vec3 palette4 = vec3(0.0, 0.9, 0.9);
        
        float mix1 = sin(uTime * 0.5 + xr_dist * 10.0) * 0.5 + 0.5;
        float mix2 = cos(uTime * 0.35 + xr_dist * 8.0) * 0.5 + 0.5;
        
        vec3 palette = mix(
            mix(palette1, palette2, mix1),
            mix(palette3, palette4, mix2),
            sin(uTime * 0.3 + electricPattern * 6.28) * 0.5 + 0.5
        );
        
        xr_finalEffectColor = electricColor * electricPattern + palette * 0.3;
        float vignette = smoothstep(0.4, 0.8, xr_dist);
        xr_effectAlpha = (electricPattern * 0.5 + vignette * 0.5) * uStrength;
        
    } else if (abs(uMode - 2.0) < 0.1) { // ASCII
        float cells = 50.0;
        vec2 grid = fract(xr_uv * cells);
        float charShape = step(0.2, grid.x) * step(0.2, grid.y) * step(grid.x, 0.8) * step(grid.y, 0.8);
        float charNoise = step(0.5, snoise(floor(xr_uv * cells) + uTime * 0.1));
        
        xr_finalEffectColor = vec3(0.0, 1.0, 0.25);
        float vignette = smoothstep(0.3, 0.8, xr_dist);
        xr_effectAlpha = (charShape * charNoise * 0.5 + vignette) * uStrength;
        
    } else if (abs(uMode - 3.0) < 0.1) { // AfterImage
        float pulse = sin(uTime * 5.0) * 0.5 + 0.5;
        xr_finalEffectColor = vec3(1.0, 0.0, 1.0);
        xr_effectAlpha = 0.1 * uStrength * pulse;
        
    } else if (abs(uMode - 4.0) < 0.1) { // PurpleVoid
        float electricScale = 5.0;
        float electricPattern = fbm(xr_uv * electricScale + uTime * 0.5);
        electricPattern = pow(abs(electricPattern), 2.0) * 2.0;
        
        vec3 colorA = vec3(0.55, 0.91, 0.74);
        vec3 colorB = vec3(0.55, 0.35, 0.91);
        
        float hueShift = (sin(uTime * 0.6) + 1.0) * 0.08;
        colorA += hueShift;
        colorB += hueShift;
        
        float mixElectric = sin(uTime + xr_dist * 10.0) * 0.5 + 0.5;
        vec3 electricColor = mix(colorA, colorB, mixElectric);
        
        xr_finalEffectColor = electricColor;
        xr_effectAlpha = electricPattern * 0.4 * uStrength;
        
    } else if (abs(uMode - 5.0) < 0.1) { // Psych
        float scale = 20.0;
        float speed = 1.0;
        float time = uTime * speed;
        vec2 p = xr_uv;
        
        p.x += sin(p.y * scale + time) * 0.1;
        p.y += sin(p.x * scale + time) * 0.1;
        
        float pattern = sin(p.x * 20.0) * sin(p.y * 20.0);
        xr_finalEffectColor = vec3(pattern * 0.5 + 0.5, 0.0, 1.0 - (pattern * 0.5 + 0.5));
        xr_effectAlpha = 0.2 * uStrength;
        
    } else if (abs(uMode - 6.0) < 0.1) { // CustomPixelate
        float pixelSize = 50.0;
        vec2 grid = step(0.95, fract(xr_uv * pixelSize));
        float gridLine = max(grid.x, grid.y);
        
        xr_finalEffectColor = vec3(0.0);
        xr_effectAlpha = gridLine * 0.5 * uStrength;
        
    } else if (abs(uMode - 7.0) < 0.1) { // Test
        float waveAmp = 0.02;
        float waveFreq = 10.0;
        float waveY = sin(xr_uv.y * waveFreq + uTime) * waveAmp;
        float waveX = sin(xr_uv.x * waveFreq + uTime) * waveAmp;
        vec2 waveUv = xr_uv + vec2(waveX, waveY);
        
        float electricPattern = fbm(waveUv * 8.0 + uTime);
        electricPattern = pow(abs(electricPattern), 2.0) * 2.0;
        
        vec3 colorA = vec3(0.55, 0.91, 0.74);
        vec3 colorB = vec3(0.55, 0.35, 0.91);
        vec3 electricColor = mix(colorA, colorB, sin(uTime) * 0.5 + 0.5);
        
        xr_finalEffectColor = electricColor;
        xr_effectAlpha = electricPattern * 0.5 * uStrength;
    }

    gl_FragColor.rgb = mix(gl_FragColor.rgb, xr_finalEffectColor, xr_effectAlpha);
`;

export default function XREffectOverlay() {
    const { selectedTrip, strength, collidersRef } = useTripExperience();

    // Shared uniforms object that all patched materials will reference
    const sharedUniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uStrength: { value: 0 },
            uMode: { value: 0 },
        }),
        []
    );

    // Determine mode integer
    const mode = useMemo(() => {
        switch (selectedTrip) {
            case Trip.Shroom:
                return 1;
            case Trip.ASCII:
                return 2;
            case Trip.AfterImage:
                return 3;
            case Trip.PurpleVoid:
                return 4;
            case Trip.Psych:
                return 5;
            case Trip.CustomPixelate:
                return 6;
            case Trip.Test:
                return 7;
            default:
                return 0;
        }
    }, [selectedTrip]);

    useFrame((state, delta) => {
        // Update shared uniforms
        sharedUniforms.uTime.value += delta;
        sharedUniforms.uStrength.value = strength;
        sharedUniforms.uMode.value = mode;

        // Patch materials of all colliders
        if (collidersRef.current) {
            collidersRef.current.forEach((mesh) => {
                if (!mesh.material) return;

                const materials = Array.isArray(mesh.material)
                    ? mesh.material
                    : [mesh.material];

                materials.forEach((mat) => {
                    if (mat.userData.isPatched) return;

                    mat.onBeforeCompile = (shader) => {
                        // Assign shared uniforms
                        shader.uniforms.uTime = sharedUniforms.uTime;
                        shader.uniforms.uStrength = sharedUniforms.uStrength;
                        shader.uniforms.uMode = sharedUniforms.uMode;

                        // 1. Vertex Shader Patching
                        // Inject varying declaration
                        shader.vertexShader = shader.vertexShader.replace(
                            "#include <common>",
                            `
                            #include <common>
                            varying vec2 vXrUv;
                            `
                        );
                        // Inject uv assignment.
                        // We assume 'uv' attribute exists. If not, this might fail, but standard meshes have it.
                        // We append to uv_vertex or begin_vertex
                        shader.vertexShader = shader.vertexShader.replace(
                            "#include <begin_vertex>",
                            `
                            #include <begin_vertex>
                            vXrUv = uv;
                            `
                        );

                        // 2. Fragment Shader Patching
                        // Inject uniforms and varying and helpers
                        shader.fragmentShader = shader.fragmentShader.replace(
                            "#include <common>",
                            `
                            #include <common>
                            uniform float uTime;
                            uniform float uStrength;
                            uniform float uMode;
                            varying vec2 vXrUv;
                            ${shaderHelpers}
                            `
                        );

                        // Inject effect logic at the end of main
                        shader.fragmentShader = shader.fragmentShader.replace(
                            "#include <dithering_fragment>",
                            `
                            #include <dithering_fragment>
                            ${shaderMainLogic}
                            `
                        );
                    };

                    mat.userData.isPatched = true;
                    mat.needsUpdate = true; // Trigger recompilation
                });
            });
        }
    });

    return null;
}
