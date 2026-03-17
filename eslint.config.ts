// @ts-expect-error no types
import biome from "eslint-config-biome";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
  },
  {
    ignores: [
      "**/.agents/**",
      "**/.next/**",
      "**/.output/**",
      "**/.turbo/**",
      "**/dist/**",
      "**/generated/**",
      "**/metro.config.js",
      "**/node_modules/**",
      "**/openapi/client-tests/**",
      "**/openapi/clients/**",
      "**/out/**",
      "**/postcss.config.mjs",
      "**/temp/**",
      "**/*.lock",
      "**/routeTree.gen.ts",
      "bun.lock",
      "eslint.config.mjs",
    ],
  },
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.nodeBuiltin,
        ...globals.bunBuiltin,
      },
    },
  },
  tseslint.configs.eslintRecommended,
  tseslint.configs.strictTypeChecked,
  {
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-base-to-string": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: false,
        },
      ],
      "@typescript-eslint/no-redundant-type-constituents": "off",
      "@typescript-eslint/no-unnecessary-condition": [
        "error",
        { allowConstantLoopConditions: "only-allowed-literals" },
      ],
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-unsafe-declaration-merging": "off",
      "@typescript-eslint/no-unsafe-enum-comparison": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/prefer-promise-reject-errors": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
    },
  },
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        projectService: false,
        sourceType: "module",
      },
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.bun,
        __dirname: "readonly",
        module: "readonly",
        require: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  pluginReact.configs.flat.recommended,
  {
    rules: {
      "react/jsx-uses-react": "error",
      "react/no-unescaped-entities": "off",
      "react/no-unknown-property": ["error", { ignore: ["css"] }],
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
    },
    settings: {
      react: {
        version: "19.0.0",
      },
    },
  },
  biome
);
