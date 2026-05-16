/* ============================================
   MistryStudio — Supabase Client & Sync Engine
   Offline-first: localStorage is the primary
   data source, Supabase syncs in background.
   ============================================ */

const SUPABASE_URL = 'https://qezjdbwpbtclyucrsnmn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlempkYndwYnRjbHl1Y3Jzbm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4ODkyOTIsImV4cCI6MjA5NDQ2NTI5Mn0.iEv_Y6nzE14UbOr-3vL8bJTxYf3MqZopbd8S4I8MtUc';

let supabaseDB = null;
try {
  const { createClient } = supabase;
  supabaseDB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (e) {
  console.warn('Supabase client init failed:', e);
}

const SupabaseSync = {
  isOnline: navigator.onLine,
  syncInProgress: false,
  MIGRATED_KEY: 'ms_supabase_migrated',

  async init() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.updateIndicator();
      this.syncAll();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateIndicator();
    });
    this.updateIndicator();

    if (this.isOnline && supabaseDB) {
      await this.syncAll();
    }
  },

  updateIndicator() {
    const dot = document.getElementById('syncStatusDot');
    const text = document.getElementById('syncStatusText');
    if (dot) dot.className = `sync-dot ${this.isOnline ? 'online' : 'offline'}`;
    if (text) text.textContent = this.isOnline ? (Lang ? Lang.t('online') : 'Online') : (Lang ? Lang.t('offline') : 'Offline');
  },

  /* ========== MAIN SYNC ========== */
  async syncAll() {
    if (this.syncInProgress || !this.isOnline || !supabaseDB) return;
    this.syncInProgress = true;
    this.updateIndicator();
    try {
      const migrated = localStorage.getItem(this.MIGRATED_KEY);
      if (!migrated) {
        // Check if Supabase already has data
        const { data } = await supabaseDB.from('products').select('id').limit(1);
        if (data && data.length > 0) {
          // Supabase has data, pull it
          await this.pullFromSupabase();
        } else {
          // Supabase empty, push local data
          await this.migrateToSupabase();
        }
        localStorage.setItem(this.MIGRATED_KEY, 'true');
      } else {
        await this.pullFromSupabase();
      }
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      this.syncInProgress = false;
      this.updateIndicator();
    }
  },

  /* ========== MIGRATE localStorage → Supabase ========== */
  async migrateToSupabase() {
    console.log('Migrating localStorage → Supabase...');

    const products = Storage.getProducts();
    if (products.length) {
      await supabaseDB.from('products').upsert(products.map(p => this.productToRow(p)), { onConflict: 'id' });
    }

    const cats = Storage.getCategories();
    if (cats.length) {
      await supabaseDB.from('categories').delete().neq('name', '');
      await supabaseDB.from('categories').insert(cats.map(n => ({ name: n })));
    }

    const records = Storage.getDailyRecords();
    const allSales = [], allExpenses = [];
    for (const [dateStr, rec] of Object.entries(records)) {
      (rec.sales || []).forEach(s => allSales.push(this.saleToRow(dateStr, s)));
      (rec.expenses || []).forEach(e => allExpenses.push(this.expenseToRow(dateStr, e)));
    }
    if (allSales.length) await supabaseDB.from('sales').upsert(allSales, { onConflict: 'id' });
    if (allExpenses.length) await supabaseDB.from('expenses').upsert(allExpenses, { onConflict: 'id' });

    const log = Storage.getStockLog();
    if (log.length) await supabaseDB.from('stock_log').upsert(log.map(l => this.logToRow(l)), { onConflict: 'id' });

    console.log('Migration complete!');
    App.toast('☁️ Data synced to cloud!', 'success');
  },

  /* ========== PULL Supabase → localStorage ========== */
  async pullFromSupabase() {
    const { data: products } = await supabaseDB.from('products').select('*').order('created_at');
    if (products) Storage.save(Storage.KEYS.PRODUCTS, products.map(p => this.rowToProduct(p)));

    const { data: cats } = await supabaseDB.from('categories').select('name').order('id');
    if (cats) Storage.save(Storage.KEYS.CATEGORIES, cats.map(c => c.name));

    const { data: sales } = await supabaseDB.from('sales').select('*').order('timestamp');
    const { data: expenses } = await supabaseDB.from('expenses').select('*').order('timestamp');
    const records = {};
    (sales || []).forEach(s => {
      if (!records[s.date]) records[s.date] = { sales: [], expenses: [], date: s.date };
      records[s.date].sales.push(this.rowToSale(s));
    });
    (expenses || []).forEach(e => {
      if (!records[e.date]) records[e.date] = { sales: [], expenses: [], date: e.date };
      records[e.date].expenses.push(this.rowToExpense(e));
    });
    Storage.save(Storage.KEYS.DAILY_RECORDS, records);

    const { data: log } = await supabaseDB.from('stock_log').select('*').order('timestamp', { ascending: false }).limit(500);
    if (log) Storage.save(Storage.KEYS.STOCK_LOG, log.map(l => this.rowToLog(l)));

    this.refreshUI();
  },

  refreshUI() {
    try {
      if (typeof Products !== 'undefined') Products.render();
      if (typeof Inventory !== 'undefined') Inventory.render();
      if (typeof Daily !== 'undefined') Daily.render();
      if (typeof Dashboard !== 'undefined') Dashboard.refresh();
    } catch (e) { /* modules may not be initialized yet */ }
  },

  /* ========== PUSH individual changes ========== */
  async pushProduct(product) {
    if (!this.isOnline || !supabaseDB) return;
    try { await supabaseDB.from('products').upsert(this.productToRow(product), { onConflict: 'id' }); }
    catch (e) { console.warn('pushProduct failed:', e); }
  },

  async deleteProductRemote(id) {
    if (!this.isOnline || !supabaseDB) return;
    try { await supabaseDB.from('products').delete().eq('id', id); }
    catch (e) { console.warn('deleteProductRemote failed:', e); }
  },

  async pushCategories(categories) {
    if (!this.isOnline || !supabaseDB) return;
    try {
      await supabaseDB.from('categories').delete().neq('name', '');
      if (categories.length) await supabaseDB.from('categories').insert(categories.map(n => ({ name: n })));
    } catch (e) { console.warn('pushCategories failed:', e); }
  },

  async pushSale(dateStr, sale) {
    if (!this.isOnline || !supabaseDB) return;
    try { await supabaseDB.from('sales').upsert(this.saleToRow(dateStr, sale), { onConflict: 'id' }); }
    catch (e) { console.warn('pushSale failed:', e); }
  },

  async deleteSaleRemote(saleId) {
    if (!this.isOnline || !supabaseDB) return;
    try { await supabaseDB.from('sales').delete().eq('id', saleId); }
    catch (e) { console.warn('deleteSaleRemote failed:', e); }
  },

  async pushExpense(dateStr, expense) {
    if (!this.isOnline || !supabaseDB) return;
    try { await supabaseDB.from('expenses').upsert(this.expenseToRow(dateStr, expense), { onConflict: 'id' }); }
    catch (e) { console.warn('pushExpense failed:', e); }
  },

  async deleteExpenseRemote(expenseId) {
    if (!this.isOnline || !supabaseDB) return;
    try { await supabaseDB.from('expenses').delete().eq('id', expenseId); }
    catch (e) { console.warn('deleteExpenseRemote failed:', e); }
  },

  async pushStockLog(entry) {
    if (!this.isOnline || !supabaseDB) return;
    try { await supabaseDB.from('stock_log').upsert(this.logToRow(entry), { onConflict: 'id' }); }
    catch (e) { console.warn('pushStockLog failed:', e); }
  },

  async pushProductStock(productId, newStock) {
    if (!this.isOnline || !supabaseDB) return;
    try { await supabaseDB.from('products').update({ stock: newStock, updated_at: new Date().toISOString() }).eq('id', productId); }
    catch (e) { console.warn('pushProductStock failed:', e); }
  },

  /* ========== DATA MAPPING ========== */
  productToRow(p) {
    return { id: p.id, name: p.name, category: p.category || null, cost_price: p.costPrice || 0,
      sell_price: p.sellPrice || 0, stock: p.stock || 0, min_stock: p.minStock || 5,
      unit: p.unit || 'pcs', pcs_per_unit: p.pcsPerUnit || 1, notes: p.notes || null,
      created_at: p.createdAt || new Date().toISOString(), updated_at: p.updatedAt || new Date().toISOString() };
  },
  rowToProduct(r) {
    return { id: r.id, name: r.name, category: r.category || '', costPrice: r.cost_price || 0,
      sellPrice: r.sell_price || 0, stock: r.stock || 0, minStock: r.min_stock || 5,
      unit: r.unit || 'pcs', pcsPerUnit: r.pcs_per_unit || 1, notes: r.notes || '',
      createdAt: r.created_at, updatedAt: r.updated_at };
  },
  saleToRow(dateStr, s) {
    return { id: s.id, date: dateStr, product_id: s.productId || null, product_name: s.productName || '',
      qty: s.qty || 0, price: s.price || 0, total: s.total || 0, unit: s.unit || 'pcs',
      pcs_per_unit: s.pcsPerUnit || 1, timestamp: s.timestamp || new Date().toISOString() };
  },
  rowToSale(r) {
    return { id: r.id, productId: r.product_id, productName: r.product_name || '', qty: r.qty || 0,
      price: r.price || 0, total: r.total || 0, unit: r.unit || 'pcs', pcsPerUnit: r.pcs_per_unit || 1,
      timestamp: r.timestamp };
  },
  expenseToRow(dateStr, e) {
    return { id: e.id, date: dateStr, description: e.description || '', amount: e.amount || 0,
      category: e.category || 'general', timestamp: e.timestamp || new Date().toISOString() };
  },
  rowToExpense(r) {
    return { id: r.id, description: r.description || '', amount: r.amount || 0,
      category: r.category || 'general', timestamp: r.timestamp };
  },
  logToRow(l) {
    return { id: l.id, product_id: l.productId || null, product_name: l.productName || '',
      change: l.change || 0, reason: l.reason || '', timestamp: l.timestamp || new Date().toISOString() };
  },
  rowToLog(r) {
    return { id: r.id, productId: r.product_id, productName: r.product_name || '',
      change: r.change || 0, reason: r.reason || '', timestamp: r.timestamp };
  }
};
