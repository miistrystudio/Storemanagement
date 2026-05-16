/* ============================================
   MistryStudio — Dashboard Module
   ============================================ */

const Dashboard = {
  revenueChart: null,
  categoryChart: null,

  init() {
    this.refresh();
  },

  refresh() {
    this.renderStats();
    this.renderRevenueChart();
    this.renderCategoryChart();
    this.renderLowStockList();
  },

  renderStats() {
    const products = Storage.getProducts();
    const today = new Date().toISOString().split('T')[0];
    const record = Storage.getDailyRecord(today);

    const totalProducts = products.length;
    const totalStockValue = products.reduce((sum, p) => {
      const costPerPiece = (p.costPrice || 0) / (p.pcsPerUnit || 1);
      return sum + (costPerPiece * (p.stock || 0));
    }, 0);
    const todaySales = (record.sales || []).reduce((sum, s) => sum + (s.total || 0), 0);
    const todayExpenses = (record.expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);
    const todayCost = (record.sales || []).reduce((sum, s) => {
      const prod = products.find(p => p.id === s.productId);
      const costPerPiece = (prod?.costPrice || 0) / (prod?.pcsPerUnit || 1);
      return sum + (costPerPiece * (s.qty || 0));
    }, 0);
    const todayProfit = todaySales - todayCost - todayExpenses;

    document.getElementById('statTotalProducts').textContent = totalProducts;
    document.getElementById('statStockValue').textContent = `₹${totalStockValue.toFixed(0)}`;
    document.getElementById('statTodaySales').textContent = `₹${todaySales.toFixed(0)}`;

    const profitEl = document.getElementById('statTodayProfit');
    profitEl.textContent = `${todayProfit >= 0 ? '+' : ''}₹${todayProfit.toFixed(0)}`;
    profitEl.className = `stat-value ${todayProfit >= 0 ? 'text-green' : 'text-red'}`;
  },

  renderRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    const labels = [];
    const revenueData = [];
    const costData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const locale = Lang.current === 'gu' ? 'gu-IN' : 'en-IN';
      labels.push(d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric' }));

      const record = Storage.getDailyRecord(dateStr);
      const products = Storage.getProducts();
      const revenue = (record.sales || []).reduce((sum, s) => sum + (s.total || 0), 0);
      const cost = (record.sales || []).reduce((sum, s) => {
        const prod = products.find(p => p.id === s.productId);
        const costPerPiece = (prod?.costPrice || 0) / (prod?.pcsPerUnit || 1);
        return sum + (costPerPiece * (s.qty || 0));
      }, 0) + (record.expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);

      revenueData.push(revenue);
      costData.push(cost);
    }

    if (this.revenueChart) this.revenueChart.destroy();

    this.revenueChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: Lang.t('revenue'),
            data: revenueData,
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
            borderRadius: 6,
            barPercentage: 0.6
          },
          {
            label: Lang.t('cost'),
            data: costData,
            backgroundColor: 'rgba(239, 68, 68, 0.5)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 1,
            borderRadius: 6,
            barPercentage: 0.6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 }, usePointStyle: true, pointStyleWidth: 10 }
          }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { family: 'Inter', size: 12 } } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { family: 'Inter', size: 12 }, callback: v => '₹' + v } }
        }
      }
    });
  },

  renderCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    const products = Storage.getProducts();
    const catMap = {};
    products.forEach(p => {
      const cat = p.category || 'Other';
      catMap[cat] = (catMap[cat] || 0) + (p.stock || 0);
    });

    const labels = Object.keys(catMap);
    const data = Object.values(catMap);
    const colors = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

    if (this.categoryChart) this.categoryChart.destroy();

    // Show/hide empty state without destroying the canvas
    let emptyMsg = ctx.parentElement.querySelector('.chart-empty-msg');
    if (!labels.length) {
      ctx.style.display = 'none';
      if (!emptyMsg) {
        emptyMsg = document.createElement('div');
        emptyMsg.className = 'chart-empty-msg empty-state';
        emptyMsg.style.padding = '16px';
        emptyMsg.innerHTML = `<p>${Lang.t('noProductsYet')}</p>`;
        ctx.parentElement.appendChild(emptyMsg);
      }
      emptyMsg.style.display = 'block';
      return;
    }
    ctx.style.display = 'block';
    if (emptyMsg) emptyMsg.style.display = 'none';

    this.categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: '#1a2236',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 }, padding: 12, usePointStyle: true }
          }
        }
      }
    });
  },

  renderLowStockList() {
    const container = document.getElementById('dashLowStock');
    if (!container) return;

    const items = Inventory.getLowStockItems();
    if (!items.length) {
      container.innerHTML = `<div class="empty-state" style="padding:16px"><p style="color:var(--accent-green)">✓ ${Lang.t('allStockHealthy')}</p></div>`;
      return;
    }

    container.innerHTML = items.slice(0, 8).map(p => {
      const statusClass = p.stock <= 0 ? 'text-red' : 'text-amber';
      return `<div class="low-stock-item">
        <span class="item-name">${Products.escapeHtml(p.name)}</span>
        <span class="item-stock ${statusClass}">${Products.formatStockDisplay(p)}</span>
      </div>`;
    }).join('');
  }
};
