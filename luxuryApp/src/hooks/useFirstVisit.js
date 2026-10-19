import { useCallback, useState } from "react";

const read = (key) => {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return true; // sin almacenamiento disponible no mostramos la intro
  }
};

// true solo la primera vez que el navegador visita el sitio
export const useFirstVisit = (key) => {
  const [isFirst, setIsFirst] = useState(() => !read(key));

  const markSeen = useCallback(() => {
    try {
      localStorage.setItem(key, "1");
    } catch {
      // ignorado: la intro simplemente volverá a mostrarse
    }
    setIsFirst(false);
  }, [key]);

  return [isFirst, markSeen];
};
