import { Box } from "@chakra-ui/react";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { supportsWebGL } from "./webgl";

// La escena 3D (three.js) se carga aparte para no frenar el resto del sitio
const ToothScene = lazy(() => import("./ToothScene"));

const Glow = () => (
  <Box
    position="absolute"
    inset="10%"
    borderRadius="full"
    bgGradient="radial(gold.100 0%, rgba(230,210,168,0.25) 40%, transparent 70%)"
    filter="blur(10px)"
  />
);

const HeroVisual = ({ ready = true }) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(true);
  const [canRender] = useState(supportsWebGL);
  const reducedMotion = usePrefersReducedMotion();

  // Pausa la animación cuando la portada no está visible
  useEffect(() => {
    if (!ref.current) return undefined;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Box ref={ref} position="relative" w="full" h={{ base: "320px", sm: "400px", lg: "560px" }}>
      <Glow />
      {canRender && ready && (
        <Suspense fallback={null}>
          <Box position="absolute" inset={0}>
            <ToothScene active={inView} reducedMotion={reducedMotion} />
          </Box>
        </Suspense>
      )}
    </Box>
  );
};

export default HeroVisual;
