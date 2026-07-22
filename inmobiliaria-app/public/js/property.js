const fmtMoney = (price, currency) => {
  const symbol = currency === 'USD' ? 'US$' : '$';
  return `${symbol} ${Number(price).toLocaleString('es-AR')}`;
};

const typeLabels = {
  casa: 'Casa', departamento: 'Departamento', ph: 'PH', terreno: 'Terreno',
  local: 'Local comercial', oficina: 'Oficina'
};

async function loadDetail() {
  const id = new URLSearchParams(window.location.search).get('id');
  const content = document.getElementById('content');
  if (!id) {
    content.innerHTML = `<div class="empty-state" style="margin:60px 0"><h3>No se especificó una propiedad</h3><a href="/" class="btn btn-ghost">Volver al buscador</a></div>`;
    return;
  }
  try {
    const res = await fetch(`/api/properties/${id}`);
    if (!res.ok) throw new Error('not found');
    const p = await res.json();
    document.title = `${p.title} · Catálogo`;
    document.getElementById('crumbTitle').textContent = p.title;

    const images = p.images && p.images.length ? p.images : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900'];
    const mainImg = images[0];
    const sideImgs = images.slice(1, 3);

    content.innerHTML = `
      <div class="detail-grid">
        <div>
          <div class="gallery">
            <img class="main" src="${mainImg}" alt="${p.title}">
            ${sideImgs.map(src => `<img class="side" src="${src}" alt="${p.title}">`).join('') || `<img class="side" src="${mainImg}" alt="">`}
          </div>

          <h1 class="detail-title">${p.title}</h1>
          <div class="card-loc" style="margin-top:6px">${p.address ? p.address + ' · ' : ''}${p.neighborhood ? p.neighborhood + ', ' : ''}${p.city}, ${p.province}</div>
          <p class="detail-desc">${p.description || 'Sin descripción disponible.'}</p>

          <div class="spec-sheet">
            <div class="spec-row"><span class="k">Tipo</span><span class="v">${typeLabels[p.type] || p.type}</span></div>
            <div class="spec-row"><span class="k">Operación</span><span class="v">${p.operation === 'venta' ? 'Venta' : 'Alquiler'}</span></div>
            ${p.total_area ? `<div class="spec-row"><span class="k">Superficie total</span><span class="v">${p.total_area} m²</span></div>` : ''}
            ${p.covered_area ? `<div class="spec-row"><span class="k">Superficie cubierta</span><span class="v">${p.covered_area} m²</span></div>` : ''}
            ${p.rooms ? `<div class="spec-row"><span class="k">Ambientes</span><span class="v">${p.rooms}</span></div>` : ''}
            ${p.bedrooms ? `<div class="spec-row"><span class="k">Dormitorios</span><span class="v">${p.bedrooms}</span></div>` : ''}
            ${p.bathrooms ? `<div class="spec-row"><span class="k">Baños</span><span class="v">${p.bathrooms}</span></div>` : ''}
            <div class="spec-row"><span class="k">Cochera</span><span class="v">${p.garage ? 'Sí' : 'No'}</span></div>
            ${p.antiquity !== null && p.antiquity !== undefined ? `<div class="spec-row"><span class="k">Antigüedad</span><span class="v">${p.antiquity === 0 ? 'A estrenar' : p.antiquity + ' años'}</span></div>` : ''}
            <div class="spec-row"><span class="k">N° de listado</span><span class="v">${String(p.id).padStart(3,'0')}</span></div>
          </div>
        </div>

        <aside>
          <div class="sidebar-card">
            <span class="sidebar-op">${p.operation === 'venta' ? 'En venta' : 'En alquiler'}</span>
            <div class="sidebar-price">${fmtMoney(p.price, p.currency)}${p.operation === 'alquiler' ? ' / mes' : ''}</div>
            <div class="contact-box">
              <div class="name">${p.contact_name || 'Contacto de la inmobiliaria'}</div>
              <div class="phone">${p.contact_phone || ''}</div>
            </div>
            <a class="btn btn-primary" style="display:block;text-align:center;margin-top:16px" href="https://wa.me/${(p.contact_phone||'').replace(/[^0-9]/g,'')}?text=${encodeURIComponent('Hola, me interesa la propiedad "' + p.title + '" (N° ' + p.id + ')')}" target="_blank" rel="noopener">Consultar por WhatsApp</a>
          </div>
        </aside>
      </div>
    `;
  } catch (err) {
    content.innerHTML = `<div class="empty-state" style="margin:60px 0"><h3>No encontramos esta propiedad</h3><p>Puede que haya sido dada de baja.</p><a href="/" class="btn btn-ghost">Volver al buscador</a></div>`;
  }
}

loadDetail();
