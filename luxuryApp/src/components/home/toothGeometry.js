import * as THREE from "three";

const smoothstep = (edge0, edge1, x) => {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

// Cúspides de un molar (posición en el plano XZ)
const CUSPS = [
  [0.42, 0.36],
  [-0.42, 0.36],
  [0.42, -0.36],
  [-0.42, -0.36],
];

/**
 * Corona del diente: una esfera deformada con cuatro cúspides arriba
 * y un cuello más estrecho abajo, donde nacen las raíces.
 */
export const createCrownGeometry = () => {
  const geometry = new THREE.SphereGeometry(1, 128, 96);
  const pos = geometry.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);

    // Aplana la parte superior y alarga ligeramente el cuerpo
    let y = v.y * 0.82;
    if (y > 0.35) y = 0.35 + (y - 0.35) * 0.45;

    // Cuello: estrecha la mitad inferior
    const neck = 1 - 0.28 * smoothstep(0.1, -0.85, v.y);
    let x = v.x * 1.05 * neck;
    let z = v.z * 0.92 * neck;

    // Cúspides y surco central en la cara oclusal
    const top = smoothstep(0.25, 0.75, v.y);
    if (top > 0) {
      let bump = 0;
      for (const [cx, cz] of CUSPS) {
        const d2 = (x - cx) ** 2 + (z - cz) ** 2;
        bump += 0.2 * Math.exp(-d2 / 0.07);
      }
      const groove = 0.07 * Math.exp(-(x * x) / 0.012) + 0.05 * Math.exp(-(z * z) / 0.012);
      y += (bump - groove) * top;
    }

    pos.setXYZ(i, x, y, z);
  }

  geometry.computeVertexNormals();
  return geometry;
};

/**
 * Raíz cónica y ligeramente curvada, generada con un torno (LatheGeometry).
 */
export const createRootGeometry = (length = 1.25) => {
  const points = [];
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const radius = 0.34 * (1 - t) ** 0.85 + 0.035;
    points.push(new THREE.Vector2(radius, -t * length));
  }
  // Punta redondeada
  points.push(new THREE.Vector2(0.0001, -length - 0.04));

  const geometry = new THREE.LatheGeometry(points, 64);
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = -y / length;
    // Curva suave hacia fuera
    pos.setX(i, pos.getX(i) + 0.12 * t * t);
  }
  geometry.computeVertexNormals();
  return geometry;
};
