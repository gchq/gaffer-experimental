module.exports = {
  presets: [["@babel/preset-env", { targets: { node: "current" } }], "@babel/preset-typescript"],
  transformIgnorePatterns: ["node_modules/((d3-array)/)"]
}
