let token = sessionStorage.getItem('admin_token') || '';
let properties = [];

const fmtMoney = (price, currency) => {
  const symbol = currency === 'USD' ? 'US$' : '$';
  return `${symbol} ${Number(price).toLocaleString('es-AR')}`;
};

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

function showPanel() {
  document.getElementById('loginBox').style.display = 'none';
  document.getElementById('panelBox').style.display = 'block';
  loadTable();
}

async function loadTable() {
  const res = await fetch('/api/admin/properties', { headers: { 'x-admin-token': token } });
  if (res.status === 401) { logout(); return; }
  properties = await res.json();
  renderTable();
}

function renderTable() {
  const tbody = document.getElementById('tableBody');
  if (!properties.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:30px">Todavía no cargaste ninguna propiedad.</td></tr>`;
    return;
  }
  tbody.innerHTML = properties.map(p => `
    <tr>
      <td class="mono">${String(p.id).padStart(3,'0')}</td>
      <td>${p.title}</td>
      <td>${p.operation === 'venta' ? 'Venta' : 'Alquiler'}</td>
      <td>${p.type}</td>
      <td>${p.city}</td>
      <td class="mono">${fmtMoney(p.price, p.currency)}</td>
      <td>${p.status === 'publicada' ? 'Publicada' : 'Pausada'}</td>
      <td class="table-actions">
        <button data-edit="${p.id}">Editar</button>
        <button data-delete="${p.id}" class="danger">Eliminar</button>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('button[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openModal(Number(btn.dataset.edit)));
  });
  tbody.querySelectorAll('button[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => deleteProperty(Number(btn.dataset.delete)));
  });
}

function fillForm(p) {
  document.getElementById('propId').value = p.id || '';
  document.getElementById('f_title').value = p.title || '';
  document.getElementById('f_description').value = p.description || '';
  document.getElementById('f_operation').value = p.operation || 'venta';
  document.getElementById('f_type').value = p.type || 'casa';
  document.getElementById('f_price').value = p.price || '';
  document.getElementById('f_currency').value = p.currency || 'USD';
  document.getElementById('f_city').value = p.city || '';
  document.getElementById('f_province').value = p.province || '';
  document.getElementById('f_address').value = p.address || '';
  document.getElementById('f_neighborhood').value = p.neighborhood || '';
  document.getElementById('f_rooms').value = p.rooms || '';
  document.getElementById('f_bedrooms').value = p.bedrooms || '';
  document.getElementById('f_bathrooms').value = p.bathrooms || '';
  document.getElementById('f_total_area').value = p.total_area || '';
  document.getElementById('f_covered_area').value = p.covered_area || '';
  document.getElementById('f_antiquity').value = (p.antiquity ?? '');
  document.getElementById('f_garage').value = p.garage ? '1' : '0';
  document.getElementById('f_featured').value = p.featured ? '1' : '0';
  document.getElementById('f_image').value = (p.images && p.images[0]) || '';
  document.getElementById('f_contact_name').value = p.contact_name || '';
  document.getElementById('f_contact_phone').value = p.contact_phone || '';
  document.getElementById('f_status').value = p.status || 'publicada';
}

function openModal(id) {
  const backdrop = document.getElementById('modalBackdrop');
  if (id) {
    const p = properties.find(x => x.id === id);
    document.getElementById('modalTitle').textContent = `Editar propiedad N° ${String(id).padStart(3,'0')}`;
    fillForm(p);
  } else {
    document.getElementById('modalTitle').textContent = 'Nueva propiedad';
    fillForm({});
  }
  backdrop.classList.add('open');
}

function closeModal() {
  document.getElementById('modalBackdrop').classList.remove('open');
}

async function deleteProperty(id) {
  if (!confirm('¿Seguro que querés eliminar esta propiedad? Esta acción no se puede deshacer.')) return;
  const res = await fetch(`/api/admin/properties/${id}`, { method: 'DELETE', headers: { 'x-admin-token': token } });
  if (res.ok) {
    showToast('Propiedad eliminada.');
    loadTable();
  } else {
    showToast('No se pudo eliminar la propiedad.');
  }
}

document.getElementById('propertyForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('propId').value;
  const body = {
    title: document.getElementById('f_title').value,
    description: document.getElementById('f_description').value,
    operation: document.getElementById('f_operation').value,
    type: document.getElementById('f_type').value,
    price: document.getElementById('f_price').value,
    currency: document.getElementById('f_currency').value,
    city: document.getElementById('f_city').value,
    province: document.getElementById('f_province').value,
    address: document.getElementById('f_address').value,
    neighborhood: document.getElementById('f_neighborhood').value,
    rooms: document.getElementById('f_rooms').value,
    bedrooms: document.getElementById('f_bedrooms').value,
    bathrooms: document.getElementById('f_bathrooms').value,
    total_area: document.getElementById('f_total_area').value,
    covered_area: document.getElementById('f_covered_area').value,
    antiquity: document.getElementById('f_antiquity').value,
    garage: document.getElementById('f_garage').value === '1',
    featured: document.getElementById('f_featured').value === '1',
    images: document.getElementById('f_image').value ? [document.getElementById('f_image').value] : [],
    contact_name: document.getElementById('f_contact_name').value,
    contact_phone: document.getElementById('f_contact_phone').value,
    status: document.getElementById('f_status').value
  };

  const url = id ? `/api/admin/properties/${id}` : '/api/admin/properties';
  const method = id ? 'PUT' : 'POST';
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
    body: JSON.stringify(body)
  });
  if (res.ok) {
    showToast(id ? 'Propiedad actualizada.' : 'Propiedad creada.');
    closeModal();
    loadTable();
  } else {
    const err = await res.json();
    showToast(err.error || 'No se pudo guardar la propiedad.');
  }
});

document.getElementById('newBtn').addEventListener('click', () => openModal(null));
document.getElementById('cancelBtn').addEventListener('click', closeModal);
document.getElementById('modalBackdrop').addEventListener('click', (e) => {
  if (e.target.id === 'modalBackdrop') closeModal();
});

function logout() {
  sessionStorage.removeItem('admin_token');
  token = '';
  document.getElementById('loginBox').style.display = 'block';
  document.getElementById('panelBox').style.display = 'none';
}
document.getElementById('logoutBtn').addEventListener('click', logout);

document.getElementById('loginBtn').addEventListener('click', async () => {
  const password = document.getElementById('password').value;
  const errEl = document.getElementById('loginError');
  errEl.textContent = '';
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (res.ok) {
      token = data.token;
      sessionStorage.setItem('admin_token', token);
      showPanel();
    } else {
      errEl.textContent = data.error || 'No se pudo iniciar sesión.';
    }
  } catch (err) {
    errEl.textContent = 'No se pudo conectar con el servidor.';
  }
});
document.getElementById('password').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('loginBtn').click();
});

if (token) showPanel();
