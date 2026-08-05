import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig, globalIgnores } from "eslint/config";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const eslintConfig = defineConfig([
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@whereskarl/*/src",
                "@whereskarl/*/src/*",
                "@whereskarl/*/*",
              ],
              message:
                "Import only from the package public entry (@whereskarl/<name>). Deep imports are forbidden.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
