// Nourish Nutrition & Macro Tracker - Core Application Logic
// Features: Dynamic portion scaling, Library & Staples, Live Internet Barcode Lookup (Open Food Facts),
// Canvas-downscaled Nutrition Label OCR & Multimodal Gemini Vision AI.

const DEFAULT_TARGETS = {
  calories: 2000,
  protein: 150,
  carbs: 204,
  fat: 65,
  geminiApiKey: '',
  milkType: 'whole'
};

const INITIAL_LIBRARY = [
  {
    id: 'lib_shake_optA_whole',
    name: 'Big Morning Shake (Option A - Whole Milk)',
    basePortion: '500ml Fairlife Whole + 2 scoops Nutricost Whey',
    baseCalories: 573,
    baseProtein: 87,
    baseCarbs: 14,
    baseFat: 20,
    photo: null,
    isCustom: false
  },
  {
    id: 'lib_shake_optA_skim',
    name: 'Big Morning Shake (Option A - Fat-Free)',
    basePortion: '500ml Fairlife Fat-Free + 2 scoops Nutricost Whey',
    baseCalories: 420,
    baseProtein: 86,
    baseCarbs: 14,
    baseFat: 1,
    photo: null,
    isCustom: false
  },
  {
    id: 'lib_shake_optB_whole',
    name: 'Split Shake (Option B - Whole Milk)',
    basePortion: '250ml Fairlife Whole + 1 scoop Nutricost Whey',
    baseCalories: 286,
    baseProtein: 43.5,
    baseCarbs: 7,
    baseFat: 10,
    photo: null,
    isCustom: false
  },
  {
    id: 'lib_shake_optB_skim',
    name: 'Split Shake (Option B - Fat-Free)',
    basePortion: '250ml Fairlife Fat-Free + 1 scoop Nutricost Whey',
    baseCalories: 210,
    baseProtein: 43,
    baseCarbs: 7,
    baseFat: 0.5,
    photo: null,
    isCustom: false
  },
  {
    id: 'lib_nutricost_1scoop',
    name: 'Nutricost Whey Isolate (1 scoop)',
    basePortion: '1 scoop (30g powder in water)',
    baseCalories: 130,
    baseProtein: 30,
    baseCarbs: 1,
    baseFat: 0.5,
    photo: null,
    isCustom: false
  },
  {
    id: 'lib_fairlife_whole_250',
    name: 'Fairlife Whole Milk (250 ml)',
    basePortion: '1 glass (250 ml)',
    baseCalories: 156,
    baseProtein: 13.5,
    baseCarbs: 6,
    baseFat: 9.5,
    photo: null,
    isCustom: false
  },
  {
    id: 'lib_fairlife_skim_250',
    name: 'Fairlife Fat-Free Milk (250 ml)',
    basePortion: '1 glass (250 ml)',
    baseCalories: 80,
    baseProtein: 13,
    baseCarbs: 6,
    baseFat: 0,
    photo: null,
    isCustom: false
  },
  {
    id: 'lib_eggs_2',
    name: 'Boiled Eggs (2 Large)',
    basePortion: '2 whole eggs',
    baseCalories: 144,
    baseProtein: 12,
    baseCarbs: 0.8,
    baseFat: 10,
    photo: null,
    isCustom: false
  },
  {
    id: 'lib_rice_1cup',
    name: 'Cooked Basmati / White Rice',
    basePortion: '1 medium bowl (150g)',
    baseCalories: 195,
    baseProtein: 4,
    baseCarbs: 43,
    baseFat: 0.4,
    photo: null,
    isCustom: false
  },
  {
    id: 'lib_dal_1bowl',
    name: 'Cooked Dal / Lentil Curry',
    basePortion: '1 medium bowl (200g)',
    baseCalories: 160,
    baseProtein: 9,
    baseCarbs: 26,
    baseFat: 3,
    photo: null,
    isCustom: false
  },
  {
    id: 'lib_roti_2',
    name: 'Chapati / Whole Wheat Roti',
    basePortion: '2 pieces',
    baseCalories: 200,
    baseProtein: 6,
    baseCarbs: 40,
    baseFat: 2,
    photo: null,
    isCustom: false
  },
  {
    id: 'lib_chicken_breast_100',
    name: 'Cooked Chicken Breast',
    basePortion: '100g cooked',
    baseCalories: 165,
    baseProtein: 31,
    baseCarbs: 0,
    baseFat: 3.6,
    photo: null,
    isCustom: false
  },
  {
    id: 'lib_fish_fillet_100',
    name: 'Cooked Fish Fillet',
    basePortion: '100g cooked',
    baseCalories: 120,
    baseProtein: 22,
    baseCarbs: 0,
    baseFat: 3,
    photo: null,
    isCustom: false
  },
  {
    id: 'lib_mixed_veggies',
    name: 'Mixed Vegetables / Sabzi',
    basePortion: '1 cup cooked / salad',
    baseCalories: 65,
    baseProtein: 2.5,
    baseCarbs: 12,
    baseFat: 1.5,
    photo: null,
    isCustom: false
  },
  {
    id: 'lib_apple_banana',
    name: 'Fresh Apple / Banana',
    basePortion: '1 medium fruit',
    baseCalories: 95,
    baseProtein: 1,
    baseCarbs: 25,
    baseFat: 0.3,
    photo: null,
    isCustom: false
  }
];

class NourishApp {
  constructor() {
    this.state = {
      currentDate: this.formatDate(new Date()),
      settings: this.loadSettings(),
      entries: this.loadEntries(),
      library: this.loadLibrary(),
      bodyMetrics: this.loadBodyMetrics(),
      currentScanMode: 'barcode', // 'barcode', 'label', 'food'
      selectedImageBase64: null,
      selectedLibraryFood: null,
      activePortionMultiplier: 1.0,
      barcodeReader: null,
      isBarcodeScanning: false,
      weeklyChart: null,
      waistChart: null
    };

    this.init();
  }

  // ================= STORAGE =================
  loadSettings() {
    try {
      const stored = localStorage.getItem('nourish_settings');
      return stored ? { ...DEFAULT_TARGETS, ...JSON.parse(stored) } : { ...DEFAULT_TARGETS };
    } catch (e) {
      return { ...DEFAULT_TARGETS };
    }
  }

  saveSettings() {
    localStorage.setItem('nourish_settings', JSON.stringify(this.state.settings));
  }

  loadEntries() {
    try {
      const stored = localStorage.getItem('nourish_entries');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  saveEntries() {
    localStorage.setItem('nourish_entries', JSON.stringify(this.state.entries));
  }

  loadLibrary() {
    try {
      const stored = localStorage.getItem('nourish_library');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return [...INITIAL_LIBRARY];
    } catch (e) {
      return [...INITIAL_LIBRARY];
    }
  }

  saveLibrary() {
    localStorage.setItem('nourish_library', JSON.stringify(this.state.library));
  }

  loadBodyMetrics() {
    try {
      const stored = localStorage.getItem('nourish_body_metrics');
      if (stored) return JSON.parse(stored);
      return [
        { date: this.offsetDateString(-14), weight: 75.8, waist: 34.0 },
        { date: this.offsetDateString(-7), weight: 75.3, waist: 33.75 },
        { date: this.formatDate(new Date()), weight: 75.0, waist: 33.5 }
      ];
    } catch (e) {
      return [];
    }
  }

  saveBodyMetrics() {
    localStorage.setItem('nourish_body_metrics', JSON.stringify(this.state.bodyMetrics));
  }

  formatDate(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  offsetDateString(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return this.formatDate(d);
  }

  // ================= INITIALIZATION =================
  init() {
    this.renderHeaderAndDate();
    this.renderTargetsInUI();
    this.renderLibraryUI();
    this.populateLibraryDropdown();
    this.renderDayLog();
    this.setupEventListeners();
    this.registerServiceWorker();

    if (this.state.entries.length === 0) {
      this.loadSampleDay();
    } else {
      this.updateDailyScorecard();
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
    }
  }

  // ================= EVENT LISTENERS =================
  setupEventListeners() {
    // Navigation Tabs
    document.querySelectorAll('[data-tab]').forEach((tabBtn) => {
      tabBtn.addEventListener('click', () => {
        this.switchTab(tabBtn.getAttribute('data-tab'));
      });
    });

    // Date Navigation
    document.getElementById('prevDateBtn').addEventListener('click', () => this.shiftDate(-1));
    document.getElementById('nextDateBtn').addEventListener('click', () => this.shiftDate(1));
    document.getElementById('todayJumpBtn').addEventListener('click', () => {
      this.state.currentDate = this.formatDate(new Date());
      this.renderHeaderAndDate();
      this.renderDayLog();
      this.updateDailyScorecard();
    });

    // Option A & Option B Plans
    document.getElementById('viewOptionABtn').addEventListener('click', () => this.togglePlanView('A'));
    document.getElementById('viewOptionBBtn').addEventListener('click', () => this.togglePlanView('B'));
    document.getElementById('applyOptionAToTodayBtn').addEventListener('click', () => this.applyOptionTemplate('A'));
    document.getElementById('applyOptionBToTodayBtn').addEventListener('click', () => this.applyOptionTemplate('B'));

    // Add Food Modal Controls
    document.getElementById('openAddModalBtn').addEventListener('click', () => this.openAddFoodModal());
    document.getElementById('closeAddFoodModalBtn').addEventListener('click', () => this.closeAddFoodModal());
    document.getElementById('cancelCustomFoodBtn').addEventListener('click', () => this.closeAddFoodModal());
    document.getElementById('addModeLibraryBtn').addEventListener('click', () => this.setAddModalMode('library'));
    document.getElementById('addModeCustomBtn').addEventListener('click', () => this.setAddModalMode('custom'));

    // Library Selector in Add Modal
    document.getElementById('libraryFoodSelect').addEventListener('change', (e) => {
      const selectedId = e.target.value;
      this.selectLibraryFoodById(selectedId);
    });

    // Portion Multiplier Pills & Input
    document.querySelectorAll('.portion-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        const mult = parseFloat(pill.getAttribute('data-mult'));
        this.setPortionMultiplier(mult);
      });
    });

    document.getElementById('portionMultiplierInput').addEventListener('input', (e) => {
      const mult = parseFloat(e.target.value) || 1.0;
      this.setPortionMultiplier(mult, false);
    });

    document.getElementById('confirmAddFromLibraryBtn').addEventListener('click', () => {
      this.addSelectedLibraryFoodToDiary();
    });

    document.getElementById('customFoodEntryForm').addEventListener('submit', (e) => {
      this.handleCustomFoodSubmit(e);
    });

    // Library Tab Actions
    document.getElementById('openLibraryBtn').addEventListener('click', () => this.switchTab('tabLibrary'));
    document.getElementById('addNewLibraryFoodBtn').addEventListener('click', () => {
      this.openAddFoodModal('general', 'custom');
    });
    document.getElementById('librarySearchInput').addEventListener('input', (e) => {
      this.renderLibraryUI(e.target.value);
    });

    // Quick Log Morning Shake
    document.getElementById('quickLogMorningShakeBtn').addEventListener('click', () => {
      this.logFoodFromLibrary('lib_shake_optA_whole', 1.0, 'breakfast');
    });

    // Scanner Modal Controls
    const openScanHandler = () => this.openScanModal();
    document.getElementById('openScanModalBtn').addEventListener('click', openScanHandler);
    document.getElementById('headerScanBtn').addEventListener('click', openScanHandler);
    document.getElementById('closeScanModalBtn').addEventListener('click', () => this.closeScanModal());

    document.getElementById('scanModeBarcodeBtn').addEventListener('click', () => this.setScanMode('barcode'));
    document.getElementById('scanModeLabelBtn').addEventListener('click', () => this.setScanMode('label'));
    document.getElementById('scanModeFoodBtn').addEventListener('click', () => this.setScanMode('food'));

    document.getElementById('startLiveBarcodeCamBtn').addEventListener('click', () => this.toggleLiveBarcodeScanner());
    document.getElementById('barcodePhotoInput').addEventListener('change', (e) => this.handleBarcodePhotoUpload(e));
    document.getElementById('lookupBarcodeBtn').addEventListener('click', () => {
      const code = document.getElementById('manualBarcodeInput').value.trim();
      if (code) this.lookupBarcodeOnline(code);
    });

    document.getElementById('cameraPhotoInput').addEventListener('change', (e) => this.handlePhotoSelected(e));
    document.getElementById('retakePhotoBtn').addEventListener('click', () => this.resetPhotoScanner());
    document.getElementById('saveDetectedFoodBtn').addEventListener('click', () => this.saveDetectedFoodToDiary());

    // Settings
    document.getElementById('openSettingsBtn').addEventListener('click', () => this.switchTab('tabSettings'));
    document.getElementById('saveTargetsBtn').addEventListener('click', () => this.saveTargetsFromInputs());
    document.getElementById('saveApiKeyBtn').addEventListener('click', () => this.saveGeminiApiKey());
    document.getElementById('saveBodyMetricBtn').addEventListener('click', () => this.saveBodyMetricToday());

    // Backup & Restore
    document.getElementById('exportDataBtn').addEventListener('click', () => this.exportBackupData());
    document.getElementById('importDataInput').addEventListener('change', (e) => this.importBackupData(e));
    document.getElementById('loadSampleDataBtn').addEventListener('click', () => this.loadSampleDay());
    document.getElementById('clearAllDataBtn').addEventListener('click', () => this.clearAllData());
  }

  // ================= TAB MANAGEMENT =================
  switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach((el) => el.classList.add('hidden'));
    const target = document.getElementById(tabId);
    if (target) target.classList.remove('hidden');

    document.querySelectorAll('[data-tab]').forEach((btn) => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active', 'border-emerald-500', 'text-emerald-400');
        btn.classList.remove('border-transparent', 'text-slate-400');
      } else {
        btn.classList.remove('active', 'border-emerald-500', 'text-emerald-400');
        btn.classList.add('border-transparent', 'text-slate-400');
      }
    });

    if (tabId === 'tabAnalytics') this.renderCharts();
    if (tabId === 'tabLibrary') this.renderLibraryUI();

    if (window.lucide) window.lucide.createIcons();
  }

  // ================= DATE CONTROL =================
  shiftDate(deltaDays) {
    const [y, m, d] = this.state.currentDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + deltaDays);
    this.state.currentDate = this.formatDate(dateObj);
    this.renderHeaderAndDate();
    this.renderDayLog();
    this.updateDailyScorecard();
  }

  renderHeaderAndDate() {
    const todayStr = this.formatDate(new Date());
    const displayEl = document.getElementById('currentDateDisplay');
    const [y, m, d] = this.state.currentDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const dateFormatted = dateObj.toLocaleDateString('en-US', options);

    displayEl.textContent = this.state.currentDate === todayStr ? `Today (${dateFormatted})` : dateFormatted;
  }

  // ================= SCORECARD & MACROS =================
  updateDailyScorecard() {
    const currentEntries = this.state.entries.filter((item) => item.date === this.state.currentDate);

    const totals = currentEntries.reduce(
      (acc, item) => {
        acc.calories += Number(item.calories) || 0;
        acc.protein += Number(item.protein) || 0;
        acc.carbs += Number(item.carbs) || 0;
        acc.fat += Number(item.fat) || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const targetCal = this.state.settings.calories;
    const targetProt = this.state.settings.protein;
    const targetCarbs = this.state.settings.carbs;
    const targetFat = this.state.settings.fat;

    const remainingCal = targetCal - totals.calories;
    const calRemainingEl = document.getElementById('caloriesRemainingText');
    calRemainingEl.textContent = remainingCal >= 0 ? remainingCal.toLocaleString() : `+${Math.abs(remainingCal).toLocaleString()}`;
    if (remainingCal < 0) {
      calRemainingEl.classList.add('text-amber-400');
    } else {
      calRemainingEl.classList.remove('text-amber-400');
    }

    document.getElementById('caloriesConsumedText').textContent = Math.round(totals.calories).toLocaleString();

    // Protein
    const protCurrent = Math.round(totals.protein * 10) / 10;
    const protPct = Math.min(100, Math.round((protCurrent / targetProt) * 100));
    document.getElementById('proteinCurrentText').textContent = protCurrent;
    document.getElementById('proteinPercentText').textContent = `${protPct}%`;
    document.getElementById('proteinProgressBar').style.width = `${protPct}%`;
    const protLeft = Math.max(0, Math.round(targetProt - protCurrent));
    document.getElementById('proteinGramsLeft').textContent = protLeft > 0 ? `${protLeft}g left` : 'Target Met!';

    const protBadge = document.getElementById('proteinStatusBadge');
    if (protCurrent >= 140) {
      protBadge.textContent = 'Protein Goal: Recomp Target Met! 🔥';
      protBadge.className = 'text-xs font-bold text-emerald-400';
    } else {
      protBadge.textContent = `Protein Goal: ${protPct}% (${protCurrent}g / ${targetProt}g)`;
      protBadge.className = 'text-xs font-semibold text-white';
    }

    // Carbs
    const carbsCurrent = Math.round(totals.carbs * 10) / 10;
    const carbsPct = Math.min(100, Math.round((carbsCurrent / targetCarbs) * 100));
    document.getElementById('carbsCurrentText').textContent = carbsCurrent;
    document.getElementById('carbsPercentText').textContent = `${carbsPct}%`;
    document.getElementById('carbsProgressBar').style.width = `${carbsPct}%`;
    const carbsLeft = Math.max(0, Math.round(targetCarbs - carbsCurrent));
    document.getElementById('carbsGramsLeft').textContent = carbsLeft > 0 ? `${carbsLeft}g left` : 'Done';

    // Fat
    const fatCurrent = Math.round(totals.fat * 10) / 10;
    const fatPct = Math.min(100, Math.round((fatCurrent / targetFat) * 100));
    document.getElementById('fatCurrentText').textContent = fatCurrent;
    document.getElementById('fatPercentText').textContent = `${fatPct}%`;
    document.getElementById('fatProgressBar').style.width = `${fatPct}%`;
    const fatLeft = Math.max(0, Math.round(targetFat - fatCurrent));
    document.getElementById('fatGramsLeft').textContent = fatLeft > 0 ? `${fatLeft}g left` : 'Done';

    // Ratios
    const calFromProt = totals.protein * 4;
    const calFromCarb = totals.carbs * 4;
    const calFromFat = totals.fat * 9;
    const totalMacroCal = calFromProt + calFromCarb + calFromFat || 1;

    const actualProtPct = Math.round((calFromProt / totalMacroCal) * 100);
    const actualCarbPct = Math.round((calFromCarb / totalMacroCal) * 100);
    const actualFatPct = Math.max(0, 100 - actualProtPct - actualCarbPct);

    document.getElementById('ratioBarProtein').style.width = `${actualProtPct}%`;
    document.getElementById('ratioBarCarbs').style.width = `${actualCarbPct}%`;
    document.getElementById('ratioBarFat').style.width = `${actualFatPct}%`;

    document.getElementById('macroRatioSummary').textContent =
      totals.calories > 0
        ? `Actual: ${actualProtPct}% P · ${actualCarbPct}% C · ${actualFatPct}% F (Target: 30% · 41% · 29%)`
        : `Target: 30% P · 41% C · 29% F`;
  }

  renderTargetsInUI() {
    document.getElementById('targetCaloriesLabel').textContent = this.state.settings.calories;
    document.getElementById('targetProteinLabel').textContent = this.state.settings.protein;
    document.getElementById('targetCarbsLabel').textContent = this.state.settings.carbs;
    document.getElementById('targetFatLabel').textContent = this.state.settings.fat;

    document.getElementById('settingCalories').value = this.state.settings.calories;
    document.getElementById('settingProtein').value = this.state.settings.protein;
    document.getElementById('settingCarbs').value = this.state.settings.carbs;
    document.getElementById('settingFat').value = this.state.settings.fat;
    document.getElementById('geminiApiKeyInput').value = this.state.settings.geminiApiKey || '';
  }

  // ================= DAILY DIARY RENDERING =================
  renderDayLog() {
    const container = document.getElementById('mealsContainer');
    container.innerHTML = '';

    const dayEntries = this.state.entries.filter((item) => item.date === this.state.currentDate);

    // Categories including "General Food / Anytime"
    const mealCategories = [
      { id: 'breakfast', title: 'Breakfast / Morning', icon: 'coffee', defaultTime: '8:00 AM' },
      { id: 'lunch', title: 'Lunch', icon: 'sun', defaultTime: '1:00 PM' },
      { id: 'snack', title: 'Afternoon Snack / Pre-Workout', icon: 'apple', defaultTime: '4:30 PM' },
      { id: 'dinner', title: 'Dinner / Post-Workout', icon: 'moon', defaultTime: '8:00 PM' },
      { id: 'general', title: 'General Food / Anytime (No Category)', icon: 'utensils', defaultTime: 'Anytime' }
    ];

    if (dayEntries.length === 0) {
      container.innerHTML = `
        <div class="glass-panel p-8 text-center space-y-3">
          <div class="w-12 h-12 mx-auto rounded-full bg-white/5 flex items-center justify-center text-slate-400">
            <i data-lucide="utensils" class="w-6 h-6"></i>
          </div>
          <h4 class="text-sm font-bold text-white">No food logged for today yet</h4>
          <p class="text-xs text-slate-400 max-w-sm mx-auto">
            Choose from your saved food library, scan a barcode, or snap a photo of your meal!
          </p>
          <div class="flex justify-center gap-2 pt-2 flex-wrap">
            <button onclick="app.logFoodFromLibrary('lib_shake_optA_whole', 1.0, 'breakfast')" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow">
              + Morning Shake (87g Protein)
            </button>
            <button onclick="app.applyOptionTemplate('B')" class="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold">
              Apply Option B Plan
            </button>
          </div>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    mealCategories.forEach((cat) => {
      const itemsInMeal = dayEntries.filter((item) => (item.meal || 'general') === cat.id);
      if (cat.id === 'general' && itemsInMeal.length === 0) {
        // Only show General Food section if there are uncategorized items or on request
        return;
      }

      const mealTotals = itemsInMeal.reduce(
        (acc, i) => {
          acc.calories += Number(i.calories) || 0;
          acc.protein += Number(i.protein) || 0;
          return acc;
        },
        { calories: 0, protein: 0 }
      );

      const sectionEl = document.createElement('div');
      sectionEl.className = 'glass-panel p-3.5 sm:p-4 space-y-2.5';

      sectionEl.innerHTML = `
        <div class="flex items-center justify-between pb-2 border-b border-white/5">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-emerald-400">
              <i data-lucide="${cat.icon}" class="w-4 h-4"></i>
            </div>
            <div>
              <span class="text-xs font-bold text-white">${cat.title}</span>
              <span class="text-[10px] text-slate-400 ml-1.5">${cat.defaultTime}</span>
            </div>
          </div>
          <div class="text-right">
            <span class="text-xs font-bold text-emerald-400">${Math.round(mealTotals.protein)}g P</span>
            <span class="text-xs text-slate-400 mx-1">·</span>
            <span class="text-xs font-semibold text-white">${Math.round(mealTotals.calories)} kcal</span>
          </div>
        </div>

        <div class="space-y-2" id="mealItems_${cat.id}">
          ${
            itemsInMeal.length === 0
              ? `<div class="text-xs text-slate-500 py-1 italic flex items-center justify-between">
                  <span>Nothing logged yet</span>
                  <button onclick="app.openAddFoodModal('${cat.id}')" class="text-[11px] text-emerald-400 hover:underline font-medium">+ Add item</button>
                </div>`
              : itemsInMeal
                  .map(
                    (item) => `
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                <div class="flex items-center gap-3">
                  ${
                    item.photo
                      ? `<img src="${item.photo}" class="w-10 h-10 rounded-lg object-cover border border-white/10" />`
                      : `<div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          ${item.protein ? Math.round(item.protein) : '0'}g
                        </div>`
                  }
                  <div>
                    <div class="text-xs font-semibold text-white">${this.escapeHtml(item.name)}</div>
                    <div class="text-[10px] text-slate-400">
                      ${item.portion ? `<span class="text-slate-300">${this.escapeHtml(item.portion)}</span> • ` : ''}
                      <span class="text-emerald-400 font-semibold">${item.protein || 0}g P</span> | 
                      <span>${item.carbs || 0}g C</span> | 
                      <span>${item.fat || 0}g F</span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-slate-200">${Math.round(item.calories) || 0} kcal</span>
                  <button onclick="app.deleteEntry('${item.id}')" class="p-1 rounded text-slate-500 hover:text-red-400 transition-colors opacity-70 group-hover:opacity-100" title="Delete">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>
            `
                  )
                  .join('')
          }
        </div>
      `;

      container.appendChild(sectionEl);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  // ================= MY FOOD LIBRARY & STAPLES =================
  renderLibraryUI(searchQuery = '') {
    const container = document.getElementById('libraryCardsContainer');
    if (!container) return;
    container.innerHTML = '';

    const q = searchQuery.toLowerCase().trim();
    const filtered = this.state.library.filter((item) => {
      if (!q) return true;
      return item.name.toLowerCase().includes(q) || (item.basePortion && item.basePortion.toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-8 text-center text-xs text-slate-400">
          No foods match "${this.escapeHtml(searchQuery)}". Tap "+ Add Food to Library" to save a new one!
        </div>
      `;
      return;
    }

    filtered.forEach((food) => {
      const card = document.createElement('div');
      card.className = 'glass-panel p-3 flex items-center justify-between hover:bg-white/10 transition-all border border-white/10 group';

      card.innerHTML = `
        <div class="flex items-center gap-3">
          ${
            food.photo
              ? `<img src="${food.photo}" class="w-12 h-12 rounded-xl object-cover border border-white/10" />`
              : `<div class="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  ${Math.round(food.baseProtein)}g P
                </div>`
          }
          <div>
            <div class="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">${this.escapeHtml(food.name)}</div>
            <div class="text-[10px] text-slate-400">${this.escapeHtml(food.basePortion || '1 serving')}</div>
            <div class="text-[10px] font-semibold text-emerald-400 mt-0.5">
              ${food.baseProtein}g P · ${food.baseCalories} kcal · ${food.baseCarbs}g C · ${food.baseFat}g F
            </div>
          </div>
        </div>

        <div class="flex items-center gap-1.5">
          <button onclick="app.openAddFoodModalWithItem('${food.id}')" class="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow">
            Log Portion
          </button>
          ${
            food.isCustom
              ? `<button onclick="app.deleteLibraryItem('${food.id}')" class="p-1.5 rounded-lg text-slate-500 hover:text-red-400 opacity-60 group-hover:opacity-100" title="Delete from Library">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>`
              : ''
          }
        </div>
      `;

      container.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  populateLibraryDropdown() {
    const select = document.getElementById('libraryFoodSelect');
    if (!select) return;
    select.innerHTML = '';

    this.state.library.forEach((item) => {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = `${item.name} (${item.baseProtein}g P • ${item.baseCalories} kcal)`;
      select.appendChild(opt);
    });

    if (this.state.library.length > 0) {
      this.selectLibraryFoodById(this.state.library[0].id);
    }
  }

  selectLibraryFoodById(id) {
    const item = this.state.library.find((i) => i.id === id);
    if (!item) return;

    this.state.selectedLibraryFood = item;

    document.getElementById('selectedLibName').textContent = item.name;
    document.getElementById('selectedLibBasePortion').textContent = `Base: ${item.basePortion || '1 serving'}`;
    document.getElementById('selectedLibBaseKcal').textContent = `${item.baseCalories} kcal`;
    document.getElementById('selectedLibBaseProt').textContent = `${item.baseProtein}g Protein`;

    const imgBox = document.getElementById('selectedLibImgBox');
    if (item.photo) {
      imgBox.innerHTML = `<img src="${item.photo}" class="w-full h-full object-cover" />`;
    } else {
      imgBox.innerHTML = `<span class="text-xs font-bold text-emerald-400">${Math.round(item.baseProtein)}g</span>`;
    }

    this.recalculateScaledMacros();
  }

  setPortionMultiplier(multiplier, updateInput = true) {
    this.state.activePortionMultiplier = Math.max(0.1, multiplier);

    if (updateInput) {
      document.getElementById('portionMultiplierInput').value = multiplier;
    }

    // Update active pill button
    document.querySelectorAll('.portion-pill').forEach((pill) => {
      const pMult = parseFloat(pill.getAttribute('data-mult'));
      if (Math.abs(pMult - multiplier) < 0.05) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    document.getElementById('calculatedPortionLabel').textContent = `${multiplier}x portion`;
    this.recalculateScaledMacros();
  }

  recalculateScaledMacros() {
    const food = this.state.selectedLibraryFood;
    if (!food) return;

    const mult = this.state.activePortionMultiplier;

    const scaledCal = Math.round(food.baseCalories * mult);
    const scaledProt = Math.round(food.baseProtein * mult * 10) / 10;
    const scaledCarb = Math.round(food.baseCarbs * mult * 10) / 10;
    const scaledFat = Math.round(food.baseFat * mult * 10) / 10;

    document.getElementById('scaledCaloriesText').textContent = `${scaledCal} kcal`;
    document.getElementById('scaledProteinText').textContent = `${scaledProt}g`;
    document.getElementById('scaledCarbsText').textContent = `${scaledCarb}g`;
    document.getElementById('scaledFatText').textContent = `${scaledFat}g`;
  }

  addSelectedLibraryFoodToDiary() {
    const food = this.state.selectedLibraryFood;
    if (!food) return;

    const mult = this.state.activePortionMultiplier;
    const meal = document.getElementById('libraryMealSelect').value;

    const scaledCal = Math.round(food.baseCalories * mult);
    const scaledProt = Math.round(food.baseProtein * mult * 10) / 10;
    const scaledCarb = Math.round(food.baseCarbs * mult * 10) / 10;
    const scaledFat = Math.round(food.baseFat * mult * 10) / 10;

    const portionLabel = mult === 1.0 ? food.basePortion : `${mult}x (${food.basePortion || 'serving'})`;

    const entry = {
      id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      date: this.state.currentDate,
      name: food.name,
      meal,
      portion: portionLabel,
      calories: scaledCal,
      protein: scaledProt,
      carbs: scaledCarb,
      fat: scaledFat,
      photo: food.photo || null
    };

    this.state.entries.push(entry);
    this.saveEntries();
    this.renderDayLog();
    this.updateDailyScorecard();
    this.closeAddFoodModal();
    this.showToast(`Logged ${portionLabel} of "${food.name}"!`);
  }

  logFoodFromLibrary(libraryId, multiplier = 1.0, mealCategory = 'general') {
    const food = this.state.library.find((i) => i.id === libraryId);
    if (!food) return;

    const scaledCal = Math.round(food.baseCalories * multiplier);
    const scaledProt = Math.round(food.baseProtein * multiplier * 10) / 10;
    const scaledCarb = Math.round(food.baseCarbs * multiplier * 10) / 10;
    const scaledFat = Math.round(food.baseFat * multiplier * 10) / 10;

    const portionLabel = multiplier === 1.0 ? food.basePortion : `${multiplier}x (${food.basePortion || 'serving'})`;

    const entry = {
      id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      date: this.state.currentDate,
      name: food.name,
      meal: mealCategory,
      portion: portionLabel,
      calories: scaledCal,
      protein: scaledProt,
      carbs: scaledCarb,
      fat: scaledFat,
      photo: food.photo || null
    };

    this.state.entries.push(entry);
    this.saveEntries();
    this.renderDayLog();
    this.updateDailyScorecard();
    this.showToast(`Logged "${food.name}"!`);
  }

  openAddFoodModalWithItem(libraryId) {
    this.openAddFoodModal();
    this.setAddModalMode('library');
    document.getElementById('libraryFoodSelect').value = libraryId;
    this.selectLibraryFoodById(libraryId);
  }

  deleteLibraryItem(id) {
    if (confirm('Delete this food item from your library?')) {
      this.state.library = this.state.library.filter((i) => i.id !== id);
      this.saveLibrary();
      this.renderLibraryUI();
      this.populateLibraryDropdown();
      this.showToast('Item removed from Library');
    }
  }

  // ================= ADD MODAL & CUSTOM FOOD =================
  openAddFoodModal(defaultMeal = 'lunch', mode = 'library') {
    document.getElementById('addFoodModal').classList.remove('hidden');
    document.getElementById('libraryMealSelect').value = defaultMeal;
    document.getElementById('customFoodMealSelect').value = defaultMeal;
    this.setPortionMultiplier(1.0);
    this.setAddModalMode(mode);
  }

  closeAddFoodModal() {
    document.getElementById('addFoodModal').classList.add('hidden');
  }

  setAddModalMode(mode) {
    const libBtn = document.getElementById('addModeLibraryBtn');
    const custBtn = document.getElementById('addModeCustomBtn');
    const libSec = document.getElementById('addFoodFromLibrarySection');
    const custSec = document.getElementById('customFoodEntryForm');

    if (mode === 'library') {
      libBtn.className = 'flex-1 py-2 rounded-lg font-semibold bg-emerald-600 text-white shadow';
      custBtn.className = 'flex-1 py-2 rounded-lg font-semibold text-slate-300 hover:text-white';
      libSec.classList.remove('hidden');
      custSec.classList.add('hidden');
    } else {
      custBtn.className = 'flex-1 py-2 rounded-lg font-semibold bg-emerald-600 text-white shadow';
      libBtn.className = 'flex-1 py-2 rounded-lg font-semibold text-slate-300 hover:text-white';
      custSec.classList.remove('hidden');
      libSec.classList.add('hidden');
    }
  }

  handleCustomFoodSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('customFoodNameInput').value.trim();
    const basePortion = document.getElementById('customFoodPortionInput').value.trim() || '1 serving';
    const mult = parseFloat(document.getElementById('customFoodMultiplierInput').value) || 1.0;
    const baseCal = parseFloat(document.getElementById('customFoodCaloriesInput').value) || 0;
    const baseProt = parseFloat(document.getElementById('customFoodProteinInput').value) || 0;
    const baseCarb = parseFloat(document.getElementById('customFoodCarbsInput').value) || 0;
    const baseFat = parseFloat(document.getElementById('customFoodFatInput').value) || 0;
    const meal = document.getElementById('customFoodMealSelect').value;
    const saveToLib = document.getElementById('saveCustomToLibraryCheck').checked;

    const scaledCal = Math.round(baseCal * mult);
    const scaledProt = Math.round(baseProt * mult * 10) / 10;
    const scaledCarb = Math.round(baseCarb * mult * 10) / 10;
    const scaledFat = Math.round(baseFat * mult * 10) / 10;

    const entry = {
      id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      date: this.state.currentDate,
      name,
      meal,
      portion: mult === 1.0 ? basePortion : `${mult}x (${basePortion})`,
      calories: scaledCal,
      protein: scaledProt,
      carbs: scaledCarb,
      fat: scaledFat,
      photo: null
    };

    this.state.entries.push(entry);
    this.saveEntries();

    if (saveToLib) {
      this.state.library.push({
        id: 'lib_custom_' + Date.now(),
        name,
        basePortion,
        baseCalories: baseCal,
        baseProtein: baseProt,
        baseCarbs: baseCarb,
        baseFat: baseFat,
        photo: null,
        isCustom: true
      });
      this.saveLibrary();
      this.renderLibraryUI();
      this.populateLibraryDropdown();
    }

    this.renderDayLog();
    this.updateDailyScorecard();
    this.closeAddFoodModal();
    this.showToast(`Logged "${name}"!`);
  }

  deleteEntry(id) {
    this.state.entries = this.state.entries.filter((i) => i.id !== id);
    this.saveEntries();
    this.renderDayLog();
    this.updateDailyScorecard();
    this.showToast('Item deleted');
  }

  // ================= SMART SCANNER (BARCODE, NUTRITION LABEL & AI MEAL) =================
  openScanModal() {
    document.getElementById('scanPhotoModal').classList.remove('hidden');
    this.setScanMode('barcode');
    this.resetPhotoScanner();
  }

  closeScanModal() {
    this.stopLiveBarcodeScanner();
    document.getElementById('scanPhotoModal').classList.add('hidden');
  }

  setScanMode(mode) {
    this.state.currentScanMode = mode;
    this.stopLiveBarcodeScanner();

    const barcodeBtn = document.getElementById('scanModeBarcodeBtn');
    const labelBtn = document.getElementById('scanModeLabelBtn');
    const foodBtn = document.getElementById('scanModeFoodBtn');

    const barcodeSec = document.getElementById('barcodeScannerSection');
    const photoSec = document.getElementById('photoUploadSection');
    const foodHintBox = document.getElementById('foodHintBox');

    barcodeBtn.className = 'py-2 rounded-lg font-semibold text-slate-300 hover:text-white text-center';
    labelBtn.className = 'py-2 rounded-lg font-semibold text-slate-300 hover:text-white text-center';
    foodBtn.className = 'py-2 rounded-lg font-semibold text-slate-300 hover:text-white text-center';

    if (mode === 'barcode') {
      barcodeBtn.className = 'py-2 rounded-lg font-semibold bg-emerald-600 text-white shadow text-center';
      barcodeSec.classList.remove('hidden');
      photoSec.classList.add('hidden');
    } else if (mode === 'label') {
      labelBtn.className = 'py-2 rounded-lg font-semibold bg-emerald-600 text-white shadow text-center';
      barcodeSec.classList.add('hidden');
      photoSec.classList.remove('hidden');
      foodHintBox.classList.add('hidden');
    } else {
      foodBtn.className = 'py-2 rounded-lg font-semibold bg-emerald-600 text-white shadow text-center';
      barcodeSec.classList.add('hidden');
      photoSec.classList.remove('hidden');
      foodHintBox.classList.remove('hidden');
    }
  }

  resetPhotoScanner() {
    document.getElementById('cameraPhotoInput').value = '';
    document.getElementById('photoPlaceholderState').classList.remove('hidden');
    document.getElementById('photoPreviewContainer').classList.add('hidden');
    document.getElementById('scanningProgressIndicator').classList.add('hidden');
    document.getElementById('detectedResultsContainer').classList.add('hidden');
    document.getElementById('detectedImgThumb').classList.add('hidden');
    this.state.selectedImageBase64 = null;
  }

  // --- LIVE BARCODE SCANNING (ZXING & BROWSER DETECTOR) ---
  async toggleLiveBarcodeScanner() {
    if (this.state.isBarcodeScanning) {
      this.stopLiveBarcodeScanner();
    } else {
      this.startLiveBarcodeScanner();
    }
  }

  async startLiveBarcodeScanner() {
    const video = document.getElementById('barcodeVideo');
    const camBox = document.getElementById('barcodeCameraBox');
    const btn = document.getElementById('startLiveBarcodeCamBtn');

    camBox.classList.remove('hidden');
    btn.innerHTML = `<i data-lucide="video-off" class="w-4 h-4"></i> Stop Camera`;
    this.state.isBarcodeScanning = true;

    if (window.lucide) window.lucide.createIcons();

    try {
      if (window.ZXing && window.ZXing.BrowserMultiFormatReader) {
        this.state.barcodeReader = new ZXing.BrowserMultiFormatReader();
        this.state.barcodeReader.decodeFromVideoDevice(null, 'barcodeVideo', (result, err) => {
          if (result && result.text) {
            this.handleBarcodeDetected(result.text);
          }
        });
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = stream;
        video.play();
      }
    } catch (err) {
      console.warn('Camera stream error:', err);
      alert('Could not access camera for live scanning. You can take a photo of the barcode or type the code below.');
      this.stopLiveBarcodeScanner();
    }
  }

  stopLiveBarcodeScanner() {
    this.state.isBarcodeScanning = false;
    const camBox = document.getElementById('barcodeCameraBox');
    if (camBox) camBox.classList.add('hidden');

    const btn = document.getElementById('startLiveBarcodeCamBtn');
    if (btn) btn.innerHTML = `<i data-lucide="camera" class="w-4 h-4"></i> Start Camera Scan`;

    if (this.state.barcodeReader) {
      try {
        this.state.barcodeReader.reset();
      } catch (e) {}
    }

    const video = document.getElementById('barcodeVideo');
    if (video && video.srcObject) {
      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      video.srcObject = null;
    }
  }

  handleBarcodeDetected(barcodeText) {
    this.stopLiveBarcodeScanner();
    if (navigator.vibrate) navigator.vibrate(100);
    this.lookupBarcodeOnline(barcodeText);
  }

  async handleBarcodePhotoUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    this.showScanningIndicator('Scanning barcode image...', 'Detecting barcode format...');

    const downscaledBase64 = await this.downscaleImageFile(file, 1200);

    // Try decoding barcode with ZXing
    if (window.ZXing) {
      try {
        const reader = new ZXing.BrowserMultiFormatReader();
        const img = new Image();
        img.src = downscaledBase64;
        await new Promise((resolve) => (img.onload = resolve));
        const result = await reader.decodeFromImageElement(img);
        if (result && result.text) {
          this.lookupBarcodeOnline(result.text);
          return;
        }
      } catch (err) {
        console.warn('ZXing photo barcode detection fallback:', err);
      }
    }

    // Fallback: Ask user or pass to Gemini
    this.hideScanningIndicator();
    alert('Barcode could not be automatically read from this photo. Please try pointing camera directly or enter barcode number.');
  }

  // --- ONLINE REAL-TIME BARCODE LOOKUP (OPEN FOOD FACTS) ---
  async lookupBarcodeOnline(barcode) {
    this.showScanningIndicator('Querying Open Food Facts Web Database...', `Looking up barcode: ${barcode}`);

    try {
      const cleanCode = barcode.trim();
      const url = `https://world.openfoodfacts.org/api/v0/product/${cleanCode}.json`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 1 && data.product) {
        const p = data.product;
        const name = p.product_name || p.generic_name || `Product (${cleanCode})`;
        const brand = p.brands ? `${p.brands} - ` : '';
        const serving = p.serving_size || '1 serving (100g)';
        const photo = p.image_front_url || p.image_url || null;

        const nutriments = p.nutriments || {};
        const calories = Math.round(nutriments['energy-kcal_serving'] || nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0);
        const protein = Math.round((nutriments['proteins_serving'] || nutriments['proteins_100g'] || 0) * 10) / 10;
        const carbs = Math.round((nutriments['carbohydrates_serving'] || nutriments['carbohydrates_100g'] || 0) * 10) / 10;
        const fat = Math.round((nutriments['fat_serving'] || nutriments['fat_100g'] || 0) * 10) / 10;

        this.populateDetectedResults({
          name: `${brand}${name}`,
          portion: serving,
          calories,
          protein,
          carbs,
          fat,
          photo
        });
        this.hideScanningIndicator();
        this.showToast(`Found "${name}" online!`);
      } else {
        this.hideScanningIndicator();
        alert(`Barcode ${barcode} not found in Open Food Facts. You can scan its Nutrition Label instead or enter details manually.`);
      }
    } catch (err) {
      console.error('Barcode lookup error:', err);
      this.hideScanningIndicator();
      alert('Network error looking up barcode. Please check your internet connection.');
    }
  }

  // --- PHOTO ANALYSIS (CANVAS DOWNSCALING + OCR / GEMINI VISION) ---
  async handlePhotoSelected(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    this.showScanningIndicator('Downscaling & pre-processing photo...', 'Optimizing image clarity for analysis...');

    // Offscreen canvas downscale (prevents memory lag on mobile)
    const downscaledBase64 = await this.downscaleImageFile(file, 1200);
    this.state.selectedImageBase64 = downscaledBase64;

    const previewImg = document.getElementById('photoPreviewImg');
    previewImg.src = downscaledBase64;
    document.getElementById('photoPlaceholderState').classList.add('hidden');
    document.getElementById('photoPreviewContainer').classList.remove('hidden');

    this.analyzeProcessedPhoto(downscaledBase64);
  }

  async downscaleImageFile(file, maxDimension = 1200) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.getElementById('offscreenCanvas') || document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async analyzeProcessedPhoto(imageBase64) {
    const apiKey = this.state.settings.geminiApiKey;
    const mode = this.state.currentScanMode;
    const portionHint = document.getElementById('foodPortionHintInput').value.trim();

    // 1. If Gemini API key is configured OR scan mode is 'food' (Plate analysis)
    if (apiKey) {
      this.showScanningIndicator(
        mode === 'food' ? 'Gemini AI Vision: Estimating meal plate & portions...' : 'Gemini AI Vision: Reading Nutrition Facts Table...',
        'Calculating exact calories, protein, carbs and fat...'
      );

      try {
        const result = await this.callGeminiVision(imageBase64, apiKey, mode, portionHint);
        this.populateDetectedResults({ ...result, photo: imageBase64 });
        this.hideScanningIndicator();
        return;
      } catch (err) {
        console.warn('Gemini vision API error:', err);
      }
    }

    // 2. Client-side OCR fallback (Tesseract.js with pre-processed canvas)
    this.showScanningIndicator('Scanning Nutrition Table with local OCR...', 'Extracting calories and macro text...');
    try {
      if (window.Tesseract) {
        const ocrResult = await Tesseract.recognize(imageBase64, 'eng');
        const text = ocrResult.data.text;
        const parsed = this.parseNutritionLabelText(text);
        this.populateDetectedResults({ ...parsed, photo: imageBase64 });
      } else {
        this.populateDetectedResults({
          name: 'Scanned Food Item',
          portion: '1 serving',
          calories: 250,
          protein: 20,
          carbs: 25,
          fat: 8,
          photo: imageBase64
        });
      }
    } catch (err) {
      this.populateDetectedResults({
        name: 'Scanned Food',
        portion: '1 serving',
        calories: 300,
        protein: 25,
        carbs: 30,
        fat: 10,
        photo: imageBase64
      });
    } finally {
      this.hideScanningIndicator();
    }
  }

  async callGeminiVision(base64DataUrl, apiKey, mode, portionHint) {
    const mimeMatch = base64DataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const base64Data = mimeMatch ? mimeMatch[2] : base64DataUrl;

    let promptText = '';
    if (mode === 'food') {
      promptText = `
        You are an expert sports nutrition analysis assistant.
        Examine this image of a plate/dish of food.
        User's portion hint or description: "${portionHint || 'No hint provided - judge portion visually from plate size'}".
        
        If a portion hint was provided, calculate the exact macros for that portion.
        If no portion hint was provided, estimate the portion visually from the plate/container scale.
        
        Respond ONLY with a valid JSON object in this exact schema with NO markdown formatting:
        {
          "name": "Food Dish Name",
          "portion": "e.g. 150g cooked chicken breast with 1 cup rice",
          "calories": 420,
          "protein": 35.0,
          "carbs": 45.0,
          "fat": 8.0
        }
      `;
    } else {
      promptText = `
        You are an expert sports nutrition analysis assistant.
        Examine this nutrition facts label image.
        Extract the food/brand name, serving size description, calories, protein (g), total carbohydrate (g), and total fat (g).
        
        Respond ONLY with a valid JSON object in this exact schema with NO markdown formatting:
        {
          "name": "Product Name",
          "portion": "e.g. 1 scoop (30g) or 1 bottle (240ml)",
          "calories": 250,
          "protein": 25.0,
          "carbs": 20.0,
          "fat": 8.0
        }
      `;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        response_mime_type: 'application/json'
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    const candidate = json.candidates && json.candidates[0];
    const textOut = candidate?.content?.parts?.[0]?.text;
    if (!textOut) throw new Error('Empty response from Gemini');

    return JSON.parse(textOut);
  }

  parseNutritionLabelText(rawText) {
    const text = rawText.replace(/\r/g, ' ');

    let calories = null;
    let protein = null;
    let carbs = null;
    let fat = null;

    const calMatch = text.match(/calories\s*[:=]?\s*(\d{1,4})/i) || text.match(/energy\D*(\d{2,4})\s*kcal/i);
    if (calMatch) calories = parseFloat(calMatch[1]);

    const protMatch = text.match(/protein\s*[:=]?\s*(\d+(?:\.\d+)?)\s*g?/i);
    if (protMatch) protein = parseFloat(protMatch[1]);

    const carbMatch = text.match(/(?:total\s+)?carb(?:ohydrate)?s?\s*[:=]?\s*(\d+(?:\.\d+)?)\s*g?/i);
    if (carbMatch) carbs = parseFloat(carbMatch[1]);

    const fatMatch = text.match(/(?:total\s+)?fat\s*[:=]?\s*(\d+(?:\.\d+)?)\s*g?/i);
    if (fatMatch) fat = parseFloat(fatMatch[1]);

    return {
      name: 'Scanned Nutrition Label',
      portion: '1 serving',
      calories: calories !== null ? calories : 200,
      protein: protein !== null ? protein : 20,
      carbs: carbs !== null ? carbs : 20,
      fat: fat !== null ? fat : 5
    };
  }

  showScanningIndicator(msg, subMsg) {
    const el = document.getElementById('scanningProgressIndicator');
    el.classList.remove('hidden');
    document.getElementById('scanStatusMessage').textContent = msg;
    document.getElementById('scanSubStatusMessage').textContent = subMsg;
    document.getElementById('detectedResultsContainer').classList.add('hidden');
  }

  hideScanningIndicator() {
    document.getElementById('scanningProgressIndicator').classList.add('hidden');
  }

  populateDetectedResults(data) {
    document.getElementById('detectedName').value = data.name || 'Scanned Item';
    document.getElementById('detectedPortion').value = data.portion || '1 serving';
    document.getElementById('detectedMultiplier').value = '1.0';
    document.getElementById('detectedCalories').value = data.calories || 0;
    document.getElementById('detectedProtein').value = data.protein || 0;
    document.getElementById('detectedCarbs').value = data.carbs || 0;
    document.getElementById('detectedFat').value = data.fat || 0;

    const thumb = document.getElementById('detectedImgThumb');
    if (data.photo) {
      thumb.src = data.photo;
      thumb.classList.remove('hidden');
      this.state.selectedImageBase64 = data.photo;
    } else {
      thumb.classList.add('hidden');
    }

    document.getElementById('detectedResultsContainer').classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  saveDetectedFoodToDiary() {
    const name = document.getElementById('detectedName').value.trim() || 'Scanned Food';
    const basePortion = document.getElementById('detectedPortion').value.trim() || '1 serving';
    const mult = parseFloat(document.getElementById('detectedMultiplier').value) || 1.0;
    const baseCal = parseFloat(document.getElementById('detectedCalories').value) || 0;
    const baseProt = parseFloat(document.getElementById('detectedProtein').value) || 0;
    const baseCarb = parseFloat(document.getElementById('detectedCarbs').value) || 0;
    const baseFat = parseFloat(document.getElementById('detectedFat').value) || 0;
    const meal = document.getElementById('detectedMealCategory').value;
    const saveToLib = document.getElementById('saveDetectedToLibraryCheck').checked;
    const photo = this.state.selectedImageBase64 || null;

    const scaledCal = Math.round(baseCal * mult);
    const scaledProt = Math.round(baseProt * mult * 10) / 10;
    const scaledCarb = Math.round(baseCarb * mult * 10) / 10;
    const scaledFat = Math.round(baseFat * mult * 10) / 10;

    const entry = {
      id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      date: this.state.currentDate,
      name,
      meal,
      portion: mult === 1.0 ? basePortion : `${mult}x (${basePortion})`,
      calories: scaledCal,
      protein: scaledProt,
      carbs: scaledCarb,
      fat: scaledFat,
      photo
    };

    this.state.entries.push(entry);
    this.saveEntries();

    if (saveToLib) {
      this.state.library.push({
        id: 'lib_saved_' + Date.now(),
        name,
        basePortion,
        baseCalories: baseCal,
        baseProtein: baseProt,
        baseCarbs: baseCarb,
        baseFat: baseFat,
        photo,
        isCustom: true
      });
      this.saveLibrary();
      this.renderLibraryUI();
      this.populateLibraryDropdown();
    }

    this.renderDayLog();
    this.updateDailyScorecard();
    this.closeScanModal();
    this.showToast(`Saved "${name}" with photo & portion!`);
  }

  // ================= ROUTINE PLANS (OPTION A VS B) =================
  togglePlanView(letter) {
    const aBtn = document.getElementById('viewOptionABtn');
    const bBtn = document.getElementById('viewOptionBBtn');
    const aDet = document.getElementById('optionADetails');
    const bDet = document.getElementById('optionBDetails');

    if (letter === 'A') {
      aBtn.className = 'flex-1 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white transition-all shadow';
      bBtn.className = 'flex-1 py-2 text-xs font-semibold rounded-lg text-slate-300 hover:text-white transition-all';
      aDet.classList.remove('hidden');
      bDet.classList.add('hidden');
    } else {
      bBtn.className = 'flex-1 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white transition-all shadow';
      aBtn.className = 'flex-1 py-2 text-xs font-semibold rounded-lg text-slate-300 hover:text-white transition-all';
      bDet.classList.remove('hidden');
      aDet.classList.add('hidden');
    }
  }

  applyOptionTemplate(letter) {
    if (letter === 'A') {
      const items = [
        {
          name: 'Giant Morning Shake (2 scoops Nutricost + 500ml Fairlife Whole)',
          portion: '500ml milk + 2 scoops whey',
          calories: 573,
          protein: 87,
          carbs: 14,
          fat: 20,
          meal: 'breakfast'
        },
        {
          name: 'Cooked Rice + Chicken Breast + Veggies',
          portion: '1 cup rice, 100g chicken breast, vegetables',
          calories: 425,
          protein: 37.5,
          carbs: 55,
          fat: 5.5,
          meal: 'lunch'
        },
        {
          name: 'Chapati (2) + Dal + 2 Boiled Eggs + Veggies',
          portion: '2 rotis, 1 bowl dal, 2 eggs, vegetables',
          calories: 569,
          protein: 29.5,
          carbs: 78,
          fat: 16.5,
          meal: 'dinner'
        }
      ];

      items.forEach((item) => {
        this.state.entries.push({
          id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          date: this.state.currentDate,
          ...item
        });
      });
      this.saveEntries();
      this.renderDayLog();
      this.updateDailyScorecard();
      this.switchTab('tabDiary');
      this.showToast('Applied Option A template to today!');
    } else {
      const items = [
        {
          name: 'Split Shake 1 (AM: 1 scoop Nutricost + 250ml Fairlife Whole)',
          portion: '250ml milk + 1 scoop whey',
          calories: 286,
          protein: 43.5,
          carbs: 7,
          fat: 10,
          meal: 'breakfast'
        },
        {
          name: 'Rice + Chicken Breast + Veggies',
          portion: '1 cup rice, 100g chicken, vegetables',
          calories: 425,
          protein: 37.5,
          carbs: 55,
          fat: 5.5,
          meal: 'lunch'
        },
        {
          name: 'Boiled Eggs (2) + Fresh Fruit',
          portion: '2 eggs + 1 apple/banana',
          calories: 239,
          protein: 13,
          carbs: 25.8,
          fat: 10.3,
          meal: 'snack'
        },
        {
          name: 'Chapati (2) + Dal + Veggies',
          portion: '2 rotis, 1 bowl dal, sabzi',
          calories: 425,
          protein: 17.5,
          carbs: 78,
          fat: 6.5,
          meal: 'dinner'
        },
        {
          name: 'Split Shake 2 (PM: 1 scoop Nutricost + 250ml Fairlife Whole)',
          portion: '250ml milk + 1 scoop whey',
          calories: 286,
          protein: 43.5,
          carbs: 7,
          fat: 10,
          meal: 'dinner'
        }
      ];

      items.forEach((item) => {
        this.state.entries.push({
          id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          date: this.state.currentDate,
          ...item
        });
      });
      this.saveEntries();
      this.renderDayLog();
      this.updateDailyScorecard();
      this.switchTab('tabDiary');
      this.showToast('Applied Option B template to today!');
    }
  }

  // ================= BODY METRICS & CHARTS =================
  saveBodyMetricToday() {
    const weightVal = parseFloat(document.getElementById('inputBodyWeight').value);
    const waistVal = parseFloat(document.getElementById('inputWaistSize').value);

    if (isNaN(weightVal) && isNaN(waistVal)) {
      alert('Please enter body weight or waist measurement.');
      return;
    }

    const todayStr = this.state.currentDate;
    const existingIdx = this.state.bodyMetrics.findIndex((m) => m.date === todayStr);

    const record = {
      date: todayStr,
      weight: !isNaN(weightVal) ? weightVal : 75.0,
      waist: !isNaN(waistVal) ? waistVal : 33.5
    };

    if (existingIdx !== -1) {
      this.state.bodyMetrics[existingIdx] = record;
    } else {
      this.state.bodyMetrics.push(record);
    }

    this.state.bodyMetrics.sort((a, b) => new Date(a.date) - new Date(b.date));
    this.saveBodyMetrics();
    this.renderCharts();
    this.showToast('Body metrics saved for ' + todayStr);
  }

  renderCharts() {
    if (!window.Chart) return;

    const past7Days = [];
    for (let i = 6; i >= 0; i--) past7Days.push(this.offsetDateString(-i));

    const dayLabels = past7Days.map((dateStr) => {
      const [y, m, d] = dateStr.split('-').map(Number);
      return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short' });
    });

    const caloriesData = past7Days.map((dateStr) => {
      return this.state.entries.filter((i) => i.date === dateStr).reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
    });

    const proteinData = past7Days.map((dateStr) => {
      return this.state.entries.filter((i) => i.date === dateStr).reduce((sum, item) => sum + (Number(item.protein) || 0), 0);
    });

    const ctxMacro = document.getElementById('weeklyMacroChart')?.getContext('2d');
    if (ctxMacro) {
      if (this.state.weeklyChart) this.state.weeklyChart.destroy();

      this.state.weeklyChart = new Chart(ctxMacro, {
        type: 'bar',
        data: {
          labels: dayLabels,
          datasets: [
            {
              label: 'Calories (kcal)',
              data: caloriesData,
              backgroundColor: 'rgba(59, 130, 246, 0.4)',
              borderColor: '#3b82f6',
              borderWidth: 1.5,
              borderRadius: 6,
              yAxisID: 'y'
            },
            {
              type: 'line',
              label: 'Protein (g)',
              data: proteinData,
              borderColor: '#10b981',
              backgroundColor: '#10b981',
              tension: 0.3,
              pointRadius: 4,
              borderWidth: 2.5,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#94a3b8', font: { size: 11 } } }
          },
          scales: {
            x: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#94a3b8' }
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#94a3b8' },
              suggestedMax: 2200
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              grid: { drawOnChartArea: false },
              ticks: { color: '#10b981' },
              suggestedMax: 180
            }
          }
        }
      });
    }

    const ctxWaist = document.getElementById('waistTrendChart')?.getContext('2d');
    if (ctxWaist && this.state.bodyMetrics.length > 0) {
      if (this.state.waistChart) this.state.waistChart.destroy();

      const waistLabels = this.state.bodyMetrics.map((m) => {
        const [y, mon, d] = m.date.split('-').map(Number);
        return new Date(y, mon - 1, d).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
      });
      const waistValues = this.state.bodyMetrics.map((m) => m.waist);

      this.state.waistChart = new Chart(ctxWaist, {
        type: 'line',
        data: {
          labels: waistLabels,
          datasets: [
            {
              label: 'Waist Circumference (inches)',
              data: waistValues,
              borderColor: '#8b5cf6',
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              fill: true,
              tension: 0.25,
              pointRadius: 5,
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#94a3b8' } }
          },
          scales: {
            x: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#94a3b8' }
            },
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#94a3b8' },
              suggestedMin: 30,
              suggestedMax: 36
            }
          }
        }
      });
    }
  }

  // ================= SETTINGS & TARGETS =================
  saveTargetsFromInputs() {
    this.state.settings.calories = parseInt(document.getElementById('settingCalories').value) || 2000;
    this.state.settings.protein = parseInt(document.getElementById('settingProtein').value) || 150;
    this.state.settings.carbs = parseInt(document.getElementById('settingCarbs').value) || 204;
    this.state.settings.fat = parseInt(document.getElementById('settingFat').value) || 65;

    this.saveSettings();
    this.renderTargetsInUI();
    this.updateDailyScorecard();
    this.showToast('Macro targets updated successfully!');
  }

  saveGeminiApiKey() {
    const key = document.getElementById('geminiApiKeyInput').value.trim();
    this.state.settings.geminiApiKey = key;
    this.saveSettings();
    this.showToast(key ? 'Gemini API Key saved locally!' : 'API key removed.');
  }

  // ================= DATA BACKUP & RESTORE =================
  exportBackupData() {
    const backupObj = {
      app: 'Nourish',
      version: 2,
      exportedAt: new Date().toISOString(),
      settings: this.state.settings,
      entries: this.state.entries,
      library: this.state.library,
      bodyMetrics: this.state.bodyMetrics
    };

    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nourish_backup_${this.formatDate(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showToast('Data exported successfully!');
  }

  importBackupData(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.entries && Array.isArray(parsed.entries)) {
          this.state.entries = parsed.entries;
          this.saveEntries();
        }
        if (parsed.library && Array.isArray(parsed.library)) {
          this.state.library = parsed.library;
          this.saveLibrary();
        }
        if (parsed.settings) {
          this.state.settings = { ...this.state.settings, ...parsed.settings };
          this.saveSettings();
        }
        if (parsed.bodyMetrics && Array.isArray(parsed.bodyMetrics)) {
          this.state.bodyMetrics = parsed.bodyMetrics;
          this.saveBodyMetrics();
        }
        this.renderTargetsInUI();
        this.renderLibraryUI();
        this.populateLibraryDropdown();
        this.renderDayLog();
        this.updateDailyScorecard();
        this.showToast('Backup restored successfully!');
      } catch (err) {
        alert('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  }

  loadSampleDay() {
    const today = this.state.currentDate;
    this.state.entries = this.state.entries.filter((i) => i.date !== today);

    const sampleItems = [
      {
        id: 'sample_1',
        date: today,
        meal: 'breakfast',
        name: 'Giant Morning Shake (2 scoops Nutricost Whey + 500ml Fairlife Whole)',
        portion: '500 ml milk + 2 scoops whey isolate',
        calories: 573,
        protein: 87,
        carbs: 14,
        fat: 20
      },
      {
        id: 'sample_2',
        date: today,
        meal: 'lunch',
        name: 'Cooked Basmati Rice + Chicken Breast + Veggies',
        portion: '1 cup rice (150g), 100g chicken, 1 cup veggies',
        calories: 425,
        protein: 37.5,
        carbs: 55,
        fat: 5.5
      },
      {
        id: 'sample_3',
        date: today,
        meal: 'dinner',
        name: 'Whole Wheat Chapati (2) + Yellow Dal + 2 Boiled Eggs',
        portion: '2 chapatis, 1 cup dal, 2 eggs',
        calories: 504,
        protein: 27,
        carbs: 66,
        fat: 15
      }
    ];

    this.state.entries.push(...sampleItems);
    this.saveEntries();
    this.renderDayLog();
    this.updateDailyScorecard();
    this.showToast('Loaded your typical daily routine!');
  }

  clearAllData() {
    if (confirm('Are you sure you want to clear all your diary logs?')) {
      this.state.entries = [];
      this.saveEntries();
      this.renderDayLog();
      this.updateDailyScorecard();
      this.showToast('All diary entries cleared.');
    }
  }

  showToast(message) {
    const existing = document.getElementById('nourishToast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'nourishToast';
    toast.className = 'fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-slate-900/95 border border-emerald-500/30 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 backdrop-blur-md animate-bounce';
    toast.innerHTML = `
      <div class="w-2 h-2 rounded-full bg-emerald-400"></div>
      <span>${this.escapeHtml(message)}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }
}

let app;
window.addEventListener('DOMContentLoaded', () => {
  app = new NourishApp();
});
