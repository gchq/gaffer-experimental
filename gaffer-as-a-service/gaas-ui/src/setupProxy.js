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

const { createProxyMiddleware } = require("http-proxy-middleware");

/**
 *  Here is access to the development expressjs server to hook up your own middleware proxy.
 *  You can register your own proxies as you wish!
 *  By default, the development server is set up to proxy to the mock GaaS REST API found in ./server/middleware.js
 */
module.exports = function (app) {
    app.use(
        "/graphs",
        createProxyMiddleware({
            target: "http://localhost:4000",
            changeOrigin: true,
        })
    );

    app.use(
        "/namespaces",
        createProxyMiddleware({
            target: "http://localhost:4000",
            changeOrigin: true,
        })
    );

    app.use(
        "/auth",
        createProxyMiddleware({
            target: "http://localhost:4000",
            changeOrigin: true,
        })
    );
    app.use(
        "/storetypes",
        createProxyMiddleware({
            target: "http://localhost:4000",
            changeOrigin: true,
        })
    );
    app.use(
        "/whoami",
        createProxyMiddleware({
            target: "http://localhost:4000",
            changeOrigin: true,
        })
    );
};
