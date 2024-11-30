const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 8080;

// Enhanced CORS configuration
const corsOptions = {
  origin: ['http://localhost:8081', 'https://preview--chat-vortex.lovable.app'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-goog-api-key'],
  credentials: true
};

app.use(cors(corsOptions));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Google AI proxy configuration
const googleProxy = createProxyMiddleware({
  target: 'https://gateway.ai.cloudflare.com',
  changeOrigin: true,
  pathRewrite: (path) => {
    console.log('Original path:', path);
    const newPath = path
      .replace('/api/google', '/v1/fe45775498a97cb07c10d3f0d79cc2f0/big/google-ai-studio')
      .replace(/models\/+/g, 'models/')
      .replace(':generateContent', '/generateContent');
    console.log('Rewritten path:', newPath);
    return newPath;
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('Proxying request to:', proxyReq.path);
    
    if (req.headers['x-goog-api-key']) {
      proxyReq.setHeader('x-goog-api-key', req.headers['x-goog-api-key']);
    }
    
    proxyReq.setHeader('Content-Type', 'application/json');
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('Response status:', proxyRes.statusCode);
    const origin = req.headers.origin;
    
    if (origin && corsOptions.origin.includes(origin)) {
      proxyRes.headers['Access-Control-Allow-Origin'] = origin;
    }
    
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
  },
  onError: (err, req, res) => {
    console.error('Proxy Error:', err);
    res.status(500).json({ error: 'Proxy Error', message: err.message });
  }
});

app.use('/api/google', googleProxy);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Server Error', message: err.message });
});

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log('CORS origins:', corsOptions.origin);
}).on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});