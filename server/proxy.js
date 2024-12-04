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

// Create proxy middleware with detailed logging and error handling
const proxyMiddleware = createProxyMiddleware({
  target: 'https://gateway.ai.cloudflare.com',
  changeOrigin: true,
  secure: true,
  pathRewrite: {
    '^/api/anthropic/models': '/v1/fe45775498a97cb07c10d3f0d79cc2f0/big/anthropic/models',
    '^/api/anthropic/messages': '/v1/fe45775498a97cb07c10d3f0d79cc2f0/big/anthropic/messages',
    '^/api/google': '/v1/fe45775498a97cb07c10d3f0d79cc2f0/big/google-ai-studio',
    '^/api/cloudflare': '/v1/fe45775498a97cb07c10d3f0d79cc2f0/big/openai'
  },
  onProxyReq: (proxyReq, req, res) => {
    // Copy headers
    if (req.headers['x-goog-api-key']) {
      proxyReq.setHeader('x-goog-api-key', req.headers['x-goog-api-key']);
    }
    if (req.headers['authorization']) {
      proxyReq.setHeader('authorization', req.headers['authorization']);
    }
    
    // Remove credentials header
    proxyReq.removeHeader('cookie');
    
    // Set content type for non-GET requests
    if (req.method !== 'GET') {
      proxyReq.setHeader('Content-Type', 'application/json');
    }
    
    console.log('Proxying request:', {
      method: proxyReq.method,
      path: proxyReq.path,
      headers: proxyReq.getHeaders()
    });
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
    }

    // Ensure JSON content type for API responses
    proxyRes.headers['Content-Type'] = 'application/json';
    
    console.log('Proxy response:', {
      statusCode: proxyRes.statusCode,
      headers: proxyRes.headers,
      url: req.url
    });
  },
  onError: (err, req, res) => {
    console.error('Proxy Error:', err);
    res.writeHead(500, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Credentials': 'true'
    });
    res.end(JSON.stringify({ 
      error: 'Proxy Error',
      message: err.message
    }));
  }
});

// Mount proxy middleware for all API routes
app.use('/api', proxyMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: 'Server Error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log('Allowed origins:', corsOptions.origin);
});