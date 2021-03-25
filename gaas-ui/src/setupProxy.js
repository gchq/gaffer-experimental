const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 *  Here is access to the development expressjs server to hook up your own middleware proxy.
 *  You can register your own proxies as you wish!
 *  By default, the development server is set up to proxy to the mock GaaS REST API found in ./server/middleware.js
 */
module.exports = function (app) {
    app.use(
        '/graphs',
        createProxyMiddleware({
            target: 'http://localhost:4000',
            changeOrigin: true,
        })
    );

    app.use(
        '/namespaces',
        createProxyMiddleware({
            target: 'http://localhost:4000',
            changeOrigin: true,
        })
    );

    app.use(
        '/auth',
        createProxyMiddleware({
            target: 'http://localhost:4000',
            changeOrigin: true,
        })
    );
};
