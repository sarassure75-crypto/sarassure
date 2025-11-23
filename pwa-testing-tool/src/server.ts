import express from 'express';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { setRoutes } from './routes/index';

const app = express();
const PORT = process.env.PORT || 3000;
const USE_HTTPS = process.env.USE_HTTPS !== 'false';
const CERTS_DIR = path.join(__dirname, '../certs');

// Function to generate self-signed certificate if it doesn't exist
function ensureCertificates(): { key: string; cert: string } | null {
    if (!USE_HTTPS) return null;
    
    const keyPath = path.join(CERTS_DIR, 'key.pem');
    const certPath = path.join(CERTS_DIR, 'cert.pem');
    
    // If certificates already exist, return them
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        return {
            key: fs.readFileSync(keyPath, 'utf8'),
            cert: fs.readFileSync(certPath, 'utf8')
        };
    }
    
    // Create certs directory if it doesn't exist
    if (!fs.existsSync(CERTS_DIR)) {
        fs.mkdirSync(CERTS_DIR, { recursive: true });
    }
    
    console.log('📜 Generating self-signed certificates...');
    
    try {
        // Try to use openssl if available
        const result = spawnSync('openssl', [
            'req', '-x509', '-newkey', 'rsa:2048', '-nodes',
            '-out', certPath, '-keyout', keyPath, '-days', '365',
            '-subj', '/CN=localhost'
        ], { stdio: 'pipe' });
        
        if (result.error || result.status !== 0) {
            throw new Error('OpenSSL not available');
        }
        
        console.log('✅ Certificates generated successfully!');
        return {
            key: fs.readFileSync(keyPath, 'utf8'),
            cert: fs.readFileSync(certPath, 'utf8')
        };
    } catch (error) {
        console.warn('⚠️  Could not generate HTTPS certificates. Falling back to HTTP.');
        console.warn('   To use HTTPS, install OpenSSL or create certificates manually.');
        return null;
    }
}

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../src/public')));

// Set up routes
setRoutes(app);

// Start the server
const certs = ensureCertificates();

if (certs && USE_HTTPS) {
    const options = {
        key: certs.key,
        cert: certs.cert
    };
    https.createServer(options, app).listen(PORT, () => {
        console.log(`🔒 Secure server running on https://localhost:${PORT}`);
        console.log(`📱 Test on mobile: https://<your-ip>:${PORT}`);
    });
} else {
    http.createServer(app).listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📱 Test on mobile: http://<your-ip>:${PORT}`);
    });
}