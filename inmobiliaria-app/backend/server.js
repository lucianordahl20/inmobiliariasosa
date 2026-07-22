require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || 'secret';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// ---------- Auth simple para el panel de administración ----------
function makeToken() {
  const ts = Date.now().toString();
  const sig = crypto.createHmac('sha256', ADMIN_TOKEN_SECRET).update(ts).digest('hex');
  return `${ts}.${sig}`;
}
function isValidToken(token) {
  if (!token) return false;
  const [ts, sig] = token.split('.');
  if (!ts || !sig) return false;
  const expected = crypto.createHmac('sha256', ADMIN_TOKEN_SECRET).update(ts).digest('hex');
  if (expected !== sig) return false;
  // token válido por 12 horas
  const age = Date.now() - Number(ts);
  return age >= 0 && age < 12 * 60 * 60 * 1000;
}
function requireAuth(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (!isValidToken(token)) {
    return res.status(401).json({ error: 'No autorizado. Iniciá sesión de nuevo.' });
  }
  next();
}

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (password === ADMIN_PASSWORD) {
    return res.json({ token: makeToken() });
  }
  res.status(401).json({ error: 'Contraseña incorrecta.' });
});

// ---------- Helpers ----------
function parseProperty(row) {
  return { ...row, images: JSON.parse(row.images || '[]') };
}

// ---------- API pública: búsqueda y listado ----------
app.get('/api/properties', (req, res) => {
  const {
    q, operation, type, city, province,
    price_min, price_max, rooms_min, bedrooms_min,
    area_min, area_max, garage, featured,
    sort = 'recent', page = 1, limit = 12
  } = req.query;

  const where = ["status = 'publicada'"];
  const params = {};

  if (q) {
    where.push("(title LIKE @q OR description LIKE @q OR neighborhood LIKE @q OR address LIKE @q)");
    params.q = `%${q}%`;
  }
  if (operation) { where.push('operation = @operation'); params.operation = operation; }
  if (type) { where.push('type = @type'); params.type = type; }
  if (city) { where.push('city = @city'); params.city = city; }
  if (province) { where.push('province = @province'); params.province = province; }
  if (price_min) { where.push('price >= @price_min'); params.price_min = Number(price_min); }
  if (price_max) { where.push('price <= @price_max'); params.price_max = Number(price_max); }
  if (rooms_min) { where.push('rooms >= @rooms_min'); params.rooms_min = Number(rooms_min); }
  if (bedrooms_min) { where.push('bedrooms >= @bedrooms_min'); params.bedrooms_min = Number(bedrooms_min); }
  if (area_min) { where.push('total_area >= @area_min'); params.area_min = Number(area_min); }
  if (area_max) { where.push('total_area <= @area_max'); params.area_max = Number(area_max); }
  if (garage) { where.push('garage >= 1'); }
  if (featured) { where.push('featured = 1'); }

  const orderBy = {
    recent: 'created_at DESC',
    price_asc: 'price ASC',
    price_desc: 'price DESC',
    area_desc: 'total_area DESC'
  }[sort] || 'created_at DESC';

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(48, Math.max(1, Number(limit)));
  const offset = (pageNum - 1) * limitNum;

  const total = db.prepare(`SELECT COUNT(*) as c FROM properties ${whereSql}`).get(params).c;
  const rows = db.prepare(`
    SELECT * FROM properties ${whereSql}
    ORDER BY ${orderBy}
    LIMIT @limit OFFSET @offset
  `).all({ ...params, limit: limitNum, offset });

  res.json({
    results: rows.map(parseProperty),
    total,
    page: pageNum,
    totalPages: Math.max(1, Math.ceil(total / limitNum))
  });
});

// Ciudades y provincias disponibles (para poblar filtros dinámicamente)
app.get('/api/meta/locations', (req, res) => {
  const cities = db.prepare(`SELECT DISTINCT city, province FROM properties WHERE status = 'publicada' ORDER BY city`).all();
  res.json(cities);
});

app.get('/api/properties/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Propiedad no encontrada.' });
  res.json(parseProperty(row));
});

// ---------- API admin: alta, edición, baja ----------
app.get('/api/admin/properties', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM properties ORDER BY created_at DESC').all();
  res.json(rows.map(parseProperty));
});

app.post('/api/admin/properties', requireAuth, (req, res) => {
  const b = req.body || {};
  if (!b.title || !b.operation || !b.type || !b.price || !b.city || !b.province) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (título, operación, tipo, precio, ciudad, provincia).' });
  }
  const stmt = db.prepare(`
    INSERT INTO properties
    (title, description, operation, type, price, currency, address, neighborhood, city, province,
     rooms, bedrooms, bathrooms, total_area, covered_area, garage, antiquity, lat, lng, images, featured,
     status, contact_name, contact_phone)
    VALUES (@title, @description, @operation, @type, @price, @currency, @address, @neighborhood, @city, @province,
     @rooms, @bedrooms, @bathrooms, @total_area, @covered_area, @garage, @antiquity, @lat, @lng, @images, @featured,
     @status, @contact_name, @contact_phone)
  `);
  const info = stmt.run({
    title: b.title,
    description: b.description || '',
    operation: b.operation,
    type: b.type,
    price: Number(b.price),
    currency: b.currency || 'USD',
    address: b.address || '',
    neighborhood: b.neighborhood || '',
    city: b.city,
    province: b.province,
    rooms: Number(b.rooms || 0),
    bedrooms: Number(b.bedrooms || 0),
    bathrooms: Number(b.bathrooms || 0),
    total_area: b.total_area ? Number(b.total_area) : null,
    covered_area: b.covered_area ? Number(b.covered_area) : null,
    garage: Number(b.garage || 0),
    antiquity: b.antiquity ? Number(b.antiquity) : null,
    lat: b.lat ? Number(b.lat) : null,
    lng: b.lng ? Number(b.lng) : null,
    images: JSON.stringify(b.images || []),
    featured: b.featured ? 1 : 0,
    status: b.status || 'publicada',
    contact_name: b.contact_name || '',
    contact_phone: b.contact_phone || ''
  });
  const row = db.prepare('SELECT * FROM properties WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(parseProperty(row));
});

app.put('/api/admin/properties/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Propiedad no encontrada.' });
  const b = req.body || {};
  const merged = {
    title: b.title ?? existing.title,
    description: b.description ?? existing.description,
    operation: b.operation ?? existing.operation,
    type: b.type ?? existing.type,
    price: b.price !== undefined ? Number(b.price) : existing.price,
    currency: b.currency ?? existing.currency,
    address: b.address ?? existing.address,
    neighborhood: b.neighborhood ?? existing.neighborhood,
    city: b.city ?? existing.city,
    province: b.province ?? existing.province,
    rooms: b.rooms !== undefined ? Number(b.rooms) : existing.rooms,
    bedrooms: b.bedrooms !== undefined ? Number(b.bedrooms) : existing.bedrooms,
    bathrooms: b.bathrooms !== undefined ? Number(b.bathrooms) : existing.bathrooms,
    total_area: b.total_area !== undefined ? Number(b.total_area) : existing.total_area,
    covered_area: b.covered_area !== undefined ? Number(b.covered_area) : existing.covered_area,
    garage: b.garage !== undefined ? Number(b.garage) : existing.garage,
    antiquity: b.antiquity !== undefined ? Number(b.antiquity) : existing.antiquity,
    lat: b.lat !== undefined ? Number(b.lat) : existing.lat,
    lng: b.lng !== undefined ? Number(b.lng) : existing.lng,
    images: b.images !== undefined ? JSON.stringify(b.images) : existing.images,
    featured: b.featured !== undefined ? (b.featured ? 1 : 0) : existing.featured,
    status: b.status ?? existing.status,
    contact_name: b.contact_name ?? existing.contact_name,
    contact_phone: b.contact_phone ?? existing.contact_phone,
    id: req.params.id
  };
  db.prepare(`
    UPDATE properties SET
      title=@title, description=@description, operation=@operation, type=@type, price=@price,
      currency=@currency, address=@address, neighborhood=@neighborhood, city=@city, province=@province,
      rooms=@rooms, bedrooms=@bedrooms, bathrooms=@bathrooms, total_area=@total_area, covered_area=@covered_area,
      garage=@garage, antiquity=@antiquity, lat=@lat, lng=@lng, images=@images, featured=@featured,
      status=@status, contact_name=@contact_name, contact_phone=@contact_phone, updated_at=datetime('now')
    WHERE id=@id
  `).run(merged);
  const row = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
  res.json(parseProperty(row));
});

app.delete('/api/admin/properties/:id', requireAuth, (req, res) => {
  const info = db.prepare('DELETE FROM properties WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Propiedad no encontrada.' });
  res.json({ ok: true });
});

// SPA fallback para rutas de front simples
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
