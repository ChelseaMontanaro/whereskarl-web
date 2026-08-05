/**
 * Package-boundary enforcement for `packages/*` (architecture §11 / migration Phase 14).
 *
 * Apps keep their own ESLint configs (e.g. apps/web). This root config only
 * applies when linting package sources.
 */
import js from "@eslint/js";
import tseslintParser from "@typescript-eslint/parser";

const packageBoundaryImports = {
  paths: [
    {
      name: "next",
      message:
        "Shared packages must not import Next.js (architecture §11.2).",
    },
    {
      name: "react-native",
      message:
        "Shared packages must not import React Native (architecture §11.2).",
    },
    {
      name: "expo",
      message: "Shared packages must not import Expo (architecture §11.2).",
    },
  ],
  patterns: [
    {
      group: [
        "next/*",
        "expo-*",
        "expo/*",
        "react-native/*",
        "@expo/*",
        "react-native-*",
      ],
      message:
        "Shared packages must not import platform frameworks (architecture §11.2).",
    },
    {
      group: [
        "@whereskarl/*/src",
        "@whereskarl/*/src/*",
        "@whereskarl/*/*",
      ],
      message:
        "Import only from the package public entry (@whereskarl/<name>). Deep imports are forbidden.",
    },
    {
      group: ["**/apps/**", "apps/*", "apps/**"],
      message:
        "Packages must not import from applications (architecture §11.2).",
    },
  ],
};

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "apps/**",
      "docs/**",
      "scripts/**",
    ],
  },
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslintParser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      // Package sources are typechecked separately; this config only enforces boundaries.
      "no-undef": "off",
      "no-unused-vars": "off",
      "no-restricted-imports": ["error", packageBoundaryImports],
    },
  },
];

export default eslintConfig;
