import rootConfig from "../prettier.config";

/** @type {import("prettier").Config} */
const config = {
  ...rootConfig,
  plugins: [...rootConfig.plugins, "prettier-plugin-tailwindcss"],
};

export default config;
