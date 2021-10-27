module.exports = {
  roots: ["<rootDir>/test"],
  verbose: true,
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  testPathIgnorePatterns: ["<rootDir>/node_modules/"],
  transformIgnorePatterns: ["/node_modules/d3-array"],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 80,
      statements: 80
    }
  },
  globals: {
    "ts-jest": {
      diagnostics: false
    }
  },
  setupFiles: ["./test/setupTests.ts"],
  setupFilesAfterEnv: ["<rootDir>test/setupTests.ts"],
  snapshotSerializers: ["enzyme-to-json/serializer"],
  moduleFileExtensions: ["ts", "tsx", "js"],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/test/fileMock.ts"
  }
}
