/* ============================================
   MistryStudio — Language / Translations
   ============================================ */

const Lang = {
  current: localStorage.getItem('ms_lang') || 'en',

  translations: {
    en: {
      // App
      appName: 'MistryStudio',
      appTagline: 'Stationery Manager',

      // Navigation
      menuLabel: 'MENU',
      navDashboard: 'Dashboard',
      navProducts: 'Products',
      navInventory: 'Inventory',
      navDaily: 'Daily Tracker',
      navHelp: 'Help & Guide',
      dataLabel: 'DATA',
      navExport: 'Export Data',
      navImport: 'Import Data',

      // Dashboard
      dashSubtitle: 'Overview of your shop',
      totalProducts: 'Total Products',
      stockValue: 'Stock Value',
      todaySales: "Today's Sales",
      todayProfit: "Today's Profit",
      revenueVsCost: 'Revenue vs Cost',
      last7Days: 'Last 7 days',
      stockByCategory: 'Stock by Category',
      currentDist: 'Current distribution',
      lowStockAlerts: 'Low Stock Alerts',
      quickActions: 'Quick Actions',
      addProduct: 'Add Product',
      recordSale: 'Record Sale',
      viewInventory: 'View Inventory',
      allStockHealthy: 'All stock levels are healthy',
      noProductsYet: 'No products yet',
      revenue: 'Revenue',
      cost: 'Cost',

      // Products
      prodSubtitle: 'Manage your products',
      searchProducts: 'Search products...',
      allCategories: 'All Categories',
      products: 'products',
      categories: 'Categories',
      addNewProduct: 'Add New Product',
      editProduct: 'Edit Product',
      productName: 'Product Name',
      productNamePlaceholder: 'e.g. Reynolds Pen',
      category: 'Category',
      selectCategory: 'Select Category',
      unit: 'Unit',
      costPrice: 'Cost Price',
      sellPrice: 'Selling Price',
      currentStock: 'Current Stock',
      minStockAlert: 'Min Stock Alert',
      notes: 'Notes',
      notesPlaceholder: 'Optional notes...',
      saveProduct: 'Save Product',
      cancel: 'Cancel',
      name: 'Name',
      margin: 'Margin',
      stock: 'Stock',
      status: 'Status',
      actions: 'Actions',
      inStock: 'In Stock',
      lowStock: 'Low Stock',
      outOfStock: 'Out of Stock',
      noProductsTitle: 'No products yet',
      noProductsDesc: 'Add your first product to get started.',
      addFirstProduct: 'Add First Product',
      productAdded: 'Product added!',
      productUpdated: 'Product updated!',
      productDeleted: 'Product deleted!',
      enterProductName: 'Please enter a product name',
      deleteProductConfirm: 'Delete this product?',
      pieces: 'Pieces',
      box: 'Box',
      pack: 'Pack',
      set: 'Set',
      dozen: 'Dozen',
      kg: 'Kg',
      pcsPerUnit: 'Pieces per Unit',
      pcsPerUnitPlaceholder: 'e.g. 50 pens in 1 box',
      pcsPerUnitHint: 'How many pieces in one',
      stockDisplayBoxes: 'boxes',
      stockDisplayPacks: 'packs',
      stockDisplaySets: 'sets',
      stockDisplayDozens: 'dozens',
      stockDisplayRemaining: 'remaining',
      sellingInPieces: 'Selling in pieces',
      pricePerPiece: 'Price per piece',
      availablePcs: 'Available',
      insufficientStock: 'Not enough stock! Available:',

      // Categories
      manageCategories: 'Manage Categories',
      newCategoryPlaceholder: 'New category name...',
      add: 'Add',
      categoryAdded: 'Category added!',
      categoryRemoved: 'Category removed!',
      categoryExists: 'Category already exists',

      // Inventory
      invSubtitle: 'Check and update stock',
      searchInventory: 'Search inventory...',
      allItems: 'All Items',
      filterLow: 'Low Stock',
      filterOut: 'Out of Stock',
      filterOk: 'In Stock',
      alerts: 'alerts',
      product: 'Product',
      minStock: 'Min Stock',
      action: 'Action',
      restock: 'Restock',
      noInventoryTitle: 'No items',
      noInventoryDesc: 'Add products first.',
      restockPrompt: 'How many to add?',
      restocked: 'Restocked!',
      invalidNumber: 'Enter a valid number',

      // Daily Tracker
      dailySubtitle: 'Record daily sales and expenses',
      goToToday: 'Today',
      revenueLabel: 'Revenue',
      costsExpenses: 'Costs & Expenses',
      netProfit: 'Net Profit',
      sales: 'Sales',
      addSale: 'Add Sale',
      expenses: 'Expenses',
      addExpense: 'Add Expense',
      noSales: 'No sales recorded',
      noExpenses: 'No expenses recorded',
      recordSaleTitle: 'Record Sale',
      selectProduct: 'Select Product',
      quantity: 'Quantity',
      price: 'Price',
      total: 'Total',
      recordSaleBtn: 'Record Sale',
      addExpenseTitle: 'Add Expense',
      description: 'Description',
      descPlaceholder: 'e.g. Electricity bill',
      amount: 'Amount',
      expenseCategory: 'Category',
      general: 'General',
      rent: 'Rent',
      utilities: 'Utilities',
      stockPurchase: 'Stock Purchase',
      transport: 'Transport',
      salary: 'Salary',
      other: 'Other',
      addExpenseBtn: 'Add Expense',
      saleRecorded: 'Sale recorded!',
      expenseRecorded: 'Expense recorded!',
      selectProductError: 'Please select a product',
      qtyError: 'Quantity must be more than 0',
      enterDescription: 'Please enter description',
      amountError: 'Amount must be more than 0',

      // Calendar
      viewCalendar: 'View Calendar',
      profit: 'Profit',
      loss: 'Loss',
      noData: 'No Data',
      openDay: 'Open this day',

      // EOD Report
      eodReport: 'End of Day Report',
      eodReportTitle: 'End of Day Report',
      eodFinancialSummary: '💰 Financial Summary',
      eodCostOfGoods: 'Cost of Goods',
      eodItemsSold: 'Items Sold',
      eodPieces: 'pcs',
      eodTransactions: 'Transactions',
      eodSalesBreakdown: 'Sales Breakdown',
      eodExpensesBreakdown: 'Expenses Breakdown',
      eodInventoryStatus: 'Inventory Status',
      eodGeneratedAt: 'Report generated at',
      printReport: 'Print Report',
      close: 'Close',

      // Confirm
      confirmTitle: 'Are you sure?',
      confirmDelete: 'Delete',

      // Data
      exportSuccess: 'Data exported!',
      importSuccess: 'Data imported! Refreshing...',
      importError: 'Import failed. Check file.',

      // Sync
      online: 'Online',
      offline: 'Offline',

      // Help
      helpTitle: 'Help & Guide',
      helpSubtitle: 'Learn how to use this app',
      helpWelcome: 'Welcome to MistryStudio!',
      helpWelcomeDesc: 'This app helps you manage your stationery shop. Here is what each section does:',
      helpDashboardTitle: '📊 Dashboard',
      helpDashboardDesc: 'See a quick summary of your shop — total products, stock value, today\'s sales, and profit. Charts show your last 7 days performance.',
      helpProductsTitle: '📦 Products',
      helpProductsDesc: 'Add all your shop items here. For each product, enter the name, category, cost price (what you pay), selling price (what customer pays), and stock quantity. You can edit or delete any product.',
      helpInventoryTitle: '🏪 Inventory',
      helpInventoryDesc: 'Check which items are running low. Use the + and − buttons to quickly update stock. Click "Restock" to add large quantities. Items with low stock will show a warning.',
      helpDailyTitle: '📅 Daily Tracker',
      helpDailyDesc: 'Record every sale and expense for each day. Select the product sold, enter quantity, and the app calculates revenue and profit automatically. Also record expenses like rent, electricity, etc.',
      helpCategoriesTitle: '🏷️ Categories',
      helpCategoriesDesc: 'Go to Products → click "Categories" button to add or remove categories. You can create any category you want like Pens, Notebooks, Files, etc.',
      helpExportTitle: '💾 Export / Import',
      helpExportDesc: 'Click "Export Data" to download a backup file. Click "Import Data" to restore from a backup. Always keep a backup!',
      helpTip: '💡 Tip: Start by adding your categories, then add all products, and then record daily sales!',
    },

    gu: {
      // App
      appName: 'MistryStudio',
      appTagline: 'સ્ટેશનરી મેનેજર',

      // Navigation
      menuLabel: 'મેનૂ',
      navDashboard: 'ડેશબોર્ડ',
      navProducts: 'પ્રોડક્ટ્સ',
      navInventory: 'ઇન્વેન્ટરી',
      navDaily: 'દૈનિક ટ્રેકર',
      navHelp: 'મદદ અને માર્ગદર્શિકા',
      dataLabel: 'ડેટા',
      navExport: 'ડેટા એક્સપોર્ટ',
      navImport: 'ડેટા ઇમ્પોર્ટ',

      // Dashboard
      dashSubtitle: 'તમારી દુકાનનો સારાંશ',
      totalProducts: 'કુલ પ્રોડક્ટ્સ',
      stockValue: 'સ્ટોક વેલ્યૂ',
      todaySales: 'આજનું વેચાણ',
      todayProfit: 'આજનો નફો',
      revenueVsCost: 'આવક vs ખર્ચ',
      last7Days: 'છેલ્લા ૭ દિવસ',
      stockByCategory: 'કેટેગરી મુજબ સ્ટોક',
      currentDist: 'હાલની વહેંચણી',
      lowStockAlerts: 'ઓછા સ્ટોકની ચેતવણી',
      quickActions: 'ઝડપી ક્રિયાઓ',
      addProduct: 'પ્રોડક્ટ ઉમેરો',
      recordSale: 'વેચાણ નોંધો',
      viewInventory: 'ઇન્વેન્ટરી જુઓ',
      allStockHealthy: 'બધા સ્ટોક સારા છે',
      noProductsYet: 'હજુ કોઈ પ્રોડક્ટ નથી',
      revenue: 'આવક',
      cost: 'ખર્ચ',

      // Products
      prodSubtitle: 'તમારી પ્રોડક્ટ્સ મેનેજ કરો',
      searchProducts: 'પ્રોડક્ટ શોધો...',
      allCategories: 'બધી કેટેગરી',
      products: 'પ્રોડક્ટ્સ',
      categories: 'કેટેગરી',
      addNewProduct: 'નવી પ્રોડક્ટ ઉમેરો',
      editProduct: 'પ્રોડક્ટ સુધારો',
      productName: 'પ્રોડક્ટનું નામ',
      productNamePlaceholder: 'દા.ત. Reynolds Pen',
      category: 'કેટેગરી',
      selectCategory: 'કેટેગરી પસંદ કરો',
      unit: 'એકમ',
      costPrice: 'ખરીદ કિંમત',
      sellPrice: 'વેચાણ કિંમત',
      currentStock: 'હાલનો સ્ટોક',
      minStockAlert: 'ઓછા સ્ટોકની ચેતવણી',
      notes: 'નોંધ',
      notesPlaceholder: 'વૈકલ્પિક નોંધ...',
      saveProduct: 'સેવ કરો',
      cancel: 'રદ કરો',
      name: 'નામ',
      margin: 'માર્જિન',
      stock: 'સ્ટોક',
      status: 'સ્ટેટસ',
      actions: 'ક્રિયાઓ',
      inStock: 'સ્ટોકમાં',
      lowStock: 'ઓછો સ્ટોક',
      outOfStock: 'સ્ટોક ખતમ',
      noProductsTitle: 'કોઈ પ્રોડક્ટ નથી',
      noProductsDesc: 'શરૂ કરવા પહેલી પ્રોડક્ટ ઉમેરો.',
      addFirstProduct: 'પ્રથમ પ્રોડક્ટ ઉમેરો',
      productAdded: 'પ્રોડક્ટ ઉમેરાઈ!',
      productUpdated: 'પ્રોડક્ટ અપડેટ થઈ!',
      productDeleted: 'પ્રોડક્ટ ડિલીટ થઈ!',
      enterProductName: 'કૃપા કરી પ્રોડક્ટનું નામ દાખલ કરો',
      deleteProductConfirm: 'આ પ્રોડક્ટ ડિલીટ કરવી છે?',
      pieces: 'નંગ',
      box: 'બોક્સ',
      pack: 'પેક',
      set: 'સેટ',
      dozen: 'ડઝન',
      kg: 'કિલો',
      pcsPerUnit: 'એક એકમમાં નંગ',
      pcsPerUnitPlaceholder: 'દા.ત. 1 બોક્સમાં 50 પેન',
      pcsPerUnitHint: 'એકમાં કેટલા નંગ છે',
      stockDisplayBoxes: 'બોક્સ',
      stockDisplayPacks: 'પેક',
      stockDisplaySets: 'સેટ',
      stockDisplayDozens: 'ડઝન',
      stockDisplayRemaining: 'બાકી',
      sellingInPieces: 'નંગમાં વેચાણ',
      pricePerPiece: 'એક નંગની કિંમત',
      availablePcs: 'ઉપલબ્ધ',
      insufficientStock: 'પૂરતો સ્ટોક નથી! ઉપલબ્ધ:',

      // Categories
      manageCategories: 'કેટેગરી મેનેજ કરો',
      newCategoryPlaceholder: 'નવી કેટેગરીનું નામ...',
      add: 'ઉમેરો',
      categoryAdded: 'કેટેગરી ઉમેરાઈ!',
      categoryRemoved: 'કેટેગરી દૂર થઈ!',
      categoryExists: 'કેટેગરી પહેલેથી છે',

      // Inventory
      invSubtitle: 'સ્ટોક ચકાસો અને અપડેટ કરો',
      searchInventory: 'ઇન્વેન્ટરી શોધો...',
      allItems: 'બધી આઇટમ',
      filterLow: 'ઓછો સ્ટોક',
      filterOut: 'સ્ટોક ખતમ',
      filterOk: 'સ્ટોકમાં',
      alerts: 'ચેતવણી',
      product: 'પ્રોડક્ટ',
      minStock: 'ઓછામાં ઓછો',
      action: 'ક્રિયા',
      restock: 'રીસ્ટોક',
      noInventoryTitle: 'કોઈ આઇટમ નથી',
      noInventoryDesc: 'પહેલા પ્રોડક્ટ ઉમેરો.',
      restockPrompt: 'કેટલા ઉમેરવા?',
      restocked: 'રીસ્ટોક થયું!',
      invalidNumber: 'યોગ્ય નંબર દાખલ કરો',

      // Daily Tracker
      dailySubtitle: 'દૈનિક વેચાણ અને ખર્ચ નોંધો',
      goToToday: 'આજે',
      revenueLabel: 'આવક',
      costsExpenses: 'ખર્ચ',
      netProfit: 'ચોખ્ખો નફો',
      sales: 'વેચાણ',
      addSale: 'વેચાણ ઉમેરો',
      expenses: 'ખર્ચ',
      addExpense: 'ખર્ચ ઉમેરો',
      noSales: 'કોઈ વેચાણ નોંધાયું નથી',
      noExpenses: 'કોઈ ખર્ચ નોંધાયો નથી',
      recordSaleTitle: 'વેચાણ નોંધો',
      selectProduct: 'પ્રોડક્ટ પસંદ કરો',
      quantity: 'જથ્થો',
      price: 'કિંમત',
      total: 'કુલ',
      recordSaleBtn: 'વેચાણ નોંધો',
      addExpenseTitle: 'ખર્ચ ઉમેરો',
      description: 'વર્ણન',
      descPlaceholder: 'દા.ત. વીજળી બિલ',
      amount: 'રકમ',
      expenseCategory: 'કેટેગરી',
      general: 'સામાન્ય',
      rent: 'ભાડું',
      utilities: 'યુટિલિટી',
      stockPurchase: 'સ્ટોક ખરીદી',
      transport: 'ટ્રાન્સપોર્ટ',
      salary: 'પગાર',
      other: 'અન્ય',
      addExpenseBtn: 'ખર્ચ ઉમેરો',
      saleRecorded: 'વેચાણ નોંધાયું!',
      expenseRecorded: 'ખર્ચ નોંધાયો!',
      selectProductError: 'કૃપા કરી પ્રોડક્ટ પસંદ કરો',
      qtyError: 'જથ્થો ૦ થી વધુ હોવો જોઈએ',
      enterDescription: 'કૃપા કરી વર્ણન દાખલ કરો',
      amountError: 'રકમ ૦ થી વધુ હોવી જોઈએ',

      // Calendar
      viewCalendar: 'કૅલેન્ડર જુઓ',
      profit: 'નફો',
      loss: 'ખોટ',
      noData: 'કોઈ ડેટા નથી',
      openDay: 'આ દિવસ ખોલો',

      // EOD Report
      eodReport: 'દિવસનો રિપોર્ટ',
      eodReportTitle: 'દિવસનો રિપોર્ટ',
      eodFinancialSummary: '💰 નાણાકીય સારાંશ',
      eodCostOfGoods: 'માલનો ખર્ચ',
      eodItemsSold: 'વેચાયેલી વસ્તુઓ',
      eodPieces: 'નંગ',
      eodTransactions: 'વ્યવહાર',
      eodSalesBreakdown: 'વેચાણની વિગત',
      eodExpensesBreakdown: 'ખર્ચની વિગત',
      eodInventoryStatus: 'ઇન્વેન્ટરી સ્થિતિ',
      eodGeneratedAt: 'રિપોર્ટ બનાવ્યો',
      printReport: 'રિપોર્ટ પ્રિન્ટ કરો',
      close: 'બંધ કરો',

      // Confirm
      confirmTitle: 'શું તમે ખાતરી છો?',
      confirmDelete: 'ડિલીટ',

      // Data
      exportSuccess: 'ડેટા એક્સપોર્ટ થયો!',
      importSuccess: 'ડેટા ઇમ્પોર્ટ થયો! રિફ્રેશ થાય છે...',
      importError: 'ઇમ્પોર્ટ નિષ્ફળ. ફાઇલ ચકાસો.',

      // Sync
      online: 'ઑનલાઇન',
      offline: 'ઑફલાઇન',

      // Help
      helpTitle: 'મદદ અને માર્ગદર્શિકા',
      helpSubtitle: 'આ એપ કેવી રીતે વાપરવી તે શીખો',
      helpWelcome: 'MistryStudio માં આપનું સ્વાગત છે!',
      helpWelcomeDesc: 'આ એપ તમારી સ્ટેશનરી દુકાન મેનેજ કરવામાં મદદ કરે છે. દરેક વિભાગ શું કરે છે તે અહીં છે:',
      helpDashboardTitle: '📊 ડેશબોર્ડ',
      helpDashboardDesc: 'તમારી દુકાનનો ઝડપી સારાંશ જુઓ — કુલ પ્રોડક્ટ્સ, સ્ટોકની કિંમત, આજનું વેચાણ, અને નફો. ચાર્ટ્સ છેલ્લા ૭ દિવસનું પ્રદર્શન બતાવે છે.',
      helpProductsTitle: '📦 પ્રોડક્ટ્સ',
      helpProductsDesc: 'તમારી દુકાનની બધી વસ્તુઓ અહીં ઉમેરો. દરેક પ્રોડક્ટ માટે નામ, કેટેગરી, ખરીદ કિંમત, વેચાણ કિંમત, અને સ્ટોકનો જથ્થો દાખલ કરો. તમે કોઈપણ પ્રોડક્ટ એડિટ કે ડિલીટ કરી શકો છો.',
      helpInventoryTitle: '🏪 ઇન્વેન્ટરી',
      helpInventoryDesc: 'ચકાસો કે કઈ વસ્તુઓ ઓછી થઈ રહી છે. + અને − બટનથી ઝડપથી સ્ટોક અપડેટ કરો. "રીસ્ટોક" પર ક્લિક કરીને મોટી માત્રા ઉમેરો.',
      helpDailyTitle: '📅 દૈનિક ટ્રેકર',
      helpDailyDesc: 'દરેક દિવસનું વેચાણ અને ખર્ચ નોંધો. વેચાયેલી પ્રોડક્ટ પસંદ કરો, જથ્થો દાખલ કરો, અને એપ આપમેળે આવક અને નફો ગણે છે. ભાડું, વીજળી વગેરે ખર્ચ પણ નોંધો.',
      helpCategoriesTitle: '🏷️ કેટેગરી',
      helpCategoriesDesc: 'પ્રોડક્ટ્સ પર જાઓ → "કેટેગરી" બટન પર ક્લિક કરો. તમે ગમે તે કેટેગરી બનાવી શકો છો જેમ કે પેન, નોટબુક, ફાઇલ વગેરે.',
      helpExportTitle: '💾 એક્સપોર્ટ / ઇમ્પોર્ટ',
      helpExportDesc: 'બેકઅપ ફાઇલ ડાઉનલોડ કરવા "ડેટા એક્સપોર્ટ" ક્લિક કરો. બેકઅપમાંથી રિસ્ટોર કરવા "ડેટા ઇમ્પોર્ટ" ક્લિક કરો. હંમેશા બેકઅપ રાખો!',
      helpTip: '💡 ટિપ: પહેલા કેટેગરી ઉમેરો, પછી પ્રોડક્ટ ઉમેરો, અને પછી દૈનિક વેચાણ નોંધો!',
    }
  },

  t(key) {
    return this.translations[this.current]?.[key] || this.translations['en']?.[key] || key;
  },

  setLanguage(lang) {
    this.current = lang;
    localStorage.setItem('ms_lang', lang);
    this.applyAll();
  },

  toggle() {
    this.setLanguage(this.current === 'en' ? 'gu' : 'en');
  },

  applyAll() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });

    // Update language toggle button
    const btn = document.getElementById('langToggle');
    if (btn) {
      btn.textContent = this.current === 'en' ? 'ગુજ' : 'EN';
      btn.title = this.current === 'en' ? 'ગુજરાતીમાં બદલો' : 'Switch to English';
    }

    // Re-render dynamic content
    if (typeof Products !== 'undefined') {
      Products.render();
      Products.renderCategoryFilter();
    }
    if (typeof Inventory !== 'undefined') Inventory.render();
    if (typeof Daily !== 'undefined') Daily.render();
    if (typeof Dashboard !== 'undefined') Dashboard.refresh();
  }
};
