/* ============================================
   MistryStudio — Products Module
   ============================================ */

const Products = {
  editingId: null,

  init() {
    this.bindEvents();
    this.render();
    this.renderCategoryFilter();
  },

  bindEvents() {
    document.getElementById('addProductBtn')?.addEventListener('click', () => this.openModal());
    document.getElementById('productForm')?.addEventListener('submit', (e) => this.handleSubmit(e));
    document.getElementById('productModalClose')?.addEventListener('click', () => this.closeModal());
    document.getElementById('productModalCancel')?.addEventListener('click', () => this.closeModal());
    document.getElementById('productSearch')?.addEventListener('input', (e) => this.render(e.target.value));
    document.getElementById('categoryFilter')?.addEventListener('change', () => this.render());
    document.getElementById('manageCategoriesBtn')?.addEventListener('click', () => this.openCategoryModal());
    document.getElementById('categoryModalClose')?.addEventListener('click', () => this.closeCategoryModal());
    document.getElementById('addCategoryBtn')?.addEventListener('click', () => this.addCategory());
    document.getElementById('newCategoryInput')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.addCategory();
    });

    // Toggle pcsPerUnit field based on unit selection
    document.getElementById('prodUnit')?.addEventListener('change', () => this.togglePcsPerUnit());
  },

  togglePcsPerUnit() {
    const unit = document.getElementById('prodUnit').value;
    const group = document.getElementById('pcsPerUnitGroup');
    const hint = document.getElementById('pcsPerUnitHint');
    const needsPcs = ['box', 'pack', 'set', 'dz'].includes(unit);
    if (group) group.style.display = needsPcs ? 'block' : 'none';
    if (hint && needsPcs) {
      const unitName = Lang.t(unit === 'dz' ? 'dozen' : unit);
      hint.textContent = `${Lang.t('pcsPerUnitHint')} ${unitName}`;
    }
  },

  openModal(product = null) {
    const overlay = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    const form = document.getElementById('productForm');

    if (product) {
      this.editingId = product.id;
      title.textContent = Lang.t('editProduct');
      document.getElementById('prodName').value = product.name || '';
      document.getElementById('prodCategory').value = product.category || '';
      document.getElementById('prodCostPrice').value = product.costPrice || '';
      document.getElementById('prodSellPrice').value = product.sellPrice || '';
      document.getElementById('prodUnit').value = product.unit || 'pcs';
      document.getElementById('prodPcsPerUnit').value = product.pcsPerUnit || 1;
      // Show stock in units (boxes/packs) for display, internally stored as pieces
      const ppu = product.pcsPerUnit || 1;
      const unit = product.unit || 'pcs';
      const isBulk = ['box', 'pack', 'set', 'dz'].includes(unit) && ppu > 1;
      document.getElementById('prodStock').value = isBulk ? Math.round((product.stock || 0) / ppu) : (product.stock || 0);
      document.getElementById('prodMinStock').value = product.minStock || 5;
      document.getElementById('prodNotes').value = product.notes || '';
    } else {
      this.editingId = null;
      title.textContent = Lang.t('addNewProduct');
      form.reset();
      document.getElementById('prodMinStock').value = 5;
      document.getElementById('prodPcsPerUnit').value = 1;
    }

    this.populateCategoryDropdown();
    this.togglePcsPerUnit();
    overlay.classList.add('active');
  },

  closeModal() {
    document.getElementById('productModal').classList.remove('active');
    this.editingId = null;
  },

  populateCategoryDropdown() {
    const sel = document.getElementById('prodCategory');
    const categories = Storage.getCategories();
    const currentVal = sel.value;
    sel.innerHTML = `<option value="">${Lang.t('selectCategory')}</option>`;
    categories.forEach(c => {
      sel.innerHTML += `<option value="${c}">${c}</option>`;
    });
    if (currentVal) sel.value = currentVal;
  },

  handleSubmit(e) {
    e.preventDefault();
    const data = {
      name: document.getElementById('prodName').value.trim(),
      category: document.getElementById('prodCategory').value,
      costPrice: parseFloat(document.getElementById('prodCostPrice').value) || 0,
      sellPrice: parseFloat(document.getElementById('prodSellPrice').value) || 0,
      stock: parseInt(document.getElementById('prodStock').value) || 0,
      minStock: parseInt(document.getElementById('prodMinStock').value) || 5,
      unit: document.getElementById('prodUnit').value || 'pcs',
      pcsPerUnit: parseInt(document.getElementById('prodPcsPerUnit').value) || 1,
      notes: document.getElementById('prodNotes').value.trim()
    };

    // Convert stock from units to total pieces for bulk units
    const isBulk = ['box', 'pack', 'set', 'dz'].includes(data.unit) && data.pcsPerUnit > 1;
    if (isBulk) {
      data.stock = data.stock * data.pcsPerUnit;
    }

    if (!data.name) {
      App.toast(Lang.t('enterProductName'), 'error');
      return;
    }

    if (this.editingId) {
      Storage.updateProduct(this.editingId, data);
      App.toast(Lang.t('productUpdated'), 'success');
    } else {
      Storage.addProduct(data);
      App.toast(Lang.t('productAdded'), 'success');
    }

    this.closeModal();
    this.render();
    Inventory.render();
    Dashboard.refresh();
  },

  deleteProduct(id) {
    App.confirm(Lang.t('deleteProductConfirm'), () => {
      Storage.deleteProduct(id);
      App.toast(Lang.t('productDeleted'), 'success');
      this.render();
      Inventory.render();
      Dashboard.refresh();
    });
  },

  render(searchTerm = null) {
    const search = searchTerm ?? (document.getElementById('productSearch')?.value || '');
    const catFilter = document.getElementById('categoryFilter')?.value || '';
    let products = Storage.getProducts();

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    if (catFilter) {
      products = products.filter(p => p.category === catFilter);
    }

    const tbody = document.getElementById('productsTableBody');
    const empty = document.getElementById('productsEmpty');
    const count = document.getElementById('productCount');

    if (count) count.textContent = `${products.length} ${Lang.t('products')}`;

    if (!products.length) {
      tbody.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }

    empty.classList.add('hidden');

    tbody.innerHTML = products.map((p, i) => {
      const margin = p.sellPrice && p.costPrice ? ((p.sellPrice - p.costPrice) / p.costPrice * 100).toFixed(1) : 0;
      const stockClass = p.stock <= 0 ? 'badge-red' : p.stock <= (p.minStock || 5) ? 'badge-amber' : 'badge-green';
      const stockLabel = p.stock <= 0 ? Lang.t('outOfStock') : p.stock <= (p.minStock || 5) ? Lang.t('lowStock') : Lang.t('inStock');

      return `<tr style="animation: fadeIn ${0.15 + i * 0.03}s ease forwards">
        <td><span class="font-semibold">${this.escapeHtml(p.name)}</span></td>
        <td><span class="category-tag">${this.escapeHtml(p.category || '-')}</span></td>
        <td>₹${p.costPrice?.toFixed(2) || '0.00'}</td>
        <td>₹${p.sellPrice?.toFixed(2) || '0.00'}</td>
        <td><span class="text-${margin > 0 ? 'green' : 'red'}">${margin}%</span></td>
        <td>${this.formatStockDisplay(p)}</td>
        <td><span class="badge ${stockClass}">${stockLabel}</span></td>
        <td>
          <div class="table-actions">
            <button class="btn btn-ghost btn-icon" onclick="Products.openModal(Storage.getProducts().find(x=>x.id==='${p.id}'))" title="Edit">✏️</button>
            <button class="btn btn-ghost btn-icon" onclick="Products.deleteProduct('${p.id}')" title="Delete">🗑️</button>
          </div>
        </td>
      </tr>`;
    }).join('');
  },

  renderCategoryFilter() {
    const sel = document.getElementById('categoryFilter');
    if (!sel) return;
    const categories = Storage.getCategories();
    sel.innerHTML = `<option value="">${Lang.t('allCategories')}</option>`;
    categories.forEach(c => {
      sel.innerHTML += `<option value="${c}">${c}</option>`;
    });
  },

  /* ---------- Category Management ---------- */
  openCategoryModal() {
    document.getElementById('categoryModal').classList.add('active');
    this.renderCategoryList();
  },

  closeCategoryModal() {
    document.getElementById('categoryModal').classList.remove('active');
  },

  addCategory() {
    const input = document.getElementById('newCategoryInput');
    const name = input.value.trim();
    if (!name) return;

    const cats = Storage.getCategories();
    if (cats.includes(name)) {
      App.toast(Lang.t('categoryExists'), 'warning');
      return;
    }

    Storage.addCategory(name);
    input.value = '';
    this.renderCategoryList();
    this.renderCategoryFilter();
    this.populateCategoryDropdown();
    App.toast(Lang.t('categoryAdded'), 'success');
  },

  removeCategoryItem(name) {
    Storage.deleteCategory(name);
    this.renderCategoryList();
    this.renderCategoryFilter();
    this.populateCategoryDropdown();
    App.toast(Lang.t('categoryRemoved'), 'success');
  },

  renderCategoryList() {
    const list = document.getElementById('categoryList');
    const cats = Storage.getCategories();
    list.innerHTML = cats.map(c => `
      <div class="low-stock-item">
        <span class="item-name">${this.escapeHtml(c)}</span>
        <button class="btn btn-ghost btn-sm" onclick="Products.removeCategoryItem('${this.escapeHtml(c)}')" title="Remove">✕</button>
      </div>
    `).join('');
  },

  formatStockDisplay(product) {
    const stock = product.stock || 0;
    const unit = product.unit || 'pcs';
    const ppu = product.pcsPerUnit || 1;

    // If unit is pcs or pcsPerUnit is 1 or not applicable, show simple
    if (unit === 'pcs' || unit === 'kg' || ppu <= 1) {
      return `${stock} ${unit}`;
    }

    // Calculate boxes + remaining pieces
    const totalPieces = stock; // stock is stored as total pieces
    const fullUnits = Math.floor(totalPieces / ppu);
    const remaining = totalPieces % ppu;

    const unitNames = {
      box: Lang.t('stockDisplayBoxes'),
      pack: Lang.t('stockDisplayPacks'),
      set: Lang.t('stockDisplaySets'),
      dz: Lang.t('stockDisplayDozens')
    };

    const unitLabel = unitNames[unit] || unit;

    if (remaining === 0) {
      return `${fullUnits} ${unitLabel} (${totalPieces} pcs)`;
    } else if (fullUnits === 0) {
      return `${remaining} pcs`;
    } else {
      return `${fullUnits} ${unitLabel} + ${remaining} pcs`;
    }
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
