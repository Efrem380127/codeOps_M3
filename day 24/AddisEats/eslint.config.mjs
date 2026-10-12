import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
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
