const express = require('express');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'chiltepin2024';
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const IMG_DIR = path.join(ROOT_DIR, 'img');

const MENU_FILE = path.join(DATA_DIR, 'menu.json');
const VERSION_FILE = path.join(DATA_DIR, 'version.json');

const sessions = {};

setInterval(() => {
    const now = Date.now();
    for (const token in sessions) {
        if (sessions[token].expires < now) delete sessions[token];
    }
}, 60 * 60 * 1000);

function getVersion() {
    try {
        return JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8')).version;
    } catch {
        const v = { version: 1 };
        fs.writeFileSync(VERSION_FILE, JSON.stringify(v));
        return 1;
    }
}

function bumpVersion() {
    const v = getVersion();
    const next = { version: v + 1 };
    fs.writeFileSync(VERSION_FILE, JSON.stringify(next));
    return next.version;
}

function requireAuth(req, res, next) {
    const token = req.cookies && req.cookies.auth;
    const session = token && sessions[token];
    if (session && session.expires > Date.now()) return next();
    if (req.accepts('html')) return res.redirect('/panel?auth=0');
    res.status(401).json({ error: 'No autorizado' });
}

app.use(cookieParser());
app.use(express.json());

// ─── PANEL ─────────────────────────────────────
app.get('/panel', (req, res) => {
    res.sendFile(path.join(ROOT_DIR, 'panel', 'index.html'));
});

app.use(express.static(ROOT_DIR, {
    index: false,
    setHeaders: (res, filePath) => {
        if (/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(filePath)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
        if (/\.(css|js)$/i.test(filePath)) {
            res.setHeader('Cache-Control', 'public, max-age=604800');
        }
    }
}));

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const subPath = req.body.subPath || '';
            const dest = path.join(IMG_DIR, subPath);
            fs.mkdirSync(dest, { recursive: true });
            cb(null, dest);
        },
        filename: (req, file, cb) => {
            const original = req.body.originalName || file.originalname;
            const ext = path.extname(original);
            const base = req.body.targetName || path.basename(original, ext);
            cb(null, base + ext);
        }
    }),
    limits: { fileSize: 10 * 1024 * 1024 }
});

// ─── AUTH ───────────────────────────────────────
app.post('/api/auth', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        const token = crypto.randomUUID();
        sessions[token] = { expires: Date.now() + 24 * 60 * 60 * 1000 };
        res.cookie('auth', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, sameSite: 'lax' });
        return res.json({ ok: true });
    }
    res.status(401).json({ error: 'Contraseña incorrecta' });
});

app.post('/api/logout', (req, res) => {
    const token = req.cookies && req.cookies.auth;
    if (token) delete sessions[token];
    res.clearCookie('auth');
    res.json({ ok: true });
});

// ─── MENU ──────────────────────────────────────
app.get('/api/menu', (req, res) => {
    try {
        res.json(JSON.parse(fs.readFileSync(MENU_FILE, 'utf8')));
    } catch (err) {
        res.status(500).json({ error: 'Error al leer el menú' });
    }
});

app.patch('/api/menu', requireAuth, (req, res) => {
    const { sections, promos } = req.body;
    try {
        const menu = JSON.parse(fs.readFileSync(MENU_FILE, 'utf8'));
        if (sections) {
            sections.forEach(update => {
                const section = menu.sections.find(s => s.name === update.name);
                if (section) {
                    update.items.forEach(itemUpdate => {
                        const item = section.items.find(i => i.name === itemUpdate.name);
                        if (item && typeof itemUpdate.price === 'number') {
                            item.price = itemUpdate.price;
                        }
                    });
                }
            });
        }
        if (promos) {
            promos.forEach(update => {
                const promo = menu.promos.find(p =>
                    p.location === update.location &&
                    p.day === update.day &&
                    p.desc === update.desc
                );
                if (promo && typeof update.price === 'number') {
                    promo.price = update.price;
                }
            });
        }
        fs.writeFileSync(MENU_FILE, JSON.stringify(menu, null, 2));
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Error al guardar el menú' });
    }
});

// ─── IMAGES ────────────────────────────────────
function listImages(dir, base = '') {
    const results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    entries.forEach(entry => {
        const fullPath = path.join(dir, entry.name);
        const relativePath = base ? base + '/' + entry.name : entry.name;
        if (entry.isDirectory()) {
            results.push(...listImages(fullPath, relativePath));
        } else if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(entry.name)) {
            results.push({
                path: 'img/' + relativePath,
                name: entry.name,
                size: fs.statSync(fullPath).size
            });
        }
    });
    return results;
}

app.get('/api/images', requireAuth, (req, res) => {
    try {
        res.json(listImages(IMG_DIR));
    } catch (err) {
        res.status(500).json({ error: 'Error al listar imágenes' });
    }
});

app.post('/api/images/upload', requireAuth, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No se recibió imagen' });
    const version = bumpVersion();
    const relativePath = 'img/' + (req.body.subPath ? req.body.subPath + '/' : '') + req.file.filename;
    res.json({ ok: true, path: relativePath, version });
});

// ─── VERSION ───────────────────────────────────
app.get('/api/version', (req, res) => {
    res.json({ version: getVersion() });
});

// ─── SPA FALLBACK ──────────────────────────────
app.get('*', (req, res, next) => {
    if (req.accepts('html') && !req.path.startsWith('/api/')) {
        const filePath = path.join(ROOT_DIR, req.path);
        if (req.path === '/' || !fs.existsSync(filePath)) {
            return res.sendFile(path.join(ROOT_DIR, 'index.html'));
        }
        return res.sendFile(filePath);
    }
    next();
});

app.listen(PORT, () => {
    console.log(`Chiltepin Seafood corriendo en http://localhost:${PORT}`);
    console.log(`Panel de admin en http://localhost:${PORT}/panel`);
});
