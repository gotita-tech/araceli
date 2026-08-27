'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * Una gota cayendo sobre agua inmóvil.
 *
 * Es una única superficie con ondas concéntricas amortiguadas: sin partículas,
 * sin brillos, sin movimiento nervioso. El cursor sólo desplaza muy despacio
 * el punto de resonancia.
 */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision mediump float;

  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uAspect;
  uniform float uIntensity;

  varying vec2 vUv;

  // Onda concéntrica amortiguada con la distancia y con el tiempo.
  float drop(vec2 uv, vec2 center, float t, float freq, float speed, float damp) {
    float d = distance(uv, center);
    return sin(d * freq - t * speed) * exp(-d * damp) * exp(-t * 0.55);
  }

  void main() {
    vec2 uv = vec2(vUv.x * uAspect, vUv.y);
    vec2 pointer = vec2(uPointer.x * uAspect, uPointer.y);

    float cycle = 7.2;
    float t1 = mod(uTime, cycle);
    float t2 = mod(uTime + cycle * 0.5, cycle);

    vec2 c1 = vec2(0.5 * uAspect, 0.54);
    vec2 c2 = vec2(0.5 * uAspect + 0.16, 0.42);

    float h = 0.0;
    h += drop(uv, c1, t1, 26.0, 2.6, 3.4);
    h += 0.55 * drop(uv, c2, t2, 21.0, 2.2, 4.0);

    // Estela del cursor: lenta y muy suave.
    float dp = distance(uv, pointer);
    h += 0.42 * uIntensity * sin(dp * 17.0 - uTime * 1.1) * exp(-dp * 4.6);

    // Respiración de fondo.
    h += 0.07 * sin(uv.y * 3.1 + uTime * 0.22);

    float shade = smoothstep(-0.75, 0.95, h);

    vec3 mist = vec3(0.596, 0.674, 0.859);
    vec3 blue = vec3(0.263, 0.419, 0.871);
    vec3 ivory = vec3(0.941, 0.949, 0.859);

    vec3 color = mix(ivory, mist, shade * 0.72);
    color = mix(color, blue, pow(shade, 3.0) * 0.32);

    // Curvas de nivel apenas perceptibles: topografía, no ruido.
    float contour = smoothstep(0.86, 1.0, abs(fract(h * 2.6) - 0.5) * 2.0);
    color = mix(color, blue, contour * 0.06);

    float vignette = smoothstep(0.95, 0.28, distance(vUv, vec2(0.5, 0.5)));
    float alpha = vignette * (0.42 + shade * 0.5);

    gl_FragColor = vec4(color, alpha);
  }
`;

function WaterSurface({ intensity }: { intensity: number }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const current = useRef(new THREE.Vector2(0.5, 0.55));
  const { viewport, size } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0.5, 0.55) },
      uAspect: { value: 1 },
      uIntensity: { value: intensity },
    }),
    [intensity],
  );

  useFrame((state, delta) => {
    const material = materialRef.current;
    if (!material) return;

    material.uniforms.uTime!.value += Math.min(delta, 0.05);
    material.uniforms.uAspect!.value = size.width / Math.max(size.height, 1);

    // El punto de resonancia persigue al cursor con mucha inercia.
    const targetX = state.pointer.x * 0.5 + 0.5;
    const targetY = state.pointer.y * 0.5 + 0.5;
    current.current.x += (targetX - current.current.x) * Math.min(delta * 0.9, 0.08);
    current.current.y += (targetY - current.current.y) * Math.min(delta * 0.9, 0.08);
    (material.uniforms.uPointer!.value as THREE.Vector2).set(current.current.x, current.current.y);
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

export default function DropletScene({ intensity = 1, maxDpr = 1.5 }: { intensity?: number; maxDpr?: number }) {
  return (
    <Canvas
      dpr={[1, maxDpr]}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ position: 'absolute', inset: 0 }}
      aria-hidden
    >
      <WaterSurface intensity={intensity} />
    </Canvas>
  );
}
