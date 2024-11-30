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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Proxy middleware configuration for Google Provider via Cloudflare
const googleCloudflareProxy = createProxyMiddleware({
  target: 'https://gateway.ai.cloudflare.com',
  changeOrigin: true,
  secure: true,
  pathRewrite: (path) => {
    console.log('Original path:', path);
    const cleanPath = path
      .replace('/api/google', '/v1/fe45775498a97cb07c10d3f0d79cc2f0/big/google-ai-studio')
      .replace(/models\/+/g, 'models/')
      .replace(':generateContent', '/generateContent');
    console.log('Rewritten path:', cleanPath);
    return cleanPath;
  },
  onProxyReq: function (proxyReq, req, res) {
    console.log('Proxying request to:', proxyReq.path);
    console.log('Request headers:', req.headers);
    
    // Copy API key header
    if (req.headers['x-goog-api-key']) {
      proxyReq.setHeader('x-goog-api-key', req.headers['x-goog-api-key']);
    } else {
      console.warn('No API key found in request headers');
    }
    
    // Remove credentials header to prevent CORS issues
    proxyReq.removeHeader('cookie');
    
    // Ensure content type is set
    proxyReq.setHeader('Content-Type', 'application/json');
  },
  onProxyRes: function (proxyRes, req, res) {
    console.log('Received response from target');
    console.log('Response status:', proxyRes.statusCode);
    
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
  },
  onError: (err, req, res) => {
    console.error('Proxy Error:', err);
    res.status(500).json({
      error: 'Proxy Error',
      message: err.message,
      code: err.code
    });
  }
});

// Mount the proxy middleware
app.use('/api/google', googleCloudflareProxy);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Server Error',
    message: err.message,
    code: err.code
  });
});

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});