import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";

const PRISMA_OUTSIDE_DATA_LAYER = {
  paths: [{ name: "@prisma/client", message: "Prisma solo se usa en src/lib/prisma.js y src/repositories/." }],
  patterns: [{ group: ["**/lib/prisma.js"], message: "Accede a la base de datos a través de un repository." }],
};

export default [
  { ignores: ["node_modules/", "uploads/", "coverage/"] },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^(request|response|next|_)" }],
      eqeqeq: ["error", "always"],
      "prefer-const": "error",
    },
  },
  {
    // Regla de oro de la arquitectura: controllers, services, routers y middlewares no tocan Prisma
    files: ["src/controllers/**", "src/services/**", "src/routes/**", "src/middlewares/**"],
    rules: { "no-restricted-imports": ["error", PRISMA_OUTSIDE_DATA_LAYER] },
  },
  prettier,
];
