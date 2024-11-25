const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Enable CORS for your React app
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true,
}));

// Proxy middleware configuration for Google AI
const googleAIProxy = createProxyMiddleware({
  target: 'https://generativelanguage.googleapis.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/google': '', 
  },
  onProxyReq: function (proxyReq, req, res) {
    // Log the outgoing request
    console.log('Google AI Request:', {
      method: proxyReq.method,
      path: proxyReq.path,
      headers: proxyReq.getHeaders()
    });
  },
  onProxyRes: function (proxyRes, req, res) {
    proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:8080';
    // Log the response status
    console.log('Google AI Response:', {
      status: proxyRes.statusCode,
      headers: proxyRes.headers
    });
  },
  onError: function (err, req, res) {
    console.error('Google AI Proxy Error:', err);
    res.status(500).send('Proxy Error: ' + err.message);
  },
});

// Proxy middleware configuration for Cloudflare
const cloudflareProxy = createProxyMiddleware({
  target: 'https://gateway.ai.cloudflare.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/cloudflare': '', 
  },
  onProxyReq: function (proxyReq, req, res) {
    // Log the outgoing request
    console.log('Cloudflare Request:', {
      method: proxyReq.method,
      path: proxyReq.path,
      headers: proxyReq.getHeaders()
    });
  },
  onProxyRes: function (proxyRes, req, res) {
    proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:8080';
    // Log the response status
    console.log('Cloudflare Response:', {
      status: proxyRes.statusCode,
      headers: proxyRes.headers
    });
  },
  onError: function (err, req, res) {
    console.error('Cloudflare Proxy Error:', err);
    res.status(500).send('Proxy Error: ' + err.message);
  },
});

// Use the proxy middleware
app.use('/api/google', googleAIProxy);
app.use('/api/cloudflare', cloudflareProxy);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Proxy server is running on port ${PORT}`);
});
