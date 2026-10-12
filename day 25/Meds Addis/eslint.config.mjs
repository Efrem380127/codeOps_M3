import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Tooling scratch space. It is gitignored, so nothing in here ships, but
    // without this the linter walks it and reports errors in one-off scripts
    // that are not part of the application.
    ".workbuddy-ai/**",
  ]),
]);

export default eslintConfig;
