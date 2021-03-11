const { createProxyMiddleware } = require('http-proxy-middleware');

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
