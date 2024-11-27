const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 8080;

// Configure CORS with specific origins and options
const corsOptions = {
  origin: [
    'http://localhost:8081',
    'https://preview--chat-vortex.lovable.app'
  ],
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

// Common proxy configuration
const createProxy = (pathPrefix, targetPath) => {
  return createProxyMiddleware({
    target: 'https://gateway.ai.cloudflare.com',
    changeOrigin: true,
    secure: true,
    pathRewrite: (path) => path.replace(pathPrefix, targetPath),
    onProxyReq: (proxyReq, req, res) => {
      // Copy headers
      if (req.headers['x-goog-api-key']) {
        proxyReq.setHeader('x-goog-api-key', req.headers['x-goog-api-key']);
      }
      
      // Remove credentials header
      proxyReq.removeHeader('cookie');
      
      // Set content type
      proxyReq.setHeader('Content-Type', 'application/json');
      
      console.log(`Proxying ${req.method} request to:`, proxyReq.path);
    },
    onProxyRes: (proxyRes, req, res) => {
      const origin = req.headers.origin;
      
      // Remove existing CORS headers
      delete proxyRes.headers['access-control-allow-origin'];
      delete proxyRes.headers['access-control-allow-credentials'];
      delete proxyRes.headers['access-control-allow-methods'];
      delete proxyRes.headers['access-control-allow-headers'];
      
      // Set CORS headers if origin is allowed
      if (origin && corsOptions.origin.includes(origin)) {
        proxyRes.headers['Access-Control-Allow-Origin'] = origin;
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, x-goog-api-key';
        
        console.log(`Set CORS headers for origin:`, origin);
      }
      
      console.log(`Response headers:`, proxyRes.headers);
    },
    onError: (err, req, res) => {
      console.error('Proxy Error:', err);
      res.status(500).json({ 
        error: 'Proxy Error', 
        message: err.message,
        path: req.path
      });
    }
  });
};

// Mount proxy middlewares
app.use('/api/google', createProxy(
  '/api/google',
  '/v1/fe45775498a97cb07c10d3f0d79cc2f0/big/google-ai-studio'
));

app.use('/api/cloudflare', createProxy(
  '/api/cloudflare',
  '/v1/fe45775498a97cb07c10d3f0d79cc2f0/big/openai'
));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: 'Server Error', 
    message: err.message,
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log('Allowed origins:', corsOptions.origin);
});