

const billingLabels = { monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly', 'one-time': 'One-Time' };
const currencySymbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'AED ', SGD: 'S$' };

// ── in-memory arrays ─────────────────────────────────────────────────
let plans = [];
let products = [];
let templates = [];

// ── filter state ─────────────────────────────────────────────────────
let planFilter = 'all';
let prodFilter = 'all';
let tmplFilter = 'all';

// =====================================================================
//  FILTER BUTTONS
// =====================================================================
function setPlanFilter(f) {
    planFilter = f;
    ['all', 'active', 'inactive'].forEach(x => {
        const b = document.getElementById('pf-' + x);
        b.className = x === f
            ? 'px-4 py-2 text-sm font-semibold bg-indigo-600 text-white'
            : 'px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50';
    });
    renderPlans();
}
function setProdFilter(f) {
    prodFilter = f;
    ['all', 'active', 'inactive'].forEach(x => {
        const b = document.getElementById('prf-' + x);
        b.className = x === f
            ? 'px-4 py-2 text-sm font-semibold bg-indigo-600 text-white'
            : 'px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50';
    });
    renderProducts();
}
function setTmplFilter(f) {
    tmplFilter = f;
    ['all', 'active', 'inactive'].forEach(x => {
        const b = document.getElementById('tf-' + x);
        if (!b) return;
        b.className = x === f
            ? 'px-4 py-2 text-sm font-semibold bg-emerald-600 text-white'
            : 'px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50';
    });
    renderTemplates();
}


function moveIndicator(el) {
    const indicator = document.getElementById('tabIndicator');
    if (!indicator || !el) return;

    indicator.style.width = el.offsetWidth + 'px';
    indicator.style.transform = `translateX(${el.offsetLeft}px)`;
}

function switchCatalogTab(tab) {


    const tabs = ['plans', 'products', 'templates', 'rtemplates'];

    tabs.forEach(t => {
        const btn = document.getElementById('ct-' + t);
        const panel = document.getElementById('cp-' + t);

        if (!btn) return;

        if (panel) panel.classList.toggle('hidden', t !== tab);

        if (t === tab) {
            btn.classList.add('text-indigo-600');
            btn.classList.remove('text-gray-500');

            moveIndicator(btn);
        } else {
            btn.classList.remove('text-indigo-600');
            btn.classList.add('text-gray-500');
        }
    });
}

window.addEventListener('load', () => {
    const first = document.getElementById('ct-plans');
    if (first) moveIndicator(first);
});
// =====================================================================
//  PLANS  (API)
// =====================================================================
function loadPlans() {
    fetch('/api/catalog/plans')
        .then(r => r.json())
        .then(data => { plans = data; renderPlans(); })
        .catch(() => showToast('Failed to load plans', 'error'));
}

function renderPlans() {
    const q = (document.getElementById('planSearch')?.value || '').toLowerCase();
    const filtered = plans.filter(p =>
        (planFilter === 'all' || p.status === planFilter) &&
        ((p.name || '').toLowerCase().includes(q) ||
            (p.description || '').toLowerCase().includes(q))
    );
    document.getElementById('planTabCount').textContent = plans.length;
    document.getElementById('planCountBadge').textContent = plans.filter(p => p.status === 'active').length;

    const grid = document.getElementById('plansGrid');
    const empty = document.getElementById('plansEmpty');
    if (!filtered.length) { grid.innerHTML = ''; empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden');

    const sym = p => currencySymbols[p.currency] || '₹';
    grid.innerHTML = filtered.map(p => `
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition relative group">
      ${p.img ? `<img src="${p.img}" class="w-full h-24 object-cover rounded-xl mb-4 border border-gray-100">` : ''}
      <div class="flex items-start justify-between mb-2">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
                   M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <div>
            <p class="text-sm font-bold text-gray-900">${p.name}</p>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="text-sm font-bold text-indigo-600">${sym(p)}${Number(p.price || 0).toLocaleString()}</span>
              <span class="text-xs text-gray-400">${billingLabels[p.billingCycle] || p.billingCycle || ''}</span>
            </div>
          </div>
        </div>
        <div class="flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
          <button onclick="openPlanModal(${p.id})"
            class="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center
                   text-gray-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50" title="Edit">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
          </button>
          <button onclick="togglePlanStatus(${p.id})"
            class="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center
                   ${p.status === 'active'
            ? 'text-emerald-500 hover:text-orange-500 hover:border-orange-200 hover:bg-orange-50'
            : 'text-gray-400 hover:text-emerald-500 hover:border-emerald-200 hover:bg-emerald-50'}"
            title="${p.status === 'active' ? 'Set Inactive' : 'Set Active'}">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="${p.status === 'active'
            ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'
            : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'}"/>
            </svg>
          </button>
          <button onclick="deletePlan(${p.id})"
            class="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center
                   text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50" title="Delete">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>
      ${p.description ? `<p class="text-xs text-gray-500 mb-3 leading-relaxed">${p.description}</p>` : ''}
      ${buildFeatureTags(p.features)}
      <div class="flex items-center justify-between mt-2 pt-3 border-t border-gray-50">
        <span class="text-[10px] text-gray-300">Created ${p.createdAt ? p.createdAt.split('T')[0] : (p.created || '')}</span>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}">
          ${p.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>`).join('');
}

function buildFeatureTags(features) {
    let list = [];
    if (Array.isArray(features)) list = features;
    else if (typeof features === 'string' && features.trim())
        list = features.split('\n').map(s => s.trim()).filter(Boolean);
    if (!list.length) return '';
    return `<div class="flex flex-wrap gap-1.5 mb-3">
    ${list.map(f => `<span class="text-[11px] text-indigo-600 font-medium flex items-center gap-1">
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
      </svg>${f}</span>`).join('')}
  </div>`;
}

function togglePlanStatus(id) {
    fetch(`/api/catalog/plans/${id}/toggle-status`, { method: 'PATCH' })
        .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(() => { showToast('Plan status updated', 'success'); loadPlans(); })
        .catch(err => showToast('Error: ' + err.message, 'error'));
}

// ── Plan modal ────────────────────────────────────────────────────────
let currentBilling = 'monthly';
let editPlanId = null;

function openPlanModal(id) {
    editPlanId = id || null;
    document.getElementById('planImgPreview').classList.add('hidden');
    document.getElementById('planImgZone').classList.remove('hidden');
    document.getElementById('planImgInput').value = '';

    if (editPlanId) {
        const p = plans.find(x => x.id === editPlanId);
        if (!p) return;
        document.getElementById('pm_name').value = p.name || '';
        document.getElementById('pm_price').value = p.price || '';
        document.getElementById('pm_desc').value = p.description || '';
        document.getElementById('pm_currency').value = p.currency || 'INR';
        document.getElementById('pm_features').value = Array.isArray(p.features)
            ? p.features.join('\n') : (p.features || '');
        selectBilling(p.billingCycle || 'monthly');
        document.querySelector('#planModal h2').textContent = 'Edit Plan';
        document.querySelector('#planModal button[onclick="createPlan()"]').innerHTML =
            `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg> Save Changes`;
    } else {
        ['pm_name', 'pm_price', 'pm_desc', 'pm_features'].forEach(id => document.getElementById(id).value = '');
        selectBilling('monthly');
        document.querySelector('#planModal h2').textContent = 'New Plan';
        document.querySelector('#planModal button[onclick="createPlan()"]').innerHTML =
            `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg> Create Plan`;
    }
    document.getElementById('planModal').classList.remove('hidden');
}
function closePlanModal() { document.getElementById('planModal').classList.add('hidden'); }

function createPlan() {
    const name = document.getElementById('pm_name').value.trim();
    const price = document.getElementById('pm_price').value;
    if (!name || !price) { showToast('Plan name and price are required', 'error'); return; }

    const payload = {
        name,
        billingCycle: currentBilling,
        currency: document.getElementById('pm_currency').value,
        price: parseFloat(price) || 0,
        description: document.getElementById('pm_desc').value.trim(),
        features: document.getElementById('pm_features').value.trim(),
        status: 'active'
    };

    const isEdit = editPlanId !== null;
    fetch(isEdit ? `/api/catalog/plans/${editPlanId}` : '/api/catalog/plans', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(r => { if (!r.ok) throw new Error('Server error ' + r.status); return r.json(); })
        .then(() => { showToast(isEdit ? 'Plan updated!' : 'Plan created!', 'success'); closePlanModal(); loadPlans(); })
        .catch(err => showToast('Error: ' + err.message, 'error'));
}

function deletePlan(id) {
    if (!confirm('Delete this plan?')) return;
    fetch(`/api/catalog/plans/${id}`, { method: 'DELETE' })
        .then(r => { if (!r.ok) throw new Error(r.status); showToast('Plan deleted', 'success'); loadPlans(); })
        .catch(err => showToast('Error: ' + err.message, 'error'));
}

function selectBilling(b) {
    currentBilling = b;
    ['monthly', 'quarterly', 'yearly', 'one-time'].forEach(x => {
        const btn = document.getElementById('bc-' + x);
        if (!btn) return;
        if (x === b) { btn.classList.add('sel'); btn.classList.remove('border-gray-200', 'text-gray-600'); }
        else { btn.classList.remove('sel', 'border-indigo-500', 'bg-indigo-50', 'text-indigo-600'); btn.classList.add('border-gray-200', 'text-gray-600'); }
    });
}

function previewPlanImg(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
            document.getElementById('planImgThumb').src = e.target.result;
            document.getElementById('planImgPreview').classList.remove('hidden');
            document.getElementById('planImgZone').classList.add('hidden');
        };
        reader.readAsDataURL(input.files[0]);
    }
}
function clearPlanImg() {
    document.getElementById('planImgInput').value = '';
    document.getElementById('planImgPreview').classList.add('hidden');
    document.getElementById('planImgZone').classList.remove('hidden');
}

// =====================================================================
//  PRODUCTS  (API)
// =====================================================================
function loadProducts() {
    fetch('/api/catalog/products')
        .then(r => r.json())
        .then(data => { products = data; renderProducts(); })
        .catch(() => showToast('Failed to load products', 'error'));
}

function renderProducts() {
    const q = (document.getElementById('prodSearch')?.value || '').toLowerCase();
    const filtered = products.filter(p =>
        (prodFilter === 'all' || p.status === prodFilter) &&
        ((p.name || '').toLowerCase().includes(q) ||
            (p.sku || '').toLowerCase().includes(q) ||
            (p.category || '').toLowerCase().includes(q))
    );
    document.getElementById('prodTabCount').textContent = products.length;
    document.getElementById('productCountBadge').textContent = products.filter(p => p.status === 'active').length;

    const grid = document.getElementById('productsGrid');
    const empty = document.getElementById('productsEmpty');
    if (!filtered.length) { grid.innerHTML = ''; empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden');

    const sym = p => currencySymbols[p.currency] || '₹';
    const catColors = {
        Investments: 'bg-blue-50 text-blue-700', Insurance: 'bg-emerald-50 text-emerald-700',
        'Fixed Income': 'bg-violet-50 text-violet-700', Loans: 'bg-orange-50 text-orange-700',
        'Gold & Jewellery': 'bg-yellow-50 text-yellow-700', General: 'bg-gray-100 text-gray-600'
    };

    grid.innerHTML = filtered.map(p => {
        const catCls = catColors[p.category] || 'bg-gray-100 text-gray-600';
        return `
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition relative group">
      ${p.img ? `<img src="${p.img}" class="w-full h-24 object-cover rounded-xl mb-4 border border-gray-100">` : ''}
      <div class="flex justify-end gap-1.5 absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
        <button onclick="openProductModal(${p.id})"
          class="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center
                 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50" title="Edit">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
          </svg>
        </button>
        <button onclick="toggleProductStatus(${p.id})"
          class="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center
                 ${p.status === 'active'
                ? 'text-emerald-500 hover:text-orange-500 hover:border-orange-200 hover:bg-orange-50'
                : 'text-gray-400 hover:text-emerald-500 hover:border-emerald-200 hover:bg-emerald-50'}"
          title="${p.status === 'active' ? 'Set Inactive' : 'Set Active'}">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="${p.status === 'active'
                ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'
                : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'}"/>
          </svg>
        </button>
        <button onclick="deleteProduct(${p.id})"
          class="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center
                 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50" title="Delete">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
      <div class="mb-3">
        <div class="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center mb-2.5">
          <svg class="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <p class="text-sm font-bold text-gray-900">${p.name}</p>
          <span class="text-[10px] font-mono text-gray-400">${p.sku}</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${catCls}">${p.category || 'General'}</span>
        </div>
        <p class="text-base font-bold text-indigo-600 mt-1">${sym(p)}${Number(p.price || 0).toLocaleString()}</p>
        ${p.description ? `<p class="text-xs text-gray-500 mt-1.5 leading-relaxed">${p.description}</p>` : ''}
      </div>
      <div class="flex items-center justify-between pt-3 border-t border-gray-50">
        <span class="text-[10px] text-gray-300">Created ${p.createdAt || ''}</span>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}">
          ${p.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>`;
    }).join('');
}

// editProductId: null = create mode, number = edit mode
let editProductId = null;

function openProductModal(id) {
    editProductId = id || null;
    clearProdImg();

    if (editProductId) {
        const p = products.find(x => x.id === editProductId);
        if (!p) return;
        document.getElementById('prd_name').value = p.name || '';
        document.getElementById('prd_sku').value = p.sku || '';
        document.getElementById('prd_price').value = p.price || '';
        document.getElementById('prd_currency').value = p.currency || 'INR';
        document.getElementById('prd_category').value = p.category || 'General';
        document.getElementById('prd_desc').value = p.description || '';
        document.querySelector('#productModal h2').textContent = 'Edit Product';
        document.querySelector('#productModal button[onclick="createProduct()"]').innerHTML =
            `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg> Save Changes`;
    } else {
        ['prd_name', 'prd_sku', 'prd_price', 'prd_desc'].forEach(id => document.getElementById(id).value = '');
        document.querySelector('#productModal h2').textContent = 'New Product';
        document.querySelector('#productModal button[onclick="createProduct()"]').innerHTML =
            `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg> Create Product`;
    }
    document.getElementById('productModal').classList.remove('hidden');
}
function closeProductModal() { document.getElementById('productModal').classList.add('hidden'); }

function createProduct() {
    const name = document.getElementById('prd_name').value.trim();
    const sku = document.getElementById('prd_sku').value.trim();
    if (!name || !sku) { showToast('Product name and SKU are required', 'error'); return; }

    const imgThumb = document.getElementById('prodImgThumb');
    const img = !document.getElementById('prodImgPreview').classList.contains('hidden') ? imgThumb.src : null;

    const payload = {
        name,
        sku,
        category: document.getElementById('prd_category').value,
        currency: document.getElementById('prd_currency').value,
        price: parseFloat(document.getElementById('prd_price').value) || 0,
        description: document.getElementById('prd_desc').value.trim(),
        img,
        status: 'active'
    };

    const isEdit = editProductId !== null;
    fetch(isEdit ? `/api/catalog/products/${editProductId}` : '/api/catalog/products', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(r => { if (!r.ok) throw new Error('Server error ' + r.status); return r.json(); })
        .then(() => { showToast(isEdit ? 'Product updated!' : 'Product created!', 'success'); closeProductModal(); loadProducts(); })
        .catch(err => showToast('Error: ' + err.message, 'error'));
}

function toggleProductStatus(id) {
    fetch(`/api/catalog/products/${id}/toggle-status`, { method: 'PATCH' })
        .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(() => { showToast('Product status updated', 'success'); loadProducts(); })
        .catch(err => showToast('Error: ' + err.message, 'error'));
}

function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    fetch(`/api/catalog/products/${id}`, { method: 'DELETE' })
        .then(r => { if (!r.ok) throw new Error(r.status); showToast('Product deleted', 'success'); loadProducts(); })
        .catch(err => showToast('Error: ' + err.message, 'error'));
}

function previewProdImg(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
            document.getElementById('prodImgThumb').src = e.target.result;
            document.getElementById('prodImgPreview').classList.remove('hidden');
            document.getElementById('prodImgZone').classList.add('hidden');
        };
        reader.readAsDataURL(input.files[0]);
    }
}
function clearProdImg() {
    const inp = document.getElementById('prodImgInput');
    if (inp) inp.value = '';
    document.getElementById('prodImgPreview')?.classList.add('hidden');
    document.getElementById('prodImgZone')?.classList.remove('hidden');
}

// =====================================================================
//  TEMPLATES  (API)
// =====================================================================
function loadTemplates() {
    fetch('/api/catalog/templates')
        .then(r => r.json())
        .then(data => { templates = data; renderTemplates(); })
        .catch(() => showToast('Failed to load templates', 'error'));
}

function renderTemplates() {
    const q = (document.getElementById('tmplSearch')?.value || '').toLowerCase();
    const filtered = templates.filter(t =>
        (tmplFilter === 'all' || t.status === tmplFilter) &&
        ((t.title || '').toLowerCase().includes(q) ||
            (t.category || '').toLowerCase().includes(q))
    );
    document.getElementById('tmplTabCount').textContent = templates.length;
    document.getElementById('tmplCountBadge').textContent = templates.filter(t => t.status === 'active').length;

    const grid = document.getElementById('templatesGrid');
    if (!filtered.length) { grid.innerHTML = '<p class="text-gray-500 text-sm">No templates found.</p>'; return; }

    const catColors = {
        'Payment Reminder': 'bg-blue-50 text-blue-700',
        'Festival Greeting': 'bg-orange-50 text-orange-700',
        'Promotion Announcement': 'bg-violet-50 text-violet-700',
        'Birthday Wish': 'bg-pink-50 text-pink-700',
        'Policy Renewal': 'bg-red-50 text-red-700',
        'Anniversary': 'bg-rose-50 text-rose-700',
        'General': 'bg-gray-100 text-gray-600'
    };

    // channels may come back as comma-delimited string from server
    const parseChannels = t => {
        if (Array.isArray(t.channelList)) return t.channelList;
        if (typeof t.channels === 'string' && t.channels)
            return t.channels.split(',').map(s => s.trim()).filter(Boolean);
        return [];
    };

    grid.innerHTML = filtered.map(t => {
        const catCls = catColors[t.category] || 'bg-gray-100 text-gray-600';
        const channels = parseChannels(t);
        const escaped = (t.content || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition group tmpl-card relative">
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm font-bold text-gray-900">${t.title}</p>
            <span class="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${catCls}">${t.category}</span>
          </div>
        </div>
        <div class="flex gap-1.5 tmpl-actions opacity-0 group-hover:opacity-100 transition">
          <button onclick="openTemplateModal(${t.id})"
            class="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center
                   text-gray-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50" title="Edit">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
          </button>
          <button onclick="toggleTemplateStatus(${t.id})"
            class="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center
                   ${t.status === 'active'
                ? 'text-emerald-500 hover:text-orange-500 hover:border-orange-200 hover:bg-orange-50'
                : 'text-gray-400 hover:text-emerald-500 hover:border-emerald-200 hover:bg-emerald-50'}"
            title="${t.status === 'active' ? 'Set Inactive' : 'Set Active'}">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="${t.status === 'active'
                ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'
                : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'}"/>
            </svg>
          </button>
          <button onclick="deleteTemplate(${t.id})"
            class="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center
                   text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50" title="Delete">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>
      ${t.description ? `<p class="text-xs text-gray-500 mb-3 line-clamp-2">${t.description}</p>` : ''}
      <div class="bg-gray-50 rounded-xl p-3 mb-3">
        <p class="text-xs text-gray-600 font-mono leading-relaxed line-clamp-3">${escaped.replace(/\n/g, '<br>')}</p>
      </div>
      <div class="flex items-center justify-between">
        <div class="flex gap-1">
          ${channels.map(c => `<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-600">${c}</span>`).join('')}
        </div>
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${t.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}">
            ${t.status === 'active' ? 'Active' : 'Inactive'}
          </span>
          <button onclick="useTemplate(${t.id})" class="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Use →</button>
        </div>
      </div>
    </div>`;
    }).join('');
}

let editTemplateId = null;

function openTemplateModal(id) {
    editTemplateId = id || null;

    if (editTemplateId) {
        const t = templates.find(x => x.id === editTemplateId);
        if (!t) return;
        document.getElementById('tm_title').value = t.title || '';
        document.getElementById('tm_category').value = t.category || 'General';
        document.getElementById('tm_desc').value = t.description || '';
        document.getElementById('tm_content').value = t.content || '';

        // channels
        const ch = Array.isArray(t.channelList) ? t.channelList
            : (t.channels || '').split(',').map(s => s.trim()).filter(Boolean);
        document.getElementById('tm_wa').checked = ch.includes('WhatsApp');
        document.getElementById('tm_sms').checked = ch.includes('SMS');
        document.getElementById('tm_email').checked = ch.includes('Email');

        document.querySelector('#templateModal h2').textContent = 'Edit AI Template';
        document.querySelector('#templateModal button[onclick="createTemplate()"]').innerHTML =
            `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg> Save Template`;
    } else {
        ['tm_title', 'tm_desc', 'tm_content'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('tm_wa').checked = true;
        document.getElementById('tm_sms').checked = false;
        document.getElementById('tm_email').checked = false;
        document.querySelector('#templateModal h2').textContent = 'New AI Template';
        document.querySelector('#templateModal button[onclick="createTemplate()"]').innerHTML =
            `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg> Save AI Template`;
    }
    document.getElementById('templateModal').classList.remove('hidden');
}
function closeTemplateModal() { document.getElementById('templateModal').classList.add('hidden'); }

function generateTemplateContent() {
    const cat = document.getElementById('tm_category').value;
    const desc = document.getElementById('tm_desc').value;
    const map = {
        'Payment Reminder': `Hi {customer_name}! 👋\n\nThis is a friendly reminder that your {plan_name} payment of {amount} is due on {due_date}.\n\nPlease pay to avoid disruption.\n\nFor queries: {business_phone}\n\n— {business_name}`,
        'Festival Greeting': `🎉 {festival} Greetings, {customer_name}!\n\nWishing you joy and prosperity.\n\nSpecial offer: {offer_details}\nValid till: {offer_expiry}\n\n— {business_name}`,
        'Promotion Announcement': `🎊 Special Offer for {customer_name}!\n\n{offer_title}\n{offer_description}\n\nView: {promo_link}\n⏰ Valid till {offer_expiry}\n\n— {business_name}`,
        'Birthday Wish': `🎂 Happy Birthday, {customer_name}!\n\nAs a birthday treat:\n🎁 {offer_details}\n\nWith warm wishes,\n{business_name}`,
        'Policy Renewal': `⚠️ Renewal Reminder, {customer_name}\n\nYour {plan_name} is due for renewal on {due_date}.\n\nRenew now: {renewal_link}\nFor help: {business_phone}\n\n— {business_name}`,
        'Anniversary': `🎊 Happy Anniversary, {customer_name}!\n\nThank you for being with us. As a token of appreciation:\n🎁 {offer_details}\n\n— {business_name}`,
        'General': `Hi {customer_name},\n\n${desc || 'We have an important update for you.'}\n\nContact us at {business_phone}\n\n— {business_name}`,
    };
    document.getElementById('tm_content').value = map[cat] || map['General'];
}

function createTemplate() {
    const title = document.getElementById('tm_title').value.trim();
    const content = document.getElementById('tm_content').value.trim();
    if (!title || !content) { showToast('Title and content are required', 'error'); return; }

    const channels = [];
    if (document.getElementById('tm_wa').checked) channels.push('WhatsApp');
    if (document.getElementById('tm_sms').checked) channels.push('SMS');
    if (document.getElementById('tm_email').checked) channels.push('Email');

    const payload = {
        title,
        category: document.getElementById('tm_category').value,
        description: document.getElementById('tm_desc').value.trim(),
        content,
        channels: channels.join(','),   // stored as comma-delimited
        status: 'active'
    };

    const isEdit = editTemplateId !== null;
    fetch(isEdit ? `/api/catalog/templates/${editTemplateId}` : '/api/catalog/templates', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(r => { if (!r.ok) throw new Error('Server error ' + r.status); return r.json(); })
        .then(() => { showToast(isEdit ? 'Template updated!' : 'Template saved!', 'success'); closeTemplateModal(); loadTemplates(); })
        .catch(err => showToast('Error: ' + err.message, 'error'));
}



// =====================================================================
//  Report TEMPLATES  (API)
// =====================================================================



let rtemplates = [];
let rtColumns = [];

function addColumn(value = '') {
    const id = Date.now();
    rtColumns.push({ id, value });

    renderColumns();
}
function createRTTemplate() {

    const title = document.getElementById('rt_title').value.trim();
    const columns = rtColumns.map(c => c.value.trim()).filter(c => c);

    if (!title) {
        showToast('Title is required', 'error');
        return;
    }

    if (!columns.length) {
        showToast('Add at least one column', 'error');
        return;
    }

    const data = {
        title: title,
        category: document.getElementById('rt_category').value,
        description: document.getElementById('rt_desc').value,
        columns: columns.join(','), // ✅ IMPORTANT FIX
        price: parseFloat(document.getElementById('rt_price').value) || 0,
        showTotal: document.getElementById('rt_total').checked,
        status: "active"
    };

    if (rtEditId) {
        // UPDATE
        fetch(`/api/catalog/rtemplates/${rtEditId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(r => {
                if (!r.ok) throw new Error('Failed to save');
                return r.json();
            })
            .then(() => {
                showToast('Report Template created', 'success');
                closeRTModal();
                resetRTModal();     // ✅ clear form
                loadRTemplates();   // ✅ reload from backend
            })
            .catch(err => showToast(err.message, 'error'));
    } else {
        // CREATE
        fetch('/api/catalog/rtemplates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(r => {
                if (!r.ok) throw new Error('Failed to save');
                return r.json();
            })
            .then(() => {
                showToast('Report Template created', 'success');
                closeRTModal();
                resetRTModal();     // ✅ clear form
                loadRTemplates();   // ✅ reload from backend
            })
            .catch(err => showToast(err.message, 'error'));
    }
}
function resetRTModal() {
    document.getElementById('rt_title').value = '';
    document.getElementById('rt_category').value = '';
    document.getElementById('rt_desc').value = '';
    document.getElementById('rt_price').value = '';
    document.getElementById('rt_total').checked = true;

    rtColumns = [];
    renderColumns();
}
function renderColumns() {
    const container = document.getElementById('rtColumnsContainer');

    container.innerHTML = rtColumns.map(c => `
        <div class="flex gap-2">
            <input value="${c.value}"
                oninput="updateColumn(${c.id}, this.value)"
                class="flex-1 px-3 py-2 border rounded-xl text-sm"
                placeholder="Column name">
            <button onclick="removeColumn(${c.id})" class="text-red-500">✖</button>
        </div>
    `).join('');
}

function updateColumn(id, value) {
    const col = rtColumns.find(c => c.id === id);
    if (col) col.value = value;
}

function removeColumn(id) {
    rtColumns = rtColumns.filter(c => c.id !== id);
    renderColumns();
}

function loadRTemplates() {
    fetch('/api/catalog/rtemplates')
        .then(r => r.json())
        .then(data => {
            rtemplates = data;
            renderRTemplates();
        })
        .catch(() => showToast('Failed to load report templates', 'error'));
}
// ================= RT MODAL =================

function openRTModal() {
    resetRTModal();
    document.getElementById('rtModal').classList.remove('hidden');
}

function closeRTModal() {
    document.getElementById('rtModal').classList.add('hidden');
}


function renderRTemplates() {
    const grid = document.getElementById('rtGrid');
    const badge = document.getElementById('rtBadge');

    if (badge) badge.textContent = rtemplates.length;

    if (!rtemplates.length) {
        grid.innerHTML = '<p class="text-gray-500 text-sm">No templates found</p>';
        return;
    }

    grid.innerHTML = rtemplates.map(t => {

        const cols = ((t.columns || '') + '').split(',').filter(c => c);

        return `
        <div class="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition">

          <!-- HEADER -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                📊
              </div>
              <div>
                <p class="text-sm font-bold text-gray-900">${t.title}</p>
                ${t.category ? `
                  <span class="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-600">
                    ${t.category}
                  </span>` : ''}
              </div>
            </div>

            <!-- ACTIONS -->
            <div class="flex gap-1.5 opacity-0 group-hover:opacity-100 transition">

              <button onclick="openRTEdit(${t.id})"
                class="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center
                       text-gray-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50"
                title="Edit">
                <div class="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
</div>
              </button>

              <button onclick="toggleRTemplate(${t.id})"
                class="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center
                       ${t.status === 'active'
                ? 'text-emerald-500 hover:text-orange-500 hover:border-orange-200 hover:bg-orange-50'
                : 'text-gray-400 hover:text-emerald-500 hover:border-emerald-200 hover:bg-emerald-50'}"
                title="${t.status === 'active' ? 'Set Inactive' : 'Set Active'}">
               <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="${t.status === 'active'
                ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'
                : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'}"/>
            </svg>
              </button>

              <button onclick="deleteRTemplate(${t.id})"
                class="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center
                       text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50"
                title="Delete">
               <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
              </button>

            </div>
          </div>

          <!-- DESCRIPTION -->
          ${t.description ? `
            <p class="text-xs text-gray-500 mb-3 line-clamp-2">${t.description}</p>
          ` : ''}

          <!-- COLUMNS -->
          <div class="flex flex-wrap gap-1 mb-3">
            ${cols.map(c => `
              <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-600">
                ${c}
              </span>
            `).join('')}
          </div>

          <!-- PRICE -->
          <div class="bg-gray-50 rounded-xl p-3 mb-3 flex items-center justify-between">
            <span class="text-xs text-gray-500">Price</span>
            <span class="text-sm font-bold text-indigo-600">₹${t.price || 0}</span>
          </div>

          <!-- FOOTER -->
          <div class="flex items-center justify-between">

            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold
              ${t.status === 'active'
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-gray-100 text-gray-400'}">
              ${t.status === 'active' ? 'Active' : 'Inactive'}
            </span>

            <button onclick="useRTemplate(${t.id})"
              class="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              Use →
            </button>

          </div>

        </div>
        `;
    }).join('');
}

let rtEditId = null;

function openRTEdit(id) {
    const t = rtemplates.find(x => x.id === id);
    if (!t) return;

    rtEditId = id;

    // open modal
    openRTModal();

    // fill values
    document.getElementById('rt_title').value = t.title || '';
    document.getElementById('rt_category').value = t.category || '';
    document.getElementById('rt_desc').value = t.description || '';
    document.getElementById('rt_price').value = t.price || 0;
    document.getElementById('rt_total').checked = t.showTotal ?? true;

    // columns
    rtColumns = [];
    const cols = ((t.columns || '') + '').split(',').filter(c => c);

    cols.forEach(c => addColumn(c));
}

function deleteRTemplate(id) {
    if (!confirm('Delete this template?')) return;

    fetch(`/api/catalog/rtemplates/${id}`, { method: 'DELETE' })
        .then(() => {
            showToast('Deleted', 'success');
            loadRTemplates();
        });
}

function toggleRTemplate(id) {
    fetch(`/api/catalog/rtemplates/${id}/toggle-status`, { method: 'PATCH' })
        .then(() => {
            showToast('Updated', 'success');
            loadRTemplates();
        });
}









function toggleTemplateStatus(id) {
    fetch(`/api/catalog/templates/${id}/toggle-status`, { method: 'PATCH' })
        .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(() => { showToast('Template status updated', 'success'); loadTemplates(); })
        .catch(err => showToast('Error: ' + err.message, 'error'));
}

function deleteTemplate(id) {
    if (!confirm('Delete this template?')) return;
    fetch(`/api/catalog/templates/${id}`, { method: 'DELETE' })
        .then(r => { if (!r.ok) throw new Error(r.status); showToast('Template deleted', 'success'); loadTemplates(); })
        .catch(err => showToast('Error: ' + err.message, 'error'));
}

function useTemplate(id) { showToast('Template selected! Available when creating reminders.', 'success'); }

// =====================================================================
//  TAB SWITCHING
// =====================================================================

// =====================================================================
//  TOAST
// =====================================================================
function showToast(msg, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'fixed bottom-24 md:bottom-6 right-4 z-[100] flex flex-col gap-2';
        document.body.appendChild(container);
    }
    const colors = { success: 'bg-emerald-600', error: 'bg-red-500', info: 'bg-indigo-600' };
    const toast = document.createElement('div');
    toast.className = `${colors[type] || colors.success} text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2 fade-in`;
    toast.innerHTML = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// =====================================================================
//  MOBILE NAV
// =====================================================================
function openMobileNav() {
    document.getElementById('mobileNavDrawer').style.transform = 'translateX(0)';
    document.getElementById('mobileNavBg').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}
function closeMobileNav() {
    document.getElementById('mobileNavDrawer').style.transform = 'translateX(-100%)';
    document.getElementById('mobileNavBg').classList.add('hidden');
    document.body.style.overflow = '';
}

// =====================================================================
//  INIT
// =====================================================================
document.addEventListener('DOMContentLoaded', () => {
    loadPlans();
    loadProducts();
    loadTemplates();
    loadRTemplates();
});
