/*
 * Copyright 2021-2022 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = {
    roots: ["<rootDir>/test"],
    verbose: true,
    transform: {
        "^.+\\.tsx?$": "ts-jest",
        "^.+\\.(js|jsx)?$": "babel-jest",
    },
    coverageThreshold: {
        global: {
            branches: 60,
            functions: 70,
            lines: 80,
            statements: 80,
        },
    },
    globals: {
        "ts-jest": {
            diagnostics: false,
        },
    },
    testEnvironment: "jsdom",
    setupFiles: ["./test/setupTests.ts"],
    setupFilesAfterEnv: ["<rootDir>test/setupTests.ts"],
    snapshotSerializers: ["enzyme-to-json/serializer"],
    moduleFileExtensions: ["ts", "tsx", "js"],
    moduleNameMapper: {
        "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
            "<rootDir>/test/fileMock.ts",
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    transformIgnorePatterns: ["<rootDir>/node_modules/(?!d3-array)/"],
};
