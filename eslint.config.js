import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: pluginJs.configs.recommended,
});

export default tseslint.config(
  {
    ignores: [
      "node_modules/",
      ".next/",
      "out/",
      "dist/",
      "build/",
      "public/",
      "prisma/",
      "jsvectormap.d.ts",
      "postcss.config.js",
      "tailwind.config.ts",
      "next.config.mjs",
      "start-server.js",
      "process.json",
      "**/*.css",
      "**/*.scss",
      "**/*.html",
      "**/*.json",
      "**/*.md",
      "**/*.yml",
      "**/*.toml",
      "**/*.lock",
      "**/*.log",
      "**/*.env",
      "**/*.bak",
      "**/*.tmp",
      "**/*.zip",
      "**/*.rar",
      "**/*.7z",
      "**/*.svg",
      "**/*.png",
      "**/*.jpg",
      "**/*.jpeg",
      "**/*.gif",
      "**/*.webp",
      "**/*.ico",
      "**/*.eot",
      "**/*.ttf",
      "**/*.woff",
      "**/*.woff2",
    ],
  },
  {
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript", "prettier"],
  }),
  {
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
);
