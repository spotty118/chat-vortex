const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 8080;

const corsOptions = {
  origin: 'http://localhost:8081',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-goog-api-key'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Proxy middleware configuration for Google Provider via Cloudflare
const googleCloudflareProxy = createProxyMiddleware({
  target: 'https://gateway.ai.cloudflare.com',
  changeOrigin: true,
  secure: true,
  pathRewrite: (path) => {
    return path.replace('/api/google', '/v1/fe45775498a97cb07c10d3f0d79cc2f0/big/google-ai-studio');
  },
  onProxyReq: function (proxyReq, req, res) {
    if (req.headers['x-goog-api-key']) {
      proxyReq.setHeader('x-goog-api-key', req.headers['x-goog-api-key']);
    }
    proxyReq.setHeader('Content-Type', 'application/json');
    
    console.log('Proxying to:', proxyReq.path);
  },
  onProxyRes: function (proxyRes, req, res) {
    proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:8081';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, x-goog-api-key';
  }
});

// Mount the proxy middleware
app.use('/api/google', googleCloudflareProxy);

// Error handling
app.use((err, req, res, next) => {
  console.error('Proxy Error:', err);
  res.status(500).json({ error: 'Proxy Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
