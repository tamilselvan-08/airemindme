/**
 * catalog.js
 * Wired to: CatlogContoller.java  →  /api/catalog/*
 * Covers:   Plans · Products · Msg Templates · Report Templates
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const API = {
    plans: '/api/catalog/plans',
    products: '/api/catalog/products',
    templates: '/api/catalog/templates',
    rtemplates: '/api/catalog/rtemplates',
    summary: '/api/catalog/summary'
};

const BILLING_LABELS = { monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly', 'one-time': 'One-Time' };
const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'AED ', SGD: 'S$' };

// ─────────────────────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────────────────────
let plans = [];
let products = [];
let templates = [];
let rtemplates = [];

let planFilter = 'all';
let prodFilter = 'all';
let tmplFilter = 'all';

let editPlanId = null;   // null = create, number = edit
let editProductId = null;
let editTemplateId = null;
let editRTId = null;

let currentBilling = 'monthly';
let rtCols = [];     // [{ uid, value }]

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────
function sym(entity) {
    return CURRENCY_SYMBOLS[entity.currency] || '₹';
}

/** Generic fetch wrapper — always sends JSON, always parses JSON */
async function api(url, method = 'GET', body = null) {
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (body !== null) opts.body = JSON.stringify(body);

    const res = await fetch(url, opts);
    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`${res.status}: ${text}`);
    }
    // DELETE returns 200 with empty body
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'fixed bottom-24 md:bottom-6 right-4 z-[100] flex flex-col gap-2';
        document.body.appendChild(container);
    }
    const bg = { success: 'bg-emerald-600', error: 'bg-red-500', info: 'bg-indigo-600' }[type] || 'bg-gray-800';
    const icon = type === 'error'
        ? 'M6 18L18 6M6 6l12 12'
        : 'M5 13l4 4L19 7';
    const toast = document.createElement('div');
    toast.className = `${bg} text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2 fade-in`;
    toast.innerHTML = `<svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${icon}"/></svg>${msg}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE NAV
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// TAB SWITCHING
// ─────────────────────────────────────────────────────────────────────────────
function moveIndicator(el) {
    const ind = document.getElementById('tabIndicator');
    if (!ind || !el) return;
    ind.style.width = el.offsetWidth + 'px';
    ind.style.transform = `translateX(${el.offsetLeft}px)`;
}

function switchCatalogTab(tab) {
    ['plans', 'products', 'templates', 'rtemplates'].forEach(t => {
        const btn = document.getElementById('ct-' + t);
        const panel = document.getElementById('cp-' + t);
        if (panel) panel.classList.toggle('hidden', t !== tab);
        if (!btn) return;
        if (t === tab) { btn.classList.add('text-indigo-600'); btn.classList.remove('text-gray-500'); moveIndicator(btn); }
        else { btn.classList.remove('text-indigo-600'); btn.classList.add('text-gray-500'); }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function setPlanFilter(f) {
    planFilter = f;
    ['all', 'active', 'inactive'].forEach(x => {
        const b = document.getElementById('pf-' + x);
        if (!b) return;
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
        if (!b) return;
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

// ─────────────────────────────────────────────────────────────────────────────
// ╔══════════════════════════════════════════════════════════╗
// ║                         PLANS                           ║
// ╚══════════════════════════════════════════════════════════╝
// ─────────────────────────────────────────────────────────────────────────────
function loadPlans() {
    api(API.plans)
        .then(data => { plans = data; renderPlans(); })
        .catch(err => showToast('Failed to load plans: ' + err.message, 'error'));
}

function renderPlans() {
    const q = (document.getElementById('planSearch')?.value || '').toLowerCase();
    const filtered = plans.filter(p =>
        (planFilter === 'all' || p.status === planFilter) &&
        ((p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q))
    );

    const countEl = document.getElementById('planTabCount');
    const badgeEl = document.getElementById('planCountBadge');
    if (countEl) countEl.textContent = plans.length;
    if (badgeEl) badgeEl.textContent = plans.filter(p => p.status === 'active').length;

    const grid = document.getElementById('plansGrid');
    const empty = document.getElementById('plansEmpty');

    if (!filtered.length) {
        grid.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }
    empty.classList.add('hidden');

    grid.innerHTML = filtered.map(p => `
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition relative group">
      ${p.img ? `<img src="${p.img}" class="w-full h-24 object-cover rounded-xl mb-4 border border-gray-100">` : ''}
      <div class="flex items-start justify-between mb-2">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <div>
            <p class="text-sm font-bold text-gray-900">${p.name}</p>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="text-sm font-bold text-indigo-600">${sym(p)}${Number(p.price || 0).toLocaleString()}</span>
              <span class="text-xs text-gray-400">${BILLING_LABELS[p.billingCycle] || p.billingCycle || ''}</span>
            </div>
          </div>
        </div>
        <div class="flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
          <button onclick="openPlanModal(${p.id})" title="Edit"
            class="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
          </button>
          <button onclick="togglePlanStatus(${p.id})" title="${p.status === 'active' ? 'Set Inactive' : 'Set Active'}"
            class="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center ${p.status === 'active' ? 'text-emerald-500 hover:text-orange-500 hover:border-orange-200 hover:bg-orange-50' : 'text-gray-400 hover:text-emerald-500 hover:border-emerald-200 hover:bg-emerald-50'}">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${p.status === 'active' ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'}"/></svg>
          </button>
          <button onclick="deletePlan(${p.id})" title="Delete"
            class="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </div>
      ${p.description ? `<p class="text-xs text-gray-500 mb-3 leading-relaxed">${p.description}</p>` : ''}
      ${buildFeatureTags(p.features)}
      <div class="flex items-center justify-between mt-2 pt-3 border-t border-gray-50">
        <span class="text-[10px] text-gray-300">Created ${p.createdAt ? p.createdAt.split('T')[0] : ''}</span>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}">${p.status === 'active' ? 'Active' : 'Inactive'}</span>
      </div>
    </div>`).join('');
}

function buildFeatureTags(features) {
    let list = [];
    if (Array.isArray(features)) list = features;
    else if (typeof features === 'string' && features.trim())
        list = features.split('\n').map(s => s.trim()).filter(Boolean);
    if (!list.length) return '';
    return `<div class="flex flex-wrap gap-1.5 mb-3">${list.map(f =>
        `<span class="text-[11px] text-indigo-600 font-medium flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>${f}</span>`
    ).join('')}</div>`;
}

// ── Plan Modal ────────────────────────────────────────────────────────────────
function openPlanModal(id) {
    editPlanId = id || null;
    clearPlanImg();

    if (editPlanId) {
        const p = plans.find(x => x.id === editPlanId);
        if (!p) return;
        document.getElementById('pm_name').value = p.name || '';
        document.getElementById('pm_price').value = p.price || '';
        document.getElementById('pm_desc').value = p.description || '';
        document.getElementById('pm_currency').value = p.currency || 'INR';
        document.getElementById('pm_features').value = Array.isArray(p.features) ? p.features.join('\n') : (p.features || '');
        selectBilling(p.billingCycle || 'monthly');
        document.getElementById('planModalTitle').textContent = 'Edit Plan';
        document.getElementById('planSaveLabel').textContent = 'Save Changes';
    } else {
        ['pm_name', 'pm_price', 'pm_desc', 'pm_features'].forEach(i => document.getElementById(i).value = '');
        document.getElementById('pm_currency').value = 'INR';
        selectBilling('monthly');
        document.getElementById('planModalTitle').textContent = 'New Plan';
        document.getElementById('planSaveLabel').textContent = 'Create Plan';
    }
    document.getElementById('planModal').classList.remove('hidden');
}
function closePlanModal() { document.getElementById('planModal').classList.add('hidden'); }

function selectBilling(b) {
    currentBilling = b;
    ['monthly', 'quarterly', 'yearly', 'one-time'].forEach(x => {
        const btn = document.getElementById('bc-' + x);
        if (!btn) return;
        if (x === b) {
            btn.classList.add('bg-indigo-50', 'border-indigo-500', 'text-indigo-600');
            btn.classList.remove('border-gray-200', 'text-gray-600');
        } else {
            btn.classList.remove('bg-indigo-50', 'border-indigo-500', 'text-indigo-600');
            btn.classList.add('border-gray-200', 'text-gray-600');
        }
    });
}

function previewPlanImg(input) {
    if (input.files && input.files[0]) {
        const r = new FileReader();
        r.onload = e => {
            document.getElementById('planImgThumb').src = e.target.result;
            document.getElementById('planImgPreview').classList.remove('hidden');
            document.getElementById('planImgZone').classList.add('hidden');
        };
        r.readAsDataURL(input.files[0]);
    }
}
function clearPlanImg() {
    const inp = document.getElementById('planImgInput');
    if (inp) inp.value = '';
    document.getElementById('planImgPreview').classList.add('hidden');
    document.getElementById('planImgZone').classList.remove('hidden');
}

function savePlan() {
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
    api(isEdit ? `${API.plans}/${editPlanId}` : API.plans, isEdit ? 'PUT' : 'POST', payload)
        .then(() => { showToast(isEdit ? 'Plan updated!' : 'Plan created!', 'success'); closePlanModal(); loadPlans(); })
        .catch(err => showToast('Error: ' + err.message, 'error'));
}

function togglePlanStatus(id) {
    api(`${API.plans}/${id}/toggle-status`, 'PATCH')
        .then(() => { showToast('Plan status updated', 'success'); loadPlans(); })
        .catch(err => showToast('Error: ' + err.message, 'error'));
}
function deletePlan(id) {
    if (!confirm('Delete this plan?')) return;
    api(`${API.plans}/${id}`, 'DELETE')
        .then(() => { showToast('Plan deleted', 'success'); loadPlans(); })
        .catch(err => showToast('Error: ' + err.message, 'error'));
}

// ─────────────────────────────────────────────────────────────────────────────
// ╔══════════════════════════════════════════════════════════╗
// ║                       PRODUCTS                          ║
// ╚══════════════════════════════════════════════════════════╝
// ─────────────────────────────────────────────────────────────────────────────
function loadProducts() {
    api(API.products)
        .then(data => { products = data; renderProducts(); })
        .catch(err => showToast('Failed to load products: ' + err.message, 'error'));
}

function renderProducts() {
    const q = (document.getElementById('prodSearch')?.value || '').toLowerCase();
    const filtered = products.filter(p =>
        (prodFilter === 'all' || p.status === prodFilter) &&
        ((p.name || '').toLowerCase().includes(q) ||
            (p.sku || '').toLowerCase().includes(q) ||
            (p.category || '').toLowerCase().includes(q))
    );

    const countEl = document.getElementById('prodTabCount');
    const badgeEl = document.getElementById('productCountBadge');
    if (countEl) countEl.textContent = products.length;
    if (badgeEl) badgeEl.textContent = products.filter(p => p.status === 'active').length;

    const grid = document.getElementById('productsGrid');
    const empty = document.getElementById('productsEmpty');

    if (!filtered.length) { grid.innerHTML = ''; empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden');

    const catColors = {
        Investments: 'bg-blue-50 text-blue-700',
        Insurance: 'bg-emerald-50 text-emerald-700',
        'Fixed Income': 'bg-violet-50 text-violet-700',
        Loans: 'bg-orange-50 text-orange-700',
        'Gold & Jewellery': 'bg-yellow-50 text-yellow-700',
        General: 'bg-gray-100 text-gray-600'
    };

    grid.innerHTML = filtered.map(p => {
        const catCls = catColors[p.category] || 'bg-gray-100 text-gray-600';
        return `
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition relative group">
      ${p.img ? `<img src="${p.img}" class="w-full h-24 object-cover rounded-xl mb-4 border border-gray-100">` : ''}
      <div class="flex justify-end gap-1.5 absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
        <button onclick="openProductModal(${p.id})" title="Edit"
          class="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
        </button>
        <button onclick="toggleProductStatus(${p.id})" title="${p.status === 'active' ? 'Set Inactive' : 'Set Active'}"
          class="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center ${p.status === 'active' ? 'text-emerald-500 hover:text-orange-500 hover:border-orange-200 hover:bg-orange-50' : 'text-gray-400 hover:text-emerald-500 hover:border-emerald-200 hover:bg-emerald-50'}">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${p.status === 'active' ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'}"/></svg>
        </button>
        <button onclick="deleteProduct(${p.id})" title="Delete"
          class="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>
      <div class="mb-3">
        <div class="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center mb-2.5">
          <svg class="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
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
        <span class="text-[10px] text-gray-300">Created ${p.createdAt ? p.createdAt.split('T')[0] : ''}</span>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}">${p.status === 'active' ? 'Active' : 'Inactive'}</span>
      </div>
    </div>`;
    }).join('');
}

// ── Product Modal ─────────────────────────────────────────────────────────────
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
        document.getElementById('productModalTitle').textContent = 'Edit Product';
        document.getElementById('prodSaveLabel').textContent = 'Save Changes';
    } else {
        ['prd_name', 'prd_sku', 'prd_price', 'prd_desc'].forEach(i => document.getElementById(i).value = '');
        document.getElementById('prd_currency').value = 'INR';
        document.getElementById('prd_category').value = 'Investments';
        document.getElementById('productModalTitle').textContent = 'New Product';
        document.getElementById('prodSaveLabel').textContent = 'Create Product';
    }
    document.getElementById('productModal').classList.remove('hidden');
}
function closeProductModal() { document.getElementById('productModal').classList.add('hidden'); }

function previewProdImg(input) {
    if (input.files && input.files[0]) {
        const r = new FileReader();
        r.onload = e => {
            document.getElementById('prodImgThumb').src = e.target.result;
            document.getElementById('prodImgPreview').classList.remove('hidden');
            document.getElementById('prodImgZone').classList.add('hidden');
        };
        r.readAsDataURL(input.files[0]);
    }
}
function clearProdImg() {
    const inp = document.getElementById('prodImgInput');
    if (inp) inp.value = '';
    document.getElementById('prodImgPreview')?.classList.add('hidden');
    document.getElementById('prodImgZone')?.classList.remove('hidden');
}

function saveProduct() {
    const name = document.getElementById('prd_name').value.trim();
    const sku = document.getElementById('prd_sku').value.trim();
    if (!name || !sku) { showToast('Product name and SKU are required', 'error'); return; }

    const imgPreview = document.getElementById('prodImgPreview');
    const imgThumb = document.getElementById('prodImgThumb');
    const img = (imgPreview && !imgPreview.classList.contains('hidden')) ? imgThumb.src : null;

    const payload = {
        name, sku,
        category: document.getElementById('prd_category').value,
        currency: document.getElementById('prd_currency').value,
        price: parseFloat(document.getElementById('prd_price').value) || 0,
        description: document.getElementById('prd_desc').value.trim(),
        img,
        status: 'active'
    };

    const isEdit = editProductId !== null;
    api(isEdit ? `${API.products}/${editProductId}` : API.products, isEdit ? 'PUT' : 'POST', payload)
        .then(() => { showToast(isEdit ? 'Product updated!' : 'Product created!', 'success'); closeProductModal(); loadProducts(); })
        .catch(err => showToast('Error: ' + err.message, 'error'));
}

function toggleProductStatus(id) {
    api(`${API.products}/${id}/toggle-status`, 'PATCH')
        .then(() => { showToast('Product status updated', 'success'); loadProducts(); })
        .catch(err => showToast('Error: ' + err.message, 'error'));
}
function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    api(`${API.products}/${id}`, 'DELETE')
        .then(() => { showToast('Product deleted', 'success'); loadProducts(); })
        .catch(err => showToast('Error: ' + err.message, 'error'));
}

// ─────────────────────────────────────────────────────────────────────────────
// ╔══════════════════════════════════════════════════════════╗
// ║                   MSG TEMPLATES                         ║
// ╚══════════════════════════════════════════════════════════╝
// ─────────────────────────────────────────────────────────────────────────────
function loadTemplates() {
    api(API.templates)
        .then(data => { templates = data; renderTemplates(); })
        .catch(err => showToast('Failed to load templates: ' + err.message, 'error'));
}

function renderTemplates() {
    const q = (document.getElementById('tmplSearch')?.value || '').toLowerCase();
    const filtered = templates.filter(t =>
        (tmplFilter === 'all' || t.status === tmplFilter) &&
        ((t.title || '').toLowerCase().includes(q) ||
            (t.category || '').toLowerCase().includes(q))
    );

    const countEl = document.getElementById('tmplTabCount');
    const badgeEl = document.getElementById('tmplCountBadge');
    if (countEl) countEl.textContent = templates.length;
    if (badgeEl) badgeEl.textContent = templates.filter(t => t.status === 'active').length;

    const grid = document.getElementById('templatesGrid');
    const empty = document.getElementById('templatesEmpty');

    if (!filtered.length) { grid.innerHTML = ''; if (empty) empty.classList.remove('hidden'); return; }
    if (empty) empty.classList.add('hidden');

    const catColors = {
        'Payment Reminder': 'bg-blue-50 text-blue-700',
        'Festival Greeting': 'bg-orange-50 text-orange-700',
        'Promotion Announcement': 'bg-violet-50 text-violet-700',
        'Birthday Wish': 'bg-pink-50 text-pink-700',
        'Policy Renewal': 'bg-red-50 text-red-700',
        'Anniversary': 'bg-rose-50 text-rose-700',
        'General': 'bg-gray-100 text-gray-600'
    };

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
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition group relative">
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <div>
            <p class="text-sm font-bold text-gray-900">${t.title}</p>
            <span class="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${catCls}">${t.category}</span>
          </div>
        </div>
        <div class="flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
          <button onclick="openTemplateModal(${t.id})" title="Edit"
            class="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
          </button>
          <button onclick="toggleTemplateStatus(${t.id})" title="${t.status === 'active' ? 'Set Inactive' : 'Set Active'}"
            class="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center ${t.status === 'active' ? 'text-emerald-500 hover:text-orange-500 hover:border-orange-200 hover:bg-orange-50' : 'text-gray-400 hover:text-emerald-500 hover:border-emerald-200 hover:bg-emerald-50'}">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${t.status === 'active' ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'}"/></svg>
          </button>
          <button onclick="deleteTemplate(${t.id})" title="Delete"
            class="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </div>
      ${t.description ? `<p class="text-xs text-gray-500 mb-3 line-clamp-2">${t.description}</p>` : ''}
      <div class="bg-gray-50 rounded-xl p-3 mb-3">
        <p class="text-xs text-gray-600 font-mono leading-relaxed line-clamp-3">${escaped.replace(/\n/g, '<br>')}</p>
      </div>
      <div class="flex items-center justify-between">
        <div class="flex gap-1">${channels.map(c => `<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-600">${c}</span>`).join('')}</div>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${t.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}">${t.status === 'active' ? 'Active' : 'Inactive'}</span>
      </div>
    </div>`;
    }).join('');
}

// ── Template Modal ────────────────────────────────────────────────────────────
function openTemplateModal(id) {
    editTemplateId = id || null;
    if (editTemplateId) {
        const t = templates.find(x => x.id === editTemplateId);
        if (!t) return;
        document.getElementById('tm_title').value = t.title || '';
        document.getElementById('tm_category').value = t.category || 'General';
        document.getElementById('tm_desc').value = t.description || '';
        document.getElementById('tm_content').value = t.content || '';
        const ch = Array.isArray(t.channelList) ? t.channelList
            : (t.channels || '').split(',').map(s => s.trim()).filter(Boolean);
        document.getElementById('tm_wa').checked = ch.includes('WhatsApp');
        document.getElementById('tm_sms').checked = ch.includes('SMS');
        document.getElementById('tm_email').checked = ch.includes('Email');
        document.getElementById('templateModalTitle').textContent = 'Edit AI Template';
        document.getElementById('tmplSaveLabel').textContent = 'Save Changes';
    } else {
        ['tm_title', 'tm_desc', 'tm_content'].forEach(i => document.getElementById(i).value = '');
        document.getElementById('tm_category').value = 'Payment Reminder';
        document.getElementById('tm_wa').checked = true;
        document.getElementById('tm_sms').checked = false;
        document.getElementById('tm_email').checked = false;
        document.getElementById('templateModalTitle').textContent = 'New AI Template';
        document.getElementById('tmplSaveLabel').textContent = 'Save AI Template';
    }
    document.getElementById('templateModal').classList.remove('hidden');
}
function closeTemplateModal() { document.getElementById('templateModal').classList.add('hidden'); }

function generateTemplateContent() {
    const cat = document.getElementById('tm_category').value;
    const desc = document.getElementById('tm_desc').value;
    const map = {
        'Payment Reminder': `Hi {customer_name}! 👋\n\nThis is a friendly reminder that your {plan_name} payment of {amount} is due on {due_date}.\n\nPlease pay to avoid disruption.\nQueries: {business_phone}\n\n— {business_name}`,
        'Festival Greeting': `🎉 {festival} Greetings, {customer_name}!\n\nWishing you joy and prosperity.\n\nSpecial offer: {offer_details}\nValid till: {offer_expiry}\n\n— {business_name}`,
        'Promotion Announcement': `🎊 Special Offer for {customer_name}!\n\n{offer_title}\n{offer_description}\n\nView: {promo_link}\n⏰ Valid till {offer_expiry}\n\n— {business_name}`,
        'Birthday Wish': `🎂 Happy Birthday, {customer_name}!\n\nAs a birthday treat:\n🎁 {offer_details}\n\nWith warm wishes,\n{business_name}`,
        'Policy Renewal': `⚠️ Renewal Reminder, {customer_name}\n\nYour {plan_name} is due on {due_date}.\n\nRenew now: {renewal_link}\nHelp: {business_phone}\n\n— {business_name}`,
        'Anniversary': `🎊 Happy Anniversary, {customer_name}!\n\nThank you for being with us.\n🎁 {offer_details}\n\n— {business_name}`,
        'General': `Hi {customer_name},\n\n${desc || 'We have an important update for you.'}\n\nContact us at {business_phone}\n\n— {business_name}`
    };
    document.getElementById('tm_content').value = map[cat] || map['General'];
}

function saveTemplate() {
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
        channels: channels.join(','),   // backend stores as comma-delimited string
        status: 'active'
    };

    const isEdit = editTemplateId !== null;
    api(isEdit ? `${API.templates}/${editTemplateId}` : API.templates, isEdit ? 'PUT' : 'POST', payload)
        .then(() => { showToast(isEdit ? 'Template updated!' : 'Template saved!', 'success'); closeTemplateModal(); loadTemplates(); })
        .catch(err => showToast('Error: ' + err.message, 'error'));
}

function toggleTemplateStatus(id) {
    api(`${API.templates}/${id}/toggle-status`, 'PATCH')
        .then(() => { showToast('Template status updated', 'success'); loadTemplates(); })
        .catch(err => showToast('Error: ' + err.message, 'error'));
}
function deleteTemplate(id) {
    if (!confirm('Delete this template?')) return;
    api(`${API.templates}/${id}`, 'DELETE')
        .then(() => { showToast('Template deleted', 'success'); loadTemplates(); })
        .catch(err => showToast('Error: ' + err.message, 'error'));
}

// ─────────────────────────────────────────────────────────────────────────────
// ╔══════════════════════════════════════════════════════════╗
// ║                  REPORT TEMPLATES                       ║
// ╚══════════════════════════════════════════════════════════╝
// ─────────────────────────────────────────────────────────────────────────────

// Data state - This is now your source of truth
let reportRowsData = [{ test: "", range: "" }];

// ── Modified Preset Function ──────────────────────────────────────────────

function openRTWithPreset(type) {
    if (type === 'lab') {
        document.getElementById('rt_title').value = "Complete Blood Count";
        document.getElementById('rt_category').value = "Blood Test";
        reportRowsData = [
            { test: "Haemoglobin", range: "12-17 g/dL" },
            { test: "WBC Count", range: "4000-11000 /µL" },
            { test: "Platelet Count", range: "150000-400000 /µL" }
        ];
    } else {
        reportRowsData = [{ test: "", range: "" }];
    }
    renderRows();
    document.getElementById('rtModal').classList.remove('hidden');
}

// ── Modified Save Function ────────────────────────────────────────────────
function saveRTTemplate() {
    const title = document.getElementById('rt_title').value.trim();
    if (!title) { showToast('Title required', 'error'); return; }

    // Filter out empty rows and convert to JSON string
    const filteredRows = reportRowsData.filter(r => r.test.trim() !== '');
    const columnsJson = JSON.stringify(filteredRows);

    const payload = {
        title: title,
        accountId: 1, // Change this to your dynamic account ID logic
        category: document.getElementById('rt_category').value,
        description: document.getElementById('rt_desc').value.trim(),
        columns: columnsJson, // Storing structured JSON in the TEXT field
        price: parseFloat(document.getElementById('rt_price').value) || 0,
        showTotal: document.getElementById('rt_total').checked,
        status: 'active'
    };

    const isEdit = editRTId !== null;
    api(isEdit ? `${API.rtemplates}/${editRTId}` : API.rtemplates, isEdit ? 'PUT' : 'POST', payload)
        .then(() => {
            showToast('Template Saved!', 'success');
            closeRTModal();
            loadRTemplates();
        })
        .catch(err => showToast(err.message, 'error'));
}

// ── Updated Modal Opener (for Editing) ────────────────────────────────────
// Use this logic inside your existing edit function to convert string back to rows
function openRTModal(id = null) {
    editRTId = id;
    if (!id) {
        reportRowsData = [{ test: "", range: "" }];
        // clear other fields...
    } else {
        const t = rtemplates.find(x => x.id === id);
        if (t) {
            // ... fill other fields ...
            try {
                // Parse the JSON string from the database
                reportRowsData = JSON.parse(t.columns || "[]");
                if (reportRowsData.length === 0) reportRowsData = [{ test: "", range: "" }];
            } catch (e) {
                // Fallback for old comma-separated data
                reportRowsData = (t.columns || "").split(',').map(c => ({ test: c, range: '' }));
            }
        }
    }
    renderRows();
    document.getElementById('rtModal').classList.remove('hidden');
}

function closeRTModal() {
    // 1. Hide the modal
    const modal = document.getElementById('rtModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    editRTId = null;
    reportRowsData = [{ test: "" }];

    // 4. Clear any specific validation styles or inputs if necessary
    document.getElementById('rt_title').value = '';
    document.getElementById('rt_price').value = '';
}
// ── Row Management Logic (Keep exactly as is) ─────────────────────────────

function renderRows() {
    const container = document.getElementById('reportRows');
    if (!container) return;
    container.innerHTML = '';

    if (reportRowsData.length === 0) {
        container.innerHTML = `<tr><td colspan="3" class="px-4 py-8 text-center text-gray-400 italic">No fields added.</td></tr>`;
        return;
    }

    reportRowsData.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.className = "fade-in hover:bg-gray-50/50 transition-colors";
        tr.innerHTML = `
      <td class="px-4 py-3">
        <input type="text" value="${row.test}" 
               oninput="updateRow(${index}, 'test', this.value)"
               placeholder="e.g. Haemoglobin"
               class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 bg-transparent">
      </td>
      <td class="px-4 py-3">
        <input type="text" value="${row.range}" 
               oninput="updateRow(${index}, 'range', this.value)"
               placeholder="e.g. 12-17 g/dL"
               class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 bg-transparent">
      </td>
      <td class="px-4 py-3 text-right">
        <button onclick="deleteRow(${index})" class="p-2 text-gray-400 hover:text-red-500">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </td>
    `;
        container.appendChild(tr);
    });
}

function updateRow(index, field, value) {
    reportRowsData[index][field] = value;
}

function addRow() {
    reportRowsData.push({ test: "", range: "" });
    renderRows();
}

function deleteRow(index) {
    reportRowsData.splice(index, 1);
    renderRows();
}

function loadRTemplates() {
    api(API.rtemplates)
        .then(data => {
            rtemplates = data;
            renderRTemplates();
        })
        .catch(err => showToast('Failed to load report templates: ' + err.message, 'error'));
}

function renderRTemplates() {
    const grid = document.getElementById('rtGrid');
    const empty = document.getElementById('rtEmpty');
    const badge = document.getElementById('rtBadge');

    if (badge) badge.textContent = rtemplates.length;

    if (!rtemplates.length) {
        grid.innerHTML = '';
        if (empty) empty.classList.remove('hidden');
        return;
    }
    if (empty) empty.classList.add('hidden');

    const catColors = {
        'Blood Test': 'bg-red-50 text-red-700',
        'Radiology': 'bg-violet-50 text-violet-700',
        'Cardiology': 'bg-pink-50 text-pink-700',
        'Prescription': 'bg-emerald-50 text-emerald-700',
        'General Checkup': 'bg-blue-50 text-blue-700'
    };

    grid.innerHTML = rtemplates.map(t => {
        let cols = [];
        try {
            // Detect if it's our new JSON format or the old comma-style
            if (t.columns && t.columns.startsWith('[')) {
                cols = JSON.parse(t.columns);
            } else {
                cols = (t.columns || "").split(',').map(c => ({ test: c.trim(), range: '' }));
            }
        } catch (e) {
            cols = (t.columns || "").split(',').map(c => ({ test: c.trim(), range: '' }));
        }

        const catCls = catColors[t.category] || 'bg-gray-100 text-gray-600';
        const isActive = t.status === 'active';

        return `
    <div class="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition fade-in">
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 text-xl">📋</div>
          <div>
            <p class="text-sm font-bold text-gray-900 leading-snug">${t.title}</p>
            <span class="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${catCls}">${t.category || 'Custom'}</span>
          </div>
        </div>
        
        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
          <button onclick="openRTModal(${t.id})" title="Edit"
            class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 flex items-center justify-center text-gray-500 transition">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
          </button>
          <button onclick="deleteRT(${t.id})" title="Delete"
            class="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 transition">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </div>

      <div class="flex flex-wrap gap-1.5 mb-3">
        ${cols.map(c => `
          <span class="text-[10px] px-2 py-1 rounded-lg bg-gray-100 text-gray-600 font-medium border border-gray-200/50">
            ${c.test} ${c.range ? `<span class="text-indigo-500 ml-1 opacity-70">[${c.range}]</span>` : ''}
          </span>
        `).join('')}
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-gray-50">
        <div class="flex items-center gap-2">
          <span class="text-[10px] text-gray-400">${cols.length} fields</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}">${isActive ? 'Active' : 'Inactive'}</span>
        </div>
        <p class="text-sm font-bold text-emerald-600">
          ${t.price > 0 ? '₹' + Number(t.price).toLocaleString('en-IN') : 'Free'}
        </p>
      </div>
    </div>`;
    }).join('');
}

function deleteRT(id) {
    // 1. Ask for confirmation to prevent accidental clicks
    if (!confirm('Are you sure you want to delete this report template? This action cannot be undone.')) {
        return;
    }

    // 2. Call the backend API
    // Assumes API.rtemplates is your endpoint (e.g., '/api/catalog/report-templates')
    api(`${API.rtemplates}/${id}`, 'DELETE')
        .then(() => {
            // 3. Show success notification
            showToast('Template deleted successfully', 'success');

            // 4. Refresh the local list and UI
            loadRTemplates();
        })
        .catch(err => {
            // 5. Handle errors (e.g., template in use, network issues)
            console.error('Delete error:', err);
            showToast('Failed to delete template: ' + err.message, 'error');
        });
}












// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY (header badges from server)
// ─────────────────────────────────────────────────────────────────────────────
function loadSummary() {
    api(API.summary)
        .then(data => {
            const planBadge = document.getElementById('planCountBadge');
            const prodBadge = document.getElementById('productCountBadge');
            if (planBadge) planBadge.textContent = data.activePlans || 0;
            if (prodBadge) prodBadge.textContent = data.activeProducts || 0;
        })
        .catch(() => { /* non-critical — individual loaders update their own badges */ });
}

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // init tab indicator on Plans tab
    const firstTab = document.getElementById('ct-plans');
    if (firstTab) moveIndicator(firstTab);

    // load all data from Spring Boot
    loadPlans();
    loadProducts();
    loadTemplates();
    loadRTemplates();
    loadSummary();
});