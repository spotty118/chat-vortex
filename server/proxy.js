const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 8080;

// Configure CORS with specific origins
const corsOptions = {
  origin: ['http://localhost:8081', 'https://preview--chat-vortex.lovable.app'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-goog-api-key'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Proxy middleware configuration for Google Provider via Cloudflare
const googleCloudflareProxy = createProxyMiddleware({
  target: 'https://gateway.ai.cloudflare.com',
  changeOrigin: true,
  secure: true,
  pathRewrite: (path) => {
    // Remove 'models/' from the path if present
    return path.replace('/api/google', '/v1/fe45775498a97cb07c10d3f0d79cc2f0/big/google-ai-studio')
              .replace('models/models/', 'models/');
  },
  onProxyReq: function (proxyReq, req, res) {
    // Copy API key header
    if (req.headers['x-goog-api-key']) {
      proxyReq.setHeader('x-goog-api-key', req.headers['x-goog-api-key']);
    }
    
    // Remove credentials header to prevent CORS issues
    proxyReq.removeHeader('cookie');
    
    // Ensure content type is set
    proxyReq.setHeader('Content-Type', 'application/json');
    
    console.log('Proxying request to:', proxyReq.path);
  },
  onProxyRes: function (proxyRes, req, res) {
    // Remove any existing CORS headers from the response
    delete proxyRes.headers['access-control-allow-origin'];
    delete proxyRes.headers['access-control-allow-credentials'];
    delete proxyRes.headers['access-control-allow-methods'];
    delete proxyRes.headers['access-control-allow-headers'];

    // Get the origin from the request headers
    const origin = req.headers.origin;
    
    // Set new CORS headers on the response
    if (origin && (origin === 'http://localhost:8081' || origin === 'https://preview--chat-vortex.lovable.app')) {
      proxyRes.headers['Access-Control-Allow-Origin'] = origin;
    } else {
      proxyRes.headers['Access-Control-Allow-Origin'] = 'https://preview--chat-vortex.lovable.app';
    }
    
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, x-goog-api-key';
    
    console.log('Response headers:', proxyRes.headers);
  }
});

// Mount the proxy middleware
app.use('/api/google', googleCloudflareProxy);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Proxy Error:', err);
  res.status(500).json({ error: 'Proxy Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});