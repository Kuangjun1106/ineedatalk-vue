const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer:{
    proxy: {
      '/room': {
        target: "http://localhost:8083",
        ws:true,
        changeOrigin:true
      },
      '/chat': {
        target: "http://localhost:8082",
        ws:true,
        changeOrigin:true
      }
    }
  }
})
