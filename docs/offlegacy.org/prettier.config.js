import rootConfig from "../../prettier.config.js";

/** @type {import("prettier").Config} */
const config = {
  ...rootConfig,
  plugins: [ "prettier-plugin-tailwindcss"],
};

export default config;
