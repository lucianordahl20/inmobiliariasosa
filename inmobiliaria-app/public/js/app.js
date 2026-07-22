const state = {
  q: '', operation: '', type: '', price_min: '', price_max: '',
  sort: 'recent', page: 1
};

const fmtMoney = (price, currency) => {
  const symbol = currency === 'USD' ? 'US$' : '$';
  return `${symbol} ${Number(price).toLocaleString('es-AR')}`;
};

function propCardHTML(p, index) {
  const img = (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';
  const specs = [];
  if (p.total_area) specs.push(`${p.total_area} m²`);
  if (p.bedrooms) specs.push(`${p.bedrooms} dorm.`);
  if (p.bathrooms) specs.push(`${p.bathrooms} baño${p.bathrooms > 1 ? 's' : ''}`);
  return `
    <a class="card" href="/property.html?id=${p.id}">
      <div class="card-media">
        <img src="${img}" alt="${p.title}" loading="lazy">
        <span class="card-index">N° ${String(p.id).padStart(3, '0')}</span>
        ${p.featured ? '<span class="card-badge">Destacada</span>' : ''}
      </div>
      <div class="card-body">
        <div class="card-price">${fmtMoney(p.price, p.currency)}${p.operation === 'alquiler' ? ' / mes' : ''}</div>
        <div class="card-title">${p.title}</div>
        <div class="card-loc">${p.neighborhood ? p.neighborhood + ', ' : ''}${p.city}</div>
        <div class="card-specs">${specs.join(' · ')}</div>
      </div>
    </a>
  `;
}

async function loadProperties() {
  const grid = document.getElementById('grid');
  const countEl = document.getElementById('resultsCount');
  grid.innerHTML = Array.from({length:6}).map(() => `<div class="card"><div class="card-media skeleton"></div><div class="card-body"><div class="skeleton" style="height:14px;width:60%"></div></div></div>`).join('');

  const params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  if (state.operation) params.set('operation', state.operation);
  if (state.type) params.set('type', state.type);
  if (state.price_min) params.set('price_min', state.price_min);
  if (state.price_max) params.set('price_max', state.price_max);
  params.set('sort', state.sort);
  params.set('page', state.page);

  try {
    const res = await fetch(`/api/properties?${params.toString()}`);
    const data = await res.json();

    if (!data.results.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><h3>No encontramos propiedades con esos filtros</h3><p>Probá ampliar el rango de precio o cambiar la ubicación.</p></div>`;
      countEl.textContent = 'Sin resultados';
      document.getElementById('pagination').innerHTML = '';
      return;
    }

    grid.innerHTML = data.results.map((p, i) => propCardHTML(p, i)).join('');
    countEl.innerHTML = `<span class="mono">${data.total}</span> propiedades encontradas`;
    renderPagination(data.page, data.totalPages);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><h3>No pudimos cargar el catálogo</h3><p>Revisá que el servidor esté corriendo.</p></div>`;
    countEl.textContent = '';
  }
}

function renderPagination(page, totalPages) {
  const el = document.getElementById('pagination');
  if (totalPages <= 1) { el.innerHTML = ''; return; }
  let html = `<button ${page === 1 ? 'disabled' : ''} data-page="${page - 1}">‹</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  html += `<button ${page === totalPages ? 'disabled' : ''} data-page="${page + 1}">›</button>`;
  el.innerHTML = html;
  el.querySelectorAll('button[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.page = Number(btn.dataset.page);
      loadProperties();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

document.getElementById('searchBtn').addEventListener('click', () => {
  state.q = document.getElementById('q').value.trim();
  state.type = document.getElementById('type').value;
  state.price_min = document.getElementById('price_min').value;
  state.price_max = document.getElementById('price_max').value;
  state.page = 1;
  loadProperties();
});

document.getElementById('q').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('searchBtn').click();
});

document.getElementById('sortSelect').addEventListener('change', (e) => {
  state.sort = e.target.value;
  state.page = 1;
  loadProperties();
});

document.querySelectorAll('#opTabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#opTabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.operation = btn.dataset.op;
    state.page = 1;
    loadProperties();
  });
});

loadProperties();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  });
}
