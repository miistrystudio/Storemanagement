/* ============================================
   MistryStudio — Storage Layer
   Uses localStorage now, designed for easy
   Firebase swap later.
   ============================================ */

const Storage = {
  KEYS: {
    PRODUCTS: 'ms_products',
    CATEGORIES: 'ms_categories',
    DAILY_RECORDS: 'ms_daily_records',
    STOCK_LOG: 'ms_stock_log',
    SETTINGS: 'ms_settings'
  },

  /* ---------- Core CRUD ---------- */
  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Storage save error:', e);
      return false;
    }
  },

  load(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.error('Storage load error:', e);
      return fallback;
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  /* ---------- Products ---------- */
  getProducts() {
    return this.load(this.KEYS.PRODUCTS, []);
  },

  saveProducts(products) {
    this.save(this.KEYS.PRODUCTS, products);
  },

  addProduct(product) {
    const products = this.getProducts();
    product.id = this.generateId();
    product.createdAt = new Date().toISOString();
    product.updatedAt = new Date().toISOString();
    products.push(product);
    this.saveProducts(products);

    // Sync to Supabase
    if (typeof SupabaseSync !== 'undefined') SupabaseSync.pushProduct(product);

    return product;
  },

  updateProduct(id, updates) {
    const products = this.getProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx !== -1) {
      products[idx] = { ...products[idx], ...updates, updatedAt: new Date().toISOString() };
      this.saveProducts(products);

      // Sync to Supabase
      if (typeof SupabaseSync !== 'undefined') SupabaseSync.pushProduct(products[idx]);

      return products[idx];
    }
    return null;
  },

  deleteProduct(id) {
    let products = this.getProducts();
    products = products.filter(p => p.id !== id);
    this.saveProducts(products);

    // Sync to Supabase
    if (typeof SupabaseSync !== 'undefined') SupabaseSync.deleteProductRemote(id);
  },

  /* ---------- Categories ---------- */
  getCategories() {
    return this.load(this.KEYS.CATEGORIES, [
      'Pens', 'Pencils', 'Notebooks', 'Files & Folders',
      'Art Supplies', 'Erasers', 'Markers', 'Other'
    ]);
  },

  saveCategories(categories) {
    this.save(this.KEYS.CATEGORIES, categories);

    // Sync to Supabase
    if (typeof SupabaseSync !== 'undefined') SupabaseSync.pushCategories(categories);
  },

  addCategory(name) {
    const cats = this.getCategories();
    if (!cats.includes(name)) {
      cats.push(name);
      this.saveCategories(cats);
    }
    return cats;
  },

  deleteCategory(name) {
    let cats = this.getCategories();
    cats = cats.filter(c => c !== name);
    this.saveCategories(cats);
    return cats;
  },

  /* ---------- Daily Records ---------- */
  getDailyRecords() {
    return this.load(this.KEYS.DAILY_RECORDS, {});
  },

  getDailyRecord(dateStr) {
    const records = this.getDailyRecords();
    return records[dateStr] || { sales: [], expenses: [], date: dateStr };
  },

  saveDailyRecord(dateStr, record) {
    const records = this.getDailyRecords();
    records[dateStr] = record;
    this.save(this.KEYS.DAILY_RECORDS, records);
  },

  addSale(dateStr, sale) {
    const record = this.getDailyRecord(dateStr);
    sale.id = this.generateId();
    sale.timestamp = new Date().toISOString();
    record.sales.push(sale);
    this.saveDailyRecord(dateStr, record);

    // Update product stock
    if (sale.productId) {
      const product = this.getProducts().find(p => p.id === sale.productId);
      if (product) {
        const newStock = Math.max(0, (product.stock || 0) - (sale.qty || 0));
        this.updateProduct(sale.productId, { stock: newStock });
      }
    }

    // Sync sale to Supabase
    if (typeof SupabaseSync !== 'undefined') SupabaseSync.pushSale(dateStr, sale);

    return sale;
  },

  addExpense(dateStr, expense) {
    const record = this.getDailyRecord(dateStr);
    expense.id = this.generateId();
    expense.timestamp = new Date().toISOString();
    record.expenses.push(expense);
    this.saveDailyRecord(dateStr, record);

    // Sync to Supabase
    if (typeof SupabaseSync !== 'undefined') SupabaseSync.pushExpense(dateStr, expense);

    return expense;
  },

  deleteSale(dateStr, saleId) {
    const record = this.getDailyRecord(dateStr);
    record.sales = record.sales.filter(s => s.id !== saleId);
    this.saveDailyRecord(dateStr, record);

    // Sync to Supabase
    if (typeof SupabaseSync !== 'undefined') SupabaseSync.deleteSaleRemote(saleId);
  },

  deleteExpense(dateStr, expenseId) {
    const record = this.getDailyRecord(dateStr);
    record.expenses = record.expenses.filter(e => e.id !== expenseId);
    this.saveDailyRecord(dateStr, record);

    // Sync to Supabase
    if (typeof SupabaseSync !== 'undefined') SupabaseSync.deleteExpenseRemote(expenseId);
  },

  /* ---------- Stock Log ---------- */
  getStockLog() {
    return this.load(this.KEYS.STOCK_LOG, []);
  },

  logStockChange(productId, productName, change, reason) {
    const log = this.getStockLog();
    const entry = {
      id: this.generateId(),
      productId,
      productName,
      change,
      reason,
      timestamp: new Date().toISOString()
    };
    log.unshift(entry);
    // Keep last 500 entries
    if (log.length > 500) log.length = 500;
    this.save(this.KEYS.STOCK_LOG, log);

    // Sync to Supabase
    if (typeof SupabaseSync !== 'undefined') SupabaseSync.pushStockLog(entry);
  },

  /* ---------- Export / Import ---------- */
  exportAll() {
    const data = {
      products: this.getProducts(),
      categories: this.getCategories(),
      dailyRecords: this.getDailyRecords(),
      stockLog: this.getStockLog(),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MistryStudio_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importAll(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.products) this.saveProducts(data.products);
      if (data.categories) this.saveCategories(data.categories);
      if (data.dailyRecords) this.save(this.KEYS.DAILY_RECORDS, data.dailyRecords);
      if (data.stockLog) this.save(this.KEYS.STOCK_LOG, data.stockLog);

      // Re-migrate everything to Supabase after import
      if (typeof SupabaseSync !== 'undefined') {
        localStorage.removeItem(SupabaseSync.MIGRATED_KEY);
        SupabaseSync.syncAll();
      }

      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  },

  /* ---------- Helpers ---------- */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }
};
