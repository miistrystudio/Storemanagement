/* ============================================
   MistryStudio — Inventory Module
   ============================================ */

const Inventory = {
  init() {
    this.bindEvents();
    this.render();
  },

  bindEvents() {
    document.getElementById('inventorySearch')?.addEventListener('input', () => this.render());
    document.getElementById('stockFilter')?.addEventListener('change', () => this.render());
  },

  render() {
    const search = (document.getElementById('inventorySearch')?.value || '').toLowerCase();
    const filter = document.getElementById('stockFilter')?.value || '';
    let products = Storage.getProducts();

    if (search) {
      products = products.filter(p => p.name.toLowerCase().includes(search) ||
        (p.category && p.category.toLowerCase().includes(search)));
    }

    if (filter === 'low') {
      products = products.filter(p => p.stock > 0 && p.stock <= (p.minStock || 5));
    } else if (filter === 'out') {
      products = products.filter(p => p.stock <= 0);
    } else if (filter === 'ok') {
      products = products.filter(p => p.stock > (p.minStock || 5));
    }

    const tbody = document.getElementById('inventoryTableBody');
    const empty = document.getElementById('inventoryEmpty');
    const lowCount = document.getElementById('lowStockCount');

    const allProducts = Storage.getProducts();
    const lowStockProducts = allProducts.filter(p => p.stock > 0 && p.stock <= (p.minStock || 5));
    const outOfStock = allProducts.filter(p => p.stock <= 0);
    const alertCount = lowStockProducts.length + outOfStock.length;

    if (lowCount) lowCount.textContent = `${alertCount} ${Lang.t('alerts')}`;

    // Update nav badge
    const navBadge = document.getElementById('inventoryNavBadge');
    if (navBadge) {
      navBadge.textContent = alertCount;
      navBadge.style.display = alertCount > 0 ? 'inline' : 'none';
    }

    if (!products.length) {
      tbody.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }

    empty.classList.add('hidden');

    tbody.innerHTML = products.map((p, i) => {
      const stockPercent = p.minStock ? Math.min(100, (p.stock / (p.minStock * 3)) * 100) : 100;
      const stockClass = p.stock <= 0 ? 'badge-red' : p.stock <= (p.minStock || 5) ? 'badge-amber' : 'badge-green';
      const stockLabel = p.stock <= 0 ? Lang.t('outOfStock') : p.stock <= (p.minStock || 5) ? Lang.t('lowStock') : Lang.t('inStock');
      const barColor = p.stock <= 0 ? 'var(--accent-red)' : p.stock <= (p.minStock || 5) ? 'var(--accent-amber)' : 'var(--accent-green)';

      const ppu = p.pcsPerUnit || 1;
      const isBulk = ['box', 'pack', 'set', 'dz'].includes(p.unit) && ppu > 1;
      const unitDisplay = isBulk ? `${p.unit} (${ppu} pcs)` : (p.unit || 'pcs');

      return `<tr style="animation: fadeIn ${0.15 + i * 0.03}s ease forwards">
        <td><span class="font-semibold">${Products.escapeHtml(p.name)}</span></td>
        <td><span class="category-tag">${Products.escapeHtml(p.category || '-')}</span></td>
        <td>
          <div class="stock-control">
            <button class="stock-btn" onclick="Inventory.adjustStock('${p.id}', -1)">−</button>
            <span class="stock-value">${Products.formatStockDisplay(p)}</span>
            <button class="stock-btn" onclick="Inventory.adjustStock('${p.id}', 1)">+</button>
          </div>
        </td>
        <td>${unitDisplay}</td>
        <td>${p.minStock || 5}</td>
        <td>
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="flex:1;height:6px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden;min-width:60px;">
              <div style="height:100%;width:${stockPercent}%;background:${barColor};border-radius:3px;transition:width 0.3s ease;"></div>
            </div>
            <span class="badge ${stockClass}">${stockLabel}</span>
          </div>
        </td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="Inventory.openRestockModal('${p.id}')">${Lang.t('restock')}</button>
        </td>
      </tr>`;
    }).join('');
  },

  adjustStock(productId, change) {
    const product = Storage.getProducts().find(p => p.id === productId);
    if (!product) return;

    // ± buttons adjust by 1 piece always
    const newStock = Math.max(0, (product.stock || 0) + change);
    Storage.updateProduct(productId, { stock: newStock });
    Storage.logStockChange(productId, product.name, change, change > 0 ? 'Manual add' : 'Manual remove');

    this.render();
    Products.render();
    Dashboard.refresh();
  },

  openRestockModal(productId) {
    const product = Storage.getProducts().find(p => p.id === productId);
    if (!product) return;

    const ppu = product.pcsPerUnit || 1;
    const unit = product.unit || 'pcs';
    const isBulk = ['box', 'pack', 'set', 'dz'].includes(unit) && ppu > 1;

    const currentDisplay = Products.formatStockDisplay(product);
    const promptUnit = isBulk ? unit : 'pcs';

    const qty = prompt(`${Lang.t('restock')} "${product.name}"\n${Lang.t('stock')}: ${currentDisplay}\n\n${Lang.t('restockPrompt')} (${promptUnit})`);
    if (qty === null) return;

    const num = parseInt(qty);
    if (isNaN(num) || num <= 0) {
      App.toast(Lang.t('invalidNumber'), 'error');
      return;
    }

    // Convert units to pieces for bulk products
    const piecesToAdd = isBulk ? num * ppu : num;
    const newStock = (product.stock || 0) + piecesToAdd;
    Storage.updateProduct(productId, { stock: newStock });
    Storage.logStockChange(productId, product.name, piecesToAdd, 'Restock');

    App.toast(Lang.t('restocked'), 'success');
    this.render();
    Products.render();
    Dashboard.refresh();
  },

  getLowStockItems() {
    return Storage.getProducts().filter(p => p.stock <= (p.minStock || 5));
  }
};
