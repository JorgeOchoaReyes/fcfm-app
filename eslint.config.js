/* eslint-env node */
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    rules: {
      "react/display-name": "off",
      "indent": ["error", 2],
      "quotes": [2, "double"],
      "semi": [2, "always"]

    },
  },
]);
