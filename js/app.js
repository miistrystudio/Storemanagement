/* ============================================
   MistryStudio — App Core (Routing & Utils)
   ============================================ */

const App = {
  currentView: 'dashboard',

  async init() {
    this.bindNavigation();
    this.bindGlobalEvents();

    // Initialize modules
    Products.init();
    Inventory.init();
    Daily.init();
    Dashboard.init();

    // Apply saved language
    Lang.applyAll();

    // Show dashboard
    this.navigate('dashboard');

    // Initialize Supabase sync (offline-first, non-blocking)
    if (typeof SupabaseSync !== 'undefined') {
      try {
        await SupabaseSync.init();
      } catch (e) {
        console.warn('Supabase sync init failed:', e);
      }
    }
  },

  bindNavigation() {
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
      item.addEventListener('click', () => {
        this.navigate(item.dataset.view);
      });
    });
  },

  bindGlobalEvents() {
    // Mobile menu
    document.getElementById('menuToggle')?.addEventListener('click', () => {
      document.querySelector('.sidebar').classList.toggle('open');
      document.querySelector('.sidebar-overlay').classList.toggle('active');
    });
    document.querySelector('.sidebar-overlay')?.addEventListener('click', () => {
      document.querySelector('.sidebar').classList.remove('open');
      document.querySelector('.sidebar-overlay').classList.remove('active');
    });

    // Export / Import
    document.getElementById('exportBtn')?.addEventListener('click', () => {
      Storage.exportAll();
      this.toast(Lang.t('exportSuccess'), 'success');
    });
    document.getElementById('importBtn')?.addEventListener('click', () => {
      document.getElementById('importFileInput').click();
    });
    document.getElementById('importFileInput')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (Storage.importAll(ev.target.result)) {
          this.toast(Lang.t('importSuccess'), 'success');
          setTimeout(() => location.reload(), 1000);
        } else {
          this.toast(Lang.t('importError'), 'error');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });

    // Close modals on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
        document.querySelectorAll('.confirm-overlay.active').forEach(m => m.classList.remove('active'));
      }
    });

    // Quick actions
    document.getElementById('qaAddProduct')?.addEventListener('click', () => {
      this.navigate('products');
      setTimeout(() => Products.openModal(), 200);
    });
    document.getElementById('qaRecordSale')?.addEventListener('click', () => {
      this.navigate('daily');
      setTimeout(() => Daily.openSaleModal(), 200);
    });
    document.getElementById('qaViewInventory')?.addEventListener('click', () => {
      this.navigate('inventory');
    });

    // Manual sync button
    document.getElementById('syncBtn')?.addEventListener('click', async () => {
      if (typeof SupabaseSync !== 'undefined') {
        App.toast('☁️ Syncing...', 'info');
        await SupabaseSync.syncAll();
        App.toast('☁️ Sync complete!', 'success');
      }
    });
  },

  navigate(viewName) {
    this.currentView = viewName;

    // Update views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(`view-${viewName}`);
    if (target) target.classList.add('active');

    // Update nav
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewName);
    });

    // Update top bar title using translations
    const titleKeys = {
      dashboard: ['navDashboard', 'dashSubtitle'],
      products: ['navProducts', 'prodSubtitle'],
      inventory: ['navInventory', 'invSubtitle'],
      daily: ['navDaily', 'dailySubtitle'],
      help: ['helpTitle', 'helpSubtitle']
    };
    const [titleKey, subtitleKey] = titleKeys[viewName] || ['', ''];
    document.getElementById('pageTitle').textContent = Lang.t(titleKey);
    document.getElementById('pageSubtitle').textContent = Lang.t(subtitleKey);

    // Close mobile sidebar
    document.querySelector('.sidebar')?.classList.remove('open');
    document.querySelector('.sidebar-overlay')?.classList.remove('active');

    // Refresh specific views
    if (viewName === 'dashboard') Dashboard.refresh();
    if (viewName === 'inventory') Inventory.render();
  },

  /* ---------- Toast ---------- */
  toast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  /* ---------- Confirm ---------- */
  confirm(message, onConfirm) {
    const overlay = document.getElementById('confirmOverlay');
    document.getElementById('confirmMessage').textContent = message;

    const yesBtn = document.getElementById('confirmYes');
    const noBtn = document.getElementById('confirmNo');

    const cleanup = () => {
      overlay.classList.remove('active');
      yesBtn.replaceWith(yesBtn.cloneNode(true));
      noBtn.replaceWith(noBtn.cloneNode(true));
    };

    document.getElementById('confirmYes').addEventListener('click', () => {
      cleanup();
      onConfirm();
    }, { once: true });

    document.getElementById('confirmNo').addEventListener('click', () => {
      cleanup();
    }, { once: true });

    overlay.classList.add('active');
  }
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
