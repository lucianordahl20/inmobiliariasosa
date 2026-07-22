const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS properties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  operation TEXT NOT NULL,          -- 'venta' | 'alquiler'
  type TEXT NOT NULL,               -- 'casa' | 'departamento' | 'terreno' | 'local' | 'oficina' | 'ph'
  price REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  address TEXT,
  neighborhood TEXT,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  rooms INTEGER DEFAULT 0,
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  total_area REAL,
  covered_area REAL,
  garage INTEGER DEFAULT 0,
  antiquity INTEGER,
  lat REAL,
  lng REAL,
  images TEXT DEFAULT '[]',         -- JSON array de URLs
  featured INTEGER DEFAULT 0,
  status TEXT DEFAULT 'publicada',  -- 'publicada' | 'pausada'
  contact_name TEXT,
  contact_phone TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_properties_operation ON properties(operation);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
`);

module.exports = db;
