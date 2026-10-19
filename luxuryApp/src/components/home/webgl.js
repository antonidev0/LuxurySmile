// Comprueba si el navegador puede dibujar WebGL antes de cargar la escena 3D
export const supportsWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(window.WebGLRenderingContext && (canvas.getContext("webgl2") || canvas.getContext("webgl")));
  } catch {
    return false;
  }
};
