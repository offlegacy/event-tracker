import pluginReact from "@eslint-react/eslint-plugin";
import pluginReactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

export default tseslint.config({
  files: ["**/*.tsx"],
  extends: [importPlugin.flatConfigs.recommended, pluginReact.configs.recommended],
  plugins: {
    "@typescript-eslint": tseslint.plugin,
    "react-hooks": pluginReactHooks,
  },
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      projectService: true,
    },
  },
  rules: {
    "@eslint-react/no-clone-element": "off",
    "react-hooks/exhaustive-deps": "error",
    "react-hooks/rules-of-hooks": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/consistent-type-imports": "error",
    "import/order": [
      "error",
      {
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
        "newlines-between": "always",
      },
    ],
  },
  settings: {
    "import/resolver": {
      typescript: {},
    },
  },
});
