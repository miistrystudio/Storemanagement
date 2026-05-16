/* ============================================
   MistryStudio — Daily Tracker Module
   ============================================ */

const Daily = {
  currentDate: null,
  calYear: null,
  calMonth: null,
  calSelectedDate: null,

  init() {
    this.currentDate = this.getTodayStr();
    const now = new Date();
    this.calYear = now.getFullYear();
    this.calMonth = now.getMonth();
    this.bindEvents();
    this.render();
  },

  bindEvents() {
    document.getElementById('prevDay')?.addEventListener('click', () => this.changeDate(-1));
    document.getElementById('nextDay')?.addEventListener('click', () => this.changeDate(1));
    document.getElementById('todayBtn')?.addEventListener('click', () => {
      this.currentDate = this.getTodayStr();
      this.render();
    });
    document.getElementById('addSaleBtn')?.addEventListener('click', () => this.openSaleModal());
    document.getElementById('addExpenseBtn')?.addEventListener('click', () => this.openExpenseModal());
    document.getElementById('saleForm')?.addEventListener('submit', (e) => this.handleSaleSubmit(e));
    document.getElementById('expenseForm')?.addEventListener('submit', (e) => this.handleExpenseSubmit(e));
    document.getElementById('saleModalClose')?.addEventListener('click', () => this.closeSaleModal());
    document.getElementById('saleModalCancel')?.addEventListener('click', () => this.closeSaleModal());
    document.getElementById('expenseModalClose')?.addEventListener('click', () => this.closeExpenseModal());
    document.getElementById('expenseModalCancel')?.addEventListener('click', () => this.closeExpenseModal());

    document.getElementById('saleProduct')?.addEventListener('change', (e) => {
      const prod = Storage.getProducts().find(p => p.id === e.target.value);
      if (prod) {
        const ppu = prod.pcsPerUnit || 1;
        const unit = prod.unit || 'pcs';
        const isBulkUnit = ['box', 'pack', 'set', 'dz'].includes(unit) && ppu > 1;
        const infoDiv = document.getElementById('saleProductInfo');
        const infoText = document.getElementById('saleInfoText');
        const qtyUnit = document.getElementById('saleQtyUnit');
        const priceHint = document.getElementById('salePriceHint');

        if (isBulkUnit) {
          // Calculate per-piece price
          const perPiecePrice = prod.sellPrice ? (prod.sellPrice / ppu) : 0;
          const totalPieces = prod.stock || 0;

          // Show info bar
          infoDiv.style.display = 'block';
          infoText.innerHTML = `📦 1 ${Products.escapeHtml(unit)} = <strong>${ppu} pcs</strong> | ${Lang.t('availablePcs')}: <strong>${totalPieces} pcs</strong> (${Products.formatStockDisplay(prod)})`;

          // Set per-piece price
          document.getElementById('salePrice').value = perPiecePrice.toFixed(2);
          document.getElementById('saleQty').value = 1;

          // Show hints
          qtyUnit.style.display = 'block';
          qtyUnit.textContent = `${Lang.t('sellingInPieces')} (1 ${unit} = ${ppu} pcs)`;
          priceHint.style.display = 'block';
          priceHint.textContent = `${Lang.t('pricePerPiece')}: ₹${perPiecePrice.toFixed(2)}`;
        } else {
          // Simple product (pcs/kg)
          infoDiv.style.display = 'none';
          document.getElementById('salePrice').value = prod.sellPrice || 0;
          document.getElementById('saleQty').value = 1;
          qtyUnit.style.display = 'none';
          priceHint.style.display = 'none';
        }
        this.updateSaleTotal();
      } else {
        document.getElementById('saleProductInfo').style.display = 'none';
        document.getElementById('saleQtyUnit').style.display = 'none';
        document.getElementById('salePriceHint').style.display = 'none';
      }
    });
    document.getElementById('saleQty')?.addEventListener('input', () => this.updateSaleTotal());
    document.getElementById('salePrice')?.addEventListener('input', () => this.updateSaleTotal());

    // Calendar events
    document.getElementById('openCalendarBtn')?.addEventListener('click', () => this.openCalendar());
    document.getElementById('calendarModalClose')?.addEventListener('click', () => this.closeCalendar());
    document.getElementById('calPrevMonth')?.addEventListener('click', () => this.calChangeMonth(-1));
    document.getElementById('calNextMonth')?.addEventListener('click', () => this.calChangeMonth(1));
    document.getElementById('calGoToDay')?.addEventListener('click', () => this.calGoToSelectedDay());

    // EOD Report events
    document.getElementById('eodReportBtn')?.addEventListener('click', () => this.openEODReport());
    document.getElementById('eodModalClose')?.addEventListener('click', () => this.closeEODReport());
    document.getElementById('eodCloseBtn')?.addEventListener('click', () => this.closeEODReport());
    document.getElementById('eodPrintBtn')?.addEventListener('click', () => this.printEODReport());
  },

  getTodayStr() {
    return new Date().toISOString().split('T')[0];
  },

  changeDate(delta) {
    const d = new Date(this.currentDate);
    d.setDate(d.getDate() + delta);
    this.currentDate = d.toISOString().split('T')[0];
    this.render();
  },

  formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const locale = Lang.current === 'gu' ? 'gu-IN' : 'en-IN';
    return d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  },

  render() {
    const dateEl = document.getElementById('currentDateDisplay');
    if (dateEl) dateEl.textContent = this.formatDate(this.currentDate);

    const isToday = this.currentDate === this.getTodayStr();
    const todayBtn = document.getElementById('todayBtn');
    if (todayBtn) todayBtn.style.display = isToday ? 'none' : 'inline-flex';

    const record = Storage.getDailyRecord(this.currentDate);
    this.renderSummary(record);
    this.renderSalesList(record.sales || []);
    this.renderExpensesList(record.expenses || []);
  },

  renderSummary(record) {
    const sales = record.sales || [];
    const expenses = record.expenses || [];

    const totalRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0);
    const totalCost = sales.reduce((sum, s) => {
      const prod = Storage.getProducts().find(p => p.id === s.productId);
      const costPerPiece = (prod?.costPrice || 0) / (prod?.pcsPerUnit || 1);
      return sum + (costPerPiece * (s.qty || 0));
    }, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netProfit = totalRevenue - totalCost - totalExpenses;

    document.getElementById('dailyRevenue').textContent = `₹${totalRevenue.toFixed(2)}`;
    document.getElementById('dailyCost').textContent = `₹${(totalCost + totalExpenses).toFixed(2)}`;

    const profitEl = document.getElementById('dailyProfit');
    profitEl.textContent = `${netProfit >= 0 ? '+' : ''}₹${netProfit.toFixed(2)}`;

    const profitCard = document.getElementById('profitCard');
    profitCard.className = `summary-card ${netProfit >= 0 ? 'profit' : 'loss'}`;
  },

  renderSalesList(sales) {
    const container = document.getElementById('salesList');
    if (!sales.length) {
      container.innerHTML = `<div class="empty-state"><p>${Lang.t('noSales')}</p></div>`;
      return;
    }
    container.innerHTML = sales.map(s => {
      const prod = Storage.getProducts().find(p => p.id === s.productId);
      return `<div class="low-stock-item">
        <div>
          <div class="item-name">${Products.escapeHtml(s.productName || prod?.name || 'Unknown')}</div>
          <div style="font-size:13px;color:var(--text-muted)">${s.qty} pcs × ₹${(s.price || 0).toFixed(2)}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="font-semibold text-green">₹${(s.total || 0).toFixed(2)}</span>
          <button class="btn btn-ghost btn-sm" onclick="Daily.deleteSaleItem('${s.id}')">✕</button>
        </div>
      </div>`;
    }).join('');
  },

  renderExpensesList(expenses) {
    const container = document.getElementById('expensesList');
    if (!expenses.length) {
      container.innerHTML = `<div class="empty-state"><p>${Lang.t('noExpenses')}</p></div>`;
      return;
    }
    container.innerHTML = expenses.map(e => `
      <div class="low-stock-item">
        <div>
          <div class="item-name">${Products.escapeHtml(e.description || 'Expense')}</div>
          <div style="font-size:13px;color:var(--text-muted)">${e.category || 'General'}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="font-semibold text-red">₹${(e.amount || 0).toFixed(2)}</span>
          <button class="btn btn-ghost btn-sm" onclick="Daily.deleteExpenseItem('${e.id}')">✕</button>
        </div>
      </div>
    `).join('');
  },

  /* ---------- Sale Modal ---------- */
  openSaleModal() {
    const sel = document.getElementById('saleProduct');
    const products = Storage.getProducts();
    sel.innerHTML = `<option value="">${Lang.t('selectProduct')}</option>`;
    products.forEach(p => {
      const stockDisplay = Products.formatStockDisplay(p);
      sel.innerHTML += `<option value="${p.id}">${Products.escapeHtml(p.name)} (${Lang.t('stock')}: ${stockDisplay})</option>`;
    });
    document.getElementById('saleQty').value = 1;
    document.getElementById('salePrice').value = '';
    document.getElementById('saleTotalDisplay').textContent = '₹0.00';
    document.getElementById('saleProductInfo').style.display = 'none';
    document.getElementById('saleQtyUnit').style.display = 'none';
    document.getElementById('salePriceHint').style.display = 'none';
    document.getElementById('saleModal').classList.add('active');
  },

  closeSaleModal() { document.getElementById('saleModal').classList.remove('active'); },

  updateSaleTotal() {
    const qty = parseInt(document.getElementById('saleQty').value) || 0;
    const price = parseFloat(document.getElementById('salePrice').value) || 0;
    document.getElementById('saleTotalDisplay').textContent = `₹${(qty * price).toFixed(2)}`;
  },

  handleSaleSubmit(e) {
    e.preventDefault();
    const productId = document.getElementById('saleProduct').value;
    const qty = parseInt(document.getElementById('saleQty').value) || 0;
    const price = parseFloat(document.getElementById('salePrice').value) || 0;

    if (!productId) { App.toast(Lang.t('selectProductError'), 'error'); return; }
    if (qty <= 0) { App.toast(Lang.t('qtyError'), 'error'); return; }

    const prod = Storage.getProducts().find(p => p.id === productId);
    const ppu = prod?.pcsPerUnit || 1;
    const unit = prod?.unit || 'pcs';
    const isBulkUnit = ['box', 'pack', 'set', 'dz'].includes(unit) && ppu > 1;

    // Check stock availability
    const availableStock = prod?.stock || 0;
    if (qty > availableStock) {
      App.toast(`${Lang.t('insufficientStock')} ${availableStock} pcs`, 'error');
      return;
    }

    // Record sale — qty is always in pieces
    Storage.addSale(this.currentDate, {
      productId,
      productName: prod?.name || 'Unknown',
      qty,        // pieces sold
      price,      // price per piece
      total: qty * price,
      unit: isBulkUnit ? 'pcs' : (unit || 'pcs'),  // always selling in pieces
      pcsPerUnit: ppu  // for reference
    });

    App.toast(Lang.t('saleRecorded'), 'success');
    this.closeSaleModal();
    this.render();
    Inventory.render();
    Dashboard.refresh();
  },

  deleteSaleItem(saleId) {
    // Restore stock before deleting the sale
    const record = Storage.getDailyRecord(this.currentDate);
    const sale = (record.sales || []).find(s => s.id === saleId);
    if (sale && sale.productId) {
      const prod = Storage.getProducts().find(p => p.id === sale.productId);
      if (prod) {
        Storage.updateProduct(sale.productId, {
          stock: (prod.stock || 0) + (sale.qty || 0)
        });
      }
    }
    Storage.deleteSale(this.currentDate, saleId);
    this.render();
    Inventory.render();
    Dashboard.refresh();
  },

  /* ---------- Expense Modal ---------- */
  openExpenseModal() {
    document.getElementById('expenseDesc').value = '';
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseCategory').value = '';
    document.getElementById('expenseModal').classList.add('active');
  },

  closeExpenseModal() { document.getElementById('expenseModal').classList.remove('active'); },

  handleExpenseSubmit(e) {
    e.preventDefault();
    const desc = document.getElementById('expenseDesc').value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount').value) || 0;
    const category = document.getElementById('expenseCategory').value;

    if (!desc) { App.toast(Lang.t('enterDescription'), 'error'); return; }
    if (amount <= 0) { App.toast(Lang.t('amountError'), 'error'); return; }

    Storage.addExpense(this.currentDate, { description: desc, amount, category });
    App.toast(Lang.t('expenseRecorded'), 'success');
    this.closeExpenseModal();
    this.render();
    Dashboard.refresh();
  },

  deleteExpenseItem(expenseId) {
    Storage.deleteExpense(this.currentDate, expenseId);
    this.render();
    Dashboard.refresh();
  },

  /* ========== CALENDAR ========== */

  openCalendar() {
    const d = new Date(this.currentDate + 'T00:00:00');
    this.calYear = d.getFullYear();
    this.calMonth = d.getMonth();
    this.calSelectedDate = null;
    document.getElementById('calDayDetail').classList.add('hidden');
    document.getElementById('calendarModal').classList.add('active');
    this.renderCalendar();
  },

  closeCalendar() {
    document.getElementById('calendarModal').classList.remove('active');
  },

  calChangeMonth(delta) {
    this.calMonth += delta;
    if (this.calMonth < 0) { this.calMonth = 11; this.calYear--; }
    if (this.calMonth > 11) { this.calMonth = 0; this.calYear++; }
    this.calSelectedDate = null;
    document.getElementById('calDayDetail').classList.add('hidden');
    this.renderCalendar();
  },

  getDayProfit(dateStr) {
    const record = Storage.getDailyRecord(dateStr);
    const sales = record.sales || [];
    const expenses = record.expenses || [];
    const products = Storage.getProducts();

    const totalRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0);
    const totalCost = sales.reduce((sum, s) => {
      const prod = products.find(p => p.id === s.productId);
      const costPerPiece = (prod?.costPrice || 0) / (prod?.pcsPerUnit || 1);
      return sum + (costPerPiece * (s.qty || 0));
    }, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const hasData = sales.length > 0 || expenses.length > 0;

    return {
      revenue: totalRevenue,
      cost: totalCost + totalExpenses,
      profit: totalRevenue - totalCost - totalExpenses,
      hasData
    };
  },

  renderCalendar() {
    const locale = Lang.current === 'gu' ? 'gu-IN' : 'en-IN';
    const todayStr = this.getTodayStr();

    // Month label
    const monthDate = new Date(this.calYear, this.calMonth, 1);
    document.getElementById('calMonthLabel').textContent =
      monthDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

    // Weekday headers
    const weekdayNames = [];
    for (let i = 0; i < 7; i++) {
      weekdayNames.push(new Date(2024, 6, 7 + i).toLocaleDateString(locale, { weekday: 'short' }));
    }
    document.getElementById('calWeekdays').innerHTML =
      weekdayNames.map(n => `<div class="cal-weekday">${n}</div>`).join('');

    // First day offset and days count
    const firstDay = new Date(this.calYear, this.calMonth, 1).getDay();
    const daysInMonth = new Date(this.calYear, this.calMonth + 1, 0).getDate();

    let html = '';

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      html += '<div class="cal-day cal-day-empty"></div>';
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${this.calYear}-${String(this.calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const info = this.getDayProfit(dateStr);
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === this.calSelectedDate;

      let dayClass = 'cal-day-none';
      let amountText = '';

      if (info.hasData) {
        if (info.profit > 0) {
          dayClass = info.profit > 500 ? 'cal-day-profit-high' : 'cal-day-profit';
          amountText = `+₹${info.profit.toFixed(0)}`;
        } else if (info.profit < 0) {
          dayClass = info.profit < -500 ? 'cal-day-loss-high' : 'cal-day-loss';
          amountText = `-₹${Math.abs(info.profit).toFixed(0)}`;
        } else {
          amountText = '₹0';
        }
      }

      const extra = (isToday ? ' cal-day-today' : '') + (isSelected ? ' cal-day-selected' : '');

      html += `<div class="cal-day ${dayClass}${extra}" onclick="Daily.calSelectDay('${dateStr}')">
        <span class="cal-day-num">${day}</span>
        ${amountText ? `<span class="cal-day-amount">${amountText}</span>` : ''}
      </div>`;
    }

    document.getElementById('calGrid').innerHTML = html;
  },

  calSelectDay(dateStr) {
    this.calSelectedDate = dateStr;
    this.renderCalendar();

    const info = this.getDayProfit(dateStr);
    const detail = document.getElementById('calDayDetail');
    document.getElementById('calDetailDate').textContent = this.formatDate(dateStr);
    detail.classList.remove('hidden');

    const profitColor = info.profit >= 0 ? 'text-green' : 'text-red';
    const profitSign = info.profit >= 0 ? '+' : '';

    document.getElementById('calDetailStats').innerHTML = `
      <div class="cal-detail-stat">
        <div class="cal-stat-label">${Lang.t('revenueLabel')}</div>
        <div class="cal-stat-value text-green">₹${info.revenue.toFixed(2)}</div>
      </div>
      <div class="cal-detail-stat">
        <div class="cal-stat-label">${Lang.t('costsExpenses')}</div>
        <div class="cal-stat-value text-red">₹${info.cost.toFixed(2)}</div>
      </div>
      <div class="cal-detail-stat">
        <div class="cal-stat-label">${Lang.t('netProfit')}</div>
        <div class="cal-stat-value ${profitColor}">${profitSign}₹${info.profit.toFixed(2)}</div>
      </div>
    `;
  },

  calGoToSelectedDay() {
    if (!this.calSelectedDate) return;
    this.currentDate = this.calSelectedDate;
    this.closeCalendar();
    this.render();
  },

  /* ========== END OF DAY REPORT ========== */

  openEODReport() {
    const body = document.getElementById('eodReportBody');
    body.innerHTML = this.generateEODReport();
    document.getElementById('eodModal').classList.add('active');
  },

  closeEODReport() {
    document.getElementById('eodModal').classList.remove('active');
  },

  generateEODReport() {
    const dateStr = this.currentDate;
    const record = Storage.getDailyRecord(dateStr);
    const sales = record.sales || [];
    const expenses = record.expenses || [];
    const allProducts = Storage.getProducts();

    // --- Calculate financials ---
    const totalRevenue = sales.reduce((s, x) => s + (x.total || 0), 0);
    const totalCost = sales.reduce((s, x) => {
      const prod = allProducts.find(p => p.id === x.productId);
      const cpp = (prod?.costPrice || 0) / (prod?.pcsPerUnit || 1);
      return s + (cpp * (x.qty || 0));
    }, 0);
    const totalExpenses = expenses.reduce((s, x) => s + (x.amount || 0), 0);
    const netProfit = totalRevenue - totalCost - totalExpenses;
    const totalItemsSold = sales.reduce((s, x) => s + (x.qty || 0), 0);

    // --- Stock status ---
    const lowStock = allProducts.filter(p => p.stock > 0 && p.stock <= (p.minStock || 5));
    const outOfStock = allProducts.filter(p => p.stock <= 0);
    const healthyStock = allProducts.filter(p => p.stock > (p.minStock || 5));
    const totalStockValue = allProducts.reduce((s, p) => {
      const cpp = (p.costPrice || 0) / (p.pcsPerUnit || 1);
      return s + (cpp * (p.stock || 0));
    }, 0);

    const profitClass = netProfit >= 0 ? 'text-green' : 'text-red';
    const profitSign = netProfit >= 0 ? '+' : '';
    const dateDisplay = this.formatDate(dateStr);

    let html = `<div class="eod-report" id="eodReportContent">`;

    // --- Header ---
    html += `<div class="eod-header">
      <h3>MistryStudio</h3>
      <div class="eod-date">${dateDisplay}</div>
    </div>`;

    // --- Financial Summary ---
    html += `<div class="eod-section">
      <div class="eod-section-title">${Lang.t('eodFinancialSummary')}</div>
      <div class="eod-stats-grid">
        <div class="eod-stat"><div class="eod-stat-label">${Lang.t('revenueLabel')}</div><div class="eod-stat-value text-green">₹${totalRevenue.toFixed(2)}</div></div>
        <div class="eod-stat"><div class="eod-stat-label">${Lang.t('eodCostOfGoods')}</div><div class="eod-stat-value text-red">₹${totalCost.toFixed(2)}</div></div>
        <div class="eod-stat"><div class="eod-stat-label">${Lang.t('expenses')}</div><div class="eod-stat-value text-red">₹${totalExpenses.toFixed(2)}</div></div>
        <div class="eod-stat eod-stat-highlight"><div class="eod-stat-label">${Lang.t('netProfit')}</div><div class="eod-stat-value ${profitClass}">${profitSign}₹${netProfit.toFixed(2)}</div></div>
      </div>
      <div class="eod-meta">${Lang.t('eodItemsSold')}: <strong>${totalItemsSold}</strong> ${Lang.t('eodPieces')} | ${Lang.t('eodTransactions')}: <strong>${sales.length}</strong></div>
    </div>`;

    // --- Sales Breakdown ---
    html += `<div class="eod-section">
      <div class="eod-section-title">🛒 ${Lang.t('eodSalesBreakdown')}</div>`;
    if (sales.length) {
      html += `<table class="eod-table"><thead><tr>
        <th>${Lang.t('product')}</th><th>${Lang.t('quantity')}</th><th>${Lang.t('price')}</th><th>${Lang.t('total')}</th>
      </tr></thead><tbody>`;
      sales.forEach(s => {
        html += `<tr><td>${Products.escapeHtml(s.productName || 'Unknown')}</td><td>${s.qty} pcs</td><td>₹${(s.price || 0).toFixed(2)}</td><td>₹${(s.total || 0).toFixed(2)}</td></tr>`;
      });
      html += `<tr class="eod-table-total"><td colspan="3"><strong>${Lang.t('total')}</strong></td><td><strong>₹${totalRevenue.toFixed(2)}</strong></td></tr>`;
      html += `</tbody></table>`;
    } else {
      html += `<div class="eod-empty">${Lang.t('noSales')}</div>`;
    }
    html += `</div>`;

    // --- Expenses Breakdown ---
    html += `<div class="eod-section">
      <div class="eod-section-title">💸 ${Lang.t('eodExpensesBreakdown')}</div>`;
    if (expenses.length) {
      html += `<table class="eod-table"><thead><tr>
        <th>${Lang.t('description')}</th><th>${Lang.t('expenseCategory')}</th><th>${Lang.t('amount')}</th>
      </tr></thead><tbody>`;
      expenses.forEach(e => {
        html += `<tr><td>${Products.escapeHtml(e.description || '')}</td><td>${e.category || 'General'}</td><td>₹${(e.amount || 0).toFixed(2)}</td></tr>`;
      });
      html += `<tr class="eod-table-total"><td colspan="2"><strong>${Lang.t('total')}</strong></td><td><strong>₹${totalExpenses.toFixed(2)}</strong></td></tr>`;
      html += `</tbody></table>`;
    } else {
      html += `<div class="eod-empty">${Lang.t('noExpenses')}</div>`;
    }
    html += `</div>`;

    // --- Inventory Status ---
    html += `<div class="eod-section">
      <div class="eod-section-title">📦 ${Lang.t('eodInventoryStatus')}</div>
      <div class="eod-meta">${Lang.t('totalProducts')}: <strong>${allProducts.length}</strong> | ${Lang.t('stockValue')}: <strong>₹${totalStockValue.toFixed(0)}</strong></div>`;

    // Out of Stock
    if (outOfStock.length) {
      html += `<div class="eod-alert eod-alert-red"><strong>🔴 ${Lang.t('outOfStock')} (${outOfStock.length})</strong><ul>`;
      outOfStock.forEach(p => { html += `<li>${Products.escapeHtml(p.name)}</li>`; });
      html += `</ul></div>`;
    }

    // Low Stock
    if (lowStock.length) {
      html += `<div class="eod-alert eod-alert-amber"><strong>🟡 ${Lang.t('lowStock')} (${lowStock.length})</strong><ul>`;
      lowStock.forEach(p => { html += `<li>${Products.escapeHtml(p.name)} — ${Products.formatStockDisplay(p)}</li>`; });
      html += `</ul></div>`;
    }

    // Healthy Stock
    if (healthyStock.length) {
      html += `<div class="eod-alert eod-alert-green"><strong>🟢 ${Lang.t('inStock')} (${healthyStock.length})</strong><ul>`;
      healthyStock.forEach(p => { html += `<li>${Products.escapeHtml(p.name)} — ${Products.formatStockDisplay(p)}</li>`; });
      html += `</ul></div>`;
    }

    if (!allProducts.length) {
      html += `<div class="eod-empty">${Lang.t('noProductsYet')}</div>`;
    }
    html += `</div>`;

    // --- Footer ---
    html += `<div class="eod-footer">${Lang.t('eodGeneratedAt')}: ${new Date().toLocaleTimeString()}</div>`;
    html += `</div>`;

    return html;
  },

  printEODReport() {
    const content = document.getElementById('eodReportContent');
    if (!content) return;
    const win = window.open('', '_blank', 'width=800,height=900');
    win.document.write(`<!DOCTYPE html><html><head><title>MistryStudio - EOD Report</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #1a1a2e; background: #fff; }
        .eod-header { text-align: center; border-bottom: 2px solid #1a1a2e; padding-bottom: 12px; margin-bottom: 20px; }
        .eod-header h3 { font-size: 22px; }
        .eod-date { font-size: 14px; color: #666; margin-top: 4px; }
        .eod-section { margin-bottom: 20px; }
        .eod-section-title { font-size: 16px; font-weight: 700; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #ddd; }
        .eod-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 8px; }
        .eod-stat { padding: 10px; border: 1px solid #ddd; border-radius: 6px; text-align: center; }
        .eod-stat-highlight { background: #f0f9ff; border-color: #3b82f6; }
        .eod-stat-label { font-size: 11px; color: #666; text-transform: uppercase; }
        .eod-stat-value { font-size: 18px; font-weight: 700; margin-top: 4px; }
        .text-green { color: #10b981; } .text-red { color: #ef4444; }
        .eod-meta { font-size: 13px; color: #666; margin: 8px 0; }
        .eod-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .eod-table th { text-align: left; padding: 8px; background: #f8fafc; border-bottom: 2px solid #ddd; font-size: 12px; text-transform: uppercase; color: #666; }
        .eod-table td { padding: 8px; border-bottom: 1px solid #eee; }
        .eod-table-total td { font-weight: 700; border-top: 2px solid #333; background: #f8fafc; }
        .eod-alert { padding: 10px 14px; border-radius: 6px; margin: 8px 0; font-size: 13px; }
        .eod-alert ul { margin: 6px 0 0 20px; }
        .eod-alert-red { background: #fef2f2; border: 1px solid #fecaca; }
        .eod-alert-amber { background: #fffbeb; border: 1px solid #fde68a; }
        .eod-alert-green { background: #f0fdf4; border: 1px solid #bbf7d0; }
        .eod-empty { color: #999; font-style: italic; padding: 12px 0; font-size: 13px; }
        .eod-footer { text-align: center; font-size: 11px; color: #999; margin-top: 20px; padding-top: 12px; border-top: 1px solid #ddd; }
        @media print { body { padding: 12px; } }
      </style>
    </head><body>${content.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  }
};
