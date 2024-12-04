const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 8080;

// Configure CORS with specific origins
const corsOptions = {
  origin: [
    'http://localhost:8081',
    'https://preview--chat-vortex.lovable.app',
    'https://preview-2ad03bd7--chat-vortex.lovable.app'
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

// Create proxy middleware
const proxyMiddleware = createProxyMiddleware({
  target: 'https://gateway.ai.cloudflare.com',
  changeOrigin: true,
  secure: true,
  onProxyReq: (proxyReq, req, res) => {
    // Copy API key header
    if (req.headers['x-goog-api-key']) {
      proxyReq.setHeader('x-goog-api-key', req.headers['x-goog-api-key']);
    }
    
    // Remove credentials header
    proxyReq.removeHeader('cookie');
    
    // Set content type
    proxyReq.setHeader('Content-Type', 'application/json');
    
    console.log('Proxying request to:', proxyReq.path);
  },
  onProxyRes: (proxyRes, req, res) => {
    const origin = req.headers.origin;
    
    // Remove existing CORS headers
    delete proxyRes.headers['access-control-allow-origin'];
    delete proxyRes.headers['access-control-allow-credentials'];
    
    // Set CORS headers if origin is allowed
    if (origin && corsOptions.origin.includes(origin)) {
      proxyRes.headers['Access-Control-Allow-Origin'] = origin;
      proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, x-goog-api-key';
      
      console.log('Setting CORS headers for origin:', origin);
    }
    
    console.log('Response headers:', proxyRes.headers);
  }
});

// Mount proxy routes
app.use('/api/google', (req, res, next) => {
  req.url = req.url.replace('/api/google', '/v1/fe45775498a97cb07c10d3f0d79cc2f0/big/google-ai-studio');
  proxyMiddleware(req, res, next);
});

app.use('/api/cloudflare', (req, res, next) => {
  req.url = req.url.replace('/api/cloudflare', '/v1/fe45775498a97cb07c10d3f0d79cc2f0/big/openai');
  proxyMiddleware(req, res, next);
});

app.use('/api/anthropic', (req, res, next) => {
  // Update the path to use the correct Anthropic endpoint
  const newPath = req.url.replace('/api/anthropic', '/v1/fe45775498a97cb07c10d3f0d79cc2f0/big/anthropic');
  console.log('Anthropic request:', {
    originalUrl: req.url,
    newPath: newPath,
    method: req.method
  });
  req.url = newPath;
  proxyMiddleware(req, res, next);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Proxy Error:', err);
  res.status(500).json({ 
    error: 'Proxy Error', 
    message: err.message,
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log('Allowed origins:', corsOptions.origin);
});