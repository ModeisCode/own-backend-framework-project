const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

class EntityServer {
    constructor() {
        this.routes = {
            GET: {},
            POST: {},
        };
        this.server = http.createServer(this.handleRequest.bind(this));
    }

    handleRequest(req, res) {
        const parsedUrl = url.parse(req.url, true);
        const method = req.method;
        const routeHandler = this.routes[method][parsedUrl.pathname];

        if (routeHandler) {
            req.query = parsedUrl.query;
            let body = '';

            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', () => {
                if (body) {
                    req.body = JSON.parse(body);
                }
                routeHandler(req, res);
            });
        } else {
            this.handleStaticFiles(parsedUrl.pathname, res);
        }
    }

    handleStaticFiles(filePath, res) {
        if (filePath === '/') filePath = '/index.html';

        const extname = String(path.extname(filePath)).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.wav': 'audio/wav',
            '.mp4': 'video/mp4',
            '.woff': 'application/font-woff',
            '.ttf': 'application/font-ttf',
            '.eot': 'application/vnd.ms-fontobject',
            '.otf': 'application/font-otf',
            '.wasm': 'application/wasm',
        };

        const contentType = mimeTypes[extname] || 'application/octet-stream';
        const filePathResolved = path.join(__dirname, 'public', filePath);

        fs.readFile(filePathResolved, (error, content) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 Not Found', 'utf-8');
                } else {
                    res.writeHead(500);
                    res.end(`Sorry, check with the site admin for error: ${error.code} ..\n`);
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    }

    get(path, handler) {
        this.routes.GET[path] = handler;
    }

    post(path, handler) {
        this.routes.POST[path] = handler;
    }

    listen(port, callback) {
        this.server.listen(port, callback);
    }
}

module.exports = App;