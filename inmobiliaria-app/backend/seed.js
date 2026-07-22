const db = require('./db');

const sample = [
  {
    title: 'Casa amplia con quincho en Barrio Parque',
    description: 'Casa de 3 dormitorios con jardín, quincho y pileta. Zona tranquila y arbolada, a 5 cuadras del centro.',
    operation: 'venta', type: 'casa', price: 145000, currency: 'USD',
    address: 'Calle Los Alamos 245', neighborhood: 'Barrio Parque', city: 'La Rioja', province: 'La Rioja',
    rooms: 5, bedrooms: 3, bathrooms: 2, total_area: 380, covered_area: 210, garage: 2, antiquity: 8,
    lat: -29.4131, lng: -66.8558,
    images: JSON.stringify(['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800']),
    featured: 1, contact_name: 'Boutique Creativa', contact_phone: '+54 380 400-0000'
  },
  {
    title: 'Departamento a estrenar frente a plaza',
    description: 'Monoambiente luminoso, a estrenar, con balcón. Ideal inversión o primera vivienda.',
    operation: 'venta', type: 'departamento', price: 48000, currency: 'USD',
    address: 'Av. Ortiz de Ocampo 120', neighborhood: 'Centro', city: 'La Rioja', province: 'La Rioja',
    rooms: 1, bedrooms: 1, bathrooms: 1, total_area: 42, covered_area: 40, garage: 0, antiquity: 0,
    lat: -29.4126, lng: -66.8517,
    images: JSON.stringify(['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800']),
    featured: 1, contact_name: 'Boutique Creativa', contact_phone: '+54 380 400-0000'
  },
  {
    title: 'Alquiler departamento 2 ambientes',
    description: 'Departamento de 2 ambientes con cochera, apto profesional. Excelente ubicación céntrica.',
    operation: 'alquiler', type: 'departamento', price: 220000, currency: 'ARS',
    address: 'San Nicolás de Bari 780', neighborhood: 'Centro', city: 'La Rioja', province: 'La Rioja',
    rooms: 2, bedrooms: 1, bathrooms: 1, total_area: 55, covered_area: 55, garage: 1, antiquity: 12,
    lat: -29.4143, lng: -66.8563,
    images: JSON.stringify(['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800']),
    featured: 0, contact_name: 'Boutique Creativa', contact_phone: '+54 380 400-0000'
  },
  {
    title: 'Terreno en country club',
    description: 'Lote en esquina dentro de country con seguridad 24hs, apto para construir.',
    operation: 'venta', type: 'terreno', price: 32000, currency: 'USD',
    address: 'Lote 45, Country El Bosque', neighborhood: 'Country El Bosque', city: 'La Rioja', province: 'La Rioja',
    rooms: 0, bedrooms: 0, bathrooms: 0, total_area: 600, covered_area: 0, garage: 0, antiquity: null,
    lat: -29.40, lng: -66.83,
    images: JSON.stringify(['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800']),
    featured: 0, contact_name: 'Boutique Creativa', contact_phone: '+54 380 400-0000'
  },
  {
    title: 'Casa tipo PH en Chilecito',
    description: 'PH de dos dormitorios con patio propio, ideal familia. A metros de la ruta 40.',
    operation: 'venta', type: 'ph', price: 68000, currency: 'USD',
    address: 'Ruta 40 km 3', neighborhood: 'Santa Rita', city: 'Chilecito', province: 'La Rioja',
    rooms: 3, bedrooms: 2, bathrooms: 1, total_area: 150, covered_area: 90, garage: 1, antiquity: 15,
    lat: -29.1667, lng: -67.4972,
    images: JSON.stringify(['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800']),
    featured: 0, contact_name: 'Boutique Creativa', contact_phone: '+54 380 400-0000'
  },
  {
    title: 'Local comercial sobre avenida principal',
    description: 'Local a la calle con vidriera, depósito y baño. Alto tránsito peatonal y vehicular.',
    operation: 'alquiler', type: 'local', price: 350000, currency: 'ARS',
    address: 'Av. Rivadavia 890', neighborhood: 'Centro', city: 'La Rioja', province: 'La Rioja',
    rooms: 1, bedrooms: 0, bathrooms: 1, total_area: 80, covered_area: 80, garage: 0, antiquity: 20,
    lat: -29.4139, lng: -66.8529,
    images: JSON.stringify(['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800']),
    featured: 1, contact_name: 'Boutique Creativa', contact_phone: '+54 380 400-0000'
  },
  {
    title: 'Casa a nuevo en Barrio Evita',
    description: 'Casa de 3 dormitorios a estrenar, cocina integrada, patio con parrilla.',
    operation: 'venta', type: 'casa', price: 98000, currency: 'USD',
    address: 'Calle Belgrano 456', neighborhood: 'Barrio Evita', city: 'La Rioja', province: 'La Rioja',
    rooms: 4, bedrooms: 3, bathrooms: 2, total_area: 220, covered_area: 130, garage: 1, antiquity: 1,
    lat: -29.42, lng: -66.86,
    images: JSON.stringify(['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800']),
    featured: 0, contact_name: 'Boutique Creativa', contact_phone: '+54 380 400-0000'
  },
  {
    title: 'Oficina en edificio corporativo',
    description: 'Oficina de dos ambientes, aire acondicionado central, recepción compartida.',
    operation: 'alquiler', type: 'oficina', price: 280000, currency: 'ARS',
    address: 'Torre Norte, piso 4', neighborhood: 'Centro', city: 'La Rioja', province: 'La Rioja',
    rooms: 2, bedrooms: 0, bathrooms: 1, total_area: 60, covered_area: 60, garage: 1, antiquity: 5,
    lat: -29.4118, lng: -66.8541,
    images: JSON.stringify(['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800']),
    featured: 0, contact_name: 'Boutique Creativa', contact_phone: '+54 380 400-0000'
  }
];

const insert = db.prepare(`
  INSERT INTO properties
  (title, description, operation, type, price, currency, address, neighborhood, city, province,
   rooms, bedrooms, bathrooms, total_area, covered_area, garage, antiquity, lat, lng, images, featured,
   contact_name, contact_phone)
  VALUES (@title, @description, @operation, @type, @price, @currency, @address, @neighborhood, @city, @province,
   @rooms, @bedrooms, @bathrooms, @total_area, @covered_area, @garage, @antiquity, @lat, @lng, @images, @featured,
   @contact_name, @contact_phone)
`);

const existing = db.prepare('SELECT COUNT(*) as c FROM properties').get();
if (existing.c === 0) {
  const insertMany = db.transaction((rows) => {
    for (const row of rows) insert.run(row);
  });
  insertMany(sample);
  console.log(`Se cargaron ${sample.length} propiedades de ejemplo.`);
} else {
  console.log(`La base ya tiene ${existing.c} propiedades, no se cargaron datos de ejemplo.`);
}
