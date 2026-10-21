// Puntuación simple de 0 a 4 para orientar al admin
export const passwordStrength = (password = "") => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (password.length >= 12 || /[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

export const STRENGTH_LABELS = [
  { label: "Muy débil", color: "red" },
  { label: "Débil", color: "red" },
  { label: "Aceptable", color: "orange" },
  { label: "Buena", color: "green" },
  { label: "Fuerte", color: "green" },
];

// Contraseña aleatoria que cumple las reglas (mayúscula, minúscula y número)
export const generatePassword = (length = 12) => {
  const sets = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnpqrstuvwxyz", "23456789"];
  const all = sets.join("");
  const random = (max) => crypto.getRandomValues(new Uint32Array(1))[0] % max;
  const chars = sets.map((set) => set[random(set.length)]);
  while (chars.length < length) chars.push(all[random(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = random(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
};
