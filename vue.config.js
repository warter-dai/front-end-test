const { defineConfig } = require("@vue/cli-service");
const { TRUE } = require("sass");
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    https: true,
    open:true
  }
});
