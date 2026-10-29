// Nourish Nutrition & Macro Tracker - Core Application Logic

// ================= INITIAL STATE & DATA STORAGE =================
const DEFAULT_TARGETS = {
  calories: 2000,
  protein: 150,
  carbs: 204,
  fat: 65,
  geminiApiKey: '',
  milkType: 'whole' // 'whole' or 'fatfree'
};

const DEFAULT_PRESETS = [
  // Shakes
  {
    category: 'shakes',
    id: 'shake_optA_whole',
    name: 'Big Morning Shake (Option A - Whole Milk)',
    portion: '500ml Fairlife Whole + 2 scoops Nutricost Whey',
    calories: 573,
    protein: 87,
    carbs: 14,
    fat: 20,
    meal: 'breakfast'
  },
  {
    category: 'shakes',
    id: 'shake_optA_skim',
    name: 'Big Morning Shake (Option A - Fat-Free)',
    portion: '500ml Fairlife Fat-Free + 2 scoops Nutricost Whey',
    calories: 420,
    protein: 86,
    carbs: 14,
    fat: 1,
    meal: 'breakfast'
  },
  {
    category: 'shakes',
    id: 'shake_optB_whole',
    name: 'Split Shake (Option B - Whole Milk)',
    portion: '250ml Fairlife Whole + 1 scoop Nutricost Whey',
    calories: 286,
    protein: 43.5,
    carbs: 7,
    fat: 10,
    meal: 'breakfast'
  },
  {
    category: 'shakes',
    id: 'shake_optB_skim',
    name: 'Split Shake (Option B - Fat-Free)',
    portion: '250ml Fairlife Fat-Free + 1 scoop Nutricost Whey',
    calories: 210,
    protein: 43,
    carbs: 7,
    fat: 0.5,
    meal: 'breakfast'
  },
  {
    category: 'shakes',
    id: 'nutricost_1scoop',
    name: 'Nutricost Whey Isolate (1 scoop)',
    portion: '1 scoop (30g powder in water)',
    calories: 130,
    protein: 30,
    carbs: 1,
    fat: 0.5,
    meal: 'snack'
  },
  {
    category: 'shakes',
    id: 'fairlife_whole_250',
    name: 'Fairlife Whole Milk (250 ml)',
    portion: '1 glass (250 ml)',
    calories: 156,
    protein: 13.5,
    carbs: 6,
    fat: 9.5,
    meal: 'breakfast'
  },
  // Whole Foods
  {
    category: 'foods',
    id: 'eggs_2',
    name: 'Boiled Eggs (2 Large)',
    portion: '2 whole eggs',
    calories: 144,
    protein: 12,
    carbs: 0.8,
    fat: 10,
    meal: 'snack'
  },
  {
    category: 'foods',
    id: 'eggs_3',
    name: 'Boiled Eggs (3 Large)',
    portion: '3 whole eggs',
    calories: 216,
    protein: 18,
    carbs: 1.2,
    fat: 15,
    meal: 'snack'
  },
  {
    category: 'foods',
    id: 'rice_1cup',
    name: 'Cooked Basmati / White Rice',
    portion: '1 medium bowl (150g)',
    calories: 195,
    protein: 4,
    carbs: 43,
    fat: 0.4,
    meal: 'lunch'
  },
  {
    category: 'foods',
    id: 'dal_1bowl',
    name: 'Cooked Dal / Lentil Curry',
    portion: '1 medium bowl (200g)',
    calories: 160,
    protein: 9,
    carbs: 26,
    fat: 3,
    meal: 'dinner'
  },
  {
    category: 'foods',
    id: 'roti_2',
    name: 'Chapati / Whole Wheat Roti',
    portion: '2 pieces',
    calories: 200,
    protein: 6,
    carbs: 40,
    fat: 2,
    meal: 'dinner'
  },
  {
    category: 'foods',
    id: 'chicken_breast_100',
    name: 'Cooked Chicken Breast',
    portion: '100g cooked',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    meal: 'lunch'
  },
  {
    category: 'foods',
    id: 'fish_fillet_100',
    name: 'Cooked Fish Fillet',
    portion: '100g cooked',
    calories: 120,
    protein: 22,
    carbs: 0,
    fat: 3,
    meal: 'lunch'
  },
  {
    category: 'foods',
    id: 'mixed_veggies',
    name: 'Mixed Vegetables / Sabzi',
    portion: '1 cup cooked / salad',
    calories: 65,
    protein: 2.5,
    carbs: 12,
    fat: 1.5,
    meal: 'lunch'
  },
  {
    category: 'foods',
    id: 'apple_banana',
    name: 'Apple or Banana',
    portion: '1 medium fresh fruit',
    calories: 95,
    protein: 1,
    carbs: 25,
    fat: 0.3,
    meal: 'snack'
  }
];

class NourishApp {
  constructor() {
    this.state = {
      currentDate: this.formatDate(new Date()),
      settings: this.loadSettings(),
      entries: this.loadEntries(),
      bodyMetrics: this.loadBodyMetrics(),
      currentScanMode: 'label', // 'label' or 'food'
      selectedImageBase64: null,
      weeklyChart: null,
      waistChart: null
    };

    this.init();
  }

  // ================= STORAGE HELPERS =================
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

  loadBodyMetrics() {
    try {
      const stored = localStorage.getItem('nourish_body_metrics');
      if (stored) return JSON.parse(stored);
      // Sample initial entry
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
    this.renderPresets();
    this.renderDayLog();
    this.setupEventListeners();
    this.registerServiceWorker();

    // If fresh install and no entries, prompt with sample day
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
    // Navigation Tabs (Desktop & Mobile)
    document.querySelectorAll('[data-tab]').forEach((tabBtn) => {
      tabBtn.addEventListener('click', (e) => {
        const tabTarget = tabBtn.getAttribute('data-tab');
        this.switchTab(tabTarget);
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

    // Option A / Option B plan views
    document.getElementById('viewOptionABtn').addEventListener('click', () => this.togglePlanView('A'));
    document.getElementById('viewOptionBBtn').addEventListener('click', () => this.togglePlanView('B'));
    document.getElementById('applyOptionAToTodayBtn').addEventListener('click', () => this.applyOptionTemplate('A'));
    document.getElementById('applyOptionBToTodayBtn').addEventListener('click', () => this.applyOptionTemplate('B'));

    // Manual Food Modal
    document.getElementById('openAddModalBtn').addEventListener('click', () => this.openAddFoodModal());
    document.getElementById('closeAddFoodModalBtn').addEventListener('click', () => this.closeAddFoodModal());
    document.getElementById('cancelAddFoodBtn').addEventListener('click', () => this.closeAddFoodModal());
    document.getElementById('foodEntryForm').addEventListener('submit', (e) => this.handleFoodFormSubmit(e));

    // Staples / Presets Modal
    document.getElementById('openPresetsModalBtn').addEventListener('click', () => this.openPresetsModal());
    document.getElementById('closePresetsModalBtn').addEventListener('click', () => this.closePresetsModal());
    document.getElementById('quickLogMorningShakeBtn').addEventListener('click', () => {
      this.logPresetById('shake_optA_whole');
    });

    // Photo Scanner Modal
    const openScanHandler = () => this.openScanModal();
    document.getElementById('openScanModalBtn').addEventListener('click', openScanHandler);
    document.getElementById('headerScanBtn').addEventListener('click', openScanHandler);
    document.getElementById('closeScanModalBtn').addEventListener('click', () => this.closeScanModal());

    document.getElementById('scanModeLabel').addEventListener('click', () => this.setScanMode('label'));
    document.getElementById('scanModeFood').addEventListener('click', () => this.setScanMode('food'));
    document.getElementById('cameraPhotoInput').addEventListener('change', (e) => this.handlePhotoSelected(e));
    document.getElementById('retakePhotoBtn').addEventListener('click', () => this.resetPhotoScanner());
    document.getElementById('saveDetectedFoodBtn').addEventListener('click', () => this.saveDetectedFoodToDiary());

    // Settings
    document.getElementById('openSettingsBtn').addEventListener('click', () => this.switchTab('tabSettings'));
    document.getElementById('saveTargetsBtn').addEventListener('click', () => this.saveTargetsFromInputs());
    document.getElementById('saveApiKeyBtn').addEventListener('click', () => this.saveGeminiApiKey());
    document.getElementById('saveBodyMetricBtn').addEventListener('click', () => this.saveBodyMetricToday());

    // Backup & Sync
    document.getElementById('exportDataBtn').addEventListener('click', () => this.exportBackupData());
    document.getElementById('importDataInput').addEventListener('change', (e) => this.importBackupData(e));
    document.getElementById('loadSampleDataBtn').addEventListener('click', () => this.loadSampleDay());
    document.getElementById('clearAllDataBtn').addEventListener('click', () => this.clearAllData());
  }

  // ================= TAB MANAGEMENT =================
  switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach((el) => el.classList.add('hidden'));
    const targetContent = document.getElementById(tabId);
    if (targetContent) targetContent.classList.remove('hidden');

    // Update active tab buttons
    document.querySelectorAll('[data-tab]').forEach((btn) => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active', 'border-emerald-500', 'text-emerald-400');
        btn.classList.remove('border-transparent', 'text-slate-400');
      } else {
        btn.classList.remove('active', 'border-emerald-500', 'text-emerald-400');
        btn.classList.add('border-transparent', 'text-slate-400');
      }
    });

    if (tabId === 'tabAnalytics') {
      this.renderCharts();
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
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

    if (this.state.currentDate === todayStr) {
      displayEl.textContent = `Today (${dateFormatted})`;
    } else {
      displayEl.textContent = dateFormatted;
    }
  }

  // ================= CALORIE & MACRO SCORECARD =================
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

    // Remaining calories
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

    // Protein badge status
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

    // Macro distribution ratio bar
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

  // ================= DAILY LOG RENDERING =================
  renderDayLog() {
    const container = document.getElementById('mealsContainer');
    container.innerHTML = '';

    const dayEntries = this.state.entries.filter((item) => item.date === this.state.currentDate);

    const mealCategories = [
      { id: 'breakfast', title: 'Breakfast / Morning', icon: 'coffee', defaultTime: '8:00 AM' },
      { id: 'lunch', title: 'Lunch', icon: 'sun', defaultTime: '1:00 PM' },
      { id: 'snack', title: 'Afternoon Snack / Pre-Workout', icon: 'apple', defaultTime: '4:30 PM' },
      { id: 'dinner', title: 'Dinner / Post-Workout', icon: 'moon', defaultTime: '8:00 PM' }
    ];

    if (dayEntries.length === 0) {
      container.innerHTML = `
        <div class="glass-panel p-8 text-center space-y-3">
          <div class="w-12 h-12 mx-auto rounded-full bg-white/5 flex items-center justify-center text-slate-400">
            <i data-lucide="utensils" class="w-6 h-6"></i>
          </div>
          <h4 class="text-sm font-bold text-white">No foods logged for this day yet</h4>
          <p class="text-xs text-slate-400 max-w-sm mx-auto">
            Tap "Your Staples" or "+ Morning Shake" to log with one tap, or snap a photo of your meal or nutrition label!
          </p>
          <div class="flex justify-center gap-2 pt-2">
            <button onclick="app.logPresetById('shake_optA_whole')" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold">
              + Log Morning Shake (87g Protein)
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
      const itemsInMeal = dayEntries.filter((item) => item.meal === cat.id);
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
                      ${item.portion ? `${this.escapeHtml(item.portion)} • ` : ''}
                      <span class="text-emerald-400 font-medium">${item.protein || 0}g protein</span> | 
                      <span>${item.carbs || 0}g carbs</span> | 
                      <span>${item.fat || 0}g fat</span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-slate-200">${item.calories || 0} kcal</span>
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

  // ================= PRESETS RENDERING & LOGGING =================
  renderPresets() {
    const shakeContainer = document.getElementById('shakePresetsList');
    const foodContainer = document.getElementById('wholeFoodPresetsList');

    shakeContainer.innerHTML = '';
    foodContainer.innerHTML = '';

    DEFAULT_PRESETS.forEach((preset) => {
      const card = document.createElement('div');
      card.className = 'p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between cursor-pointer transition-all group';
      card.innerHTML = `
        <div>
          <div class="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">${preset.name}</div>
          <div class="text-[10px] text-slate-400">${preset.portion}</div>
          <div class="text-[10px] font-medium text-emerald-400 mt-0.5">
            ${preset.protein}g P · ${preset.calories} kcal · ${preset.carbs}g C · ${preset.fat}g F
          </div>
        </div>
        <button class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold">
          + Add
        </button>
      `;

      card.addEventListener('click', () => {
        this.logPreset(preset);
        this.closePresetsModal();
      });

      if (preset.category === 'shakes') {
        shakeContainer.appendChild(card);
      } else {
        foodContainer.appendChild(card);
      }
    });
  }

  logPreset(preset, targetDate = null) {
    const newEntry = {
      id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      date: targetDate || this.state.currentDate,
      meal: preset.meal || 'lunch',
      name: preset.name,
      portion: preset.portion,
      calories: preset.calories,
      protein: preset.protein,
      carbs: preset.carbs,
      fat: preset.fat,
      photo: null
    };

    this.state.entries.push(newEntry);
    this.saveEntries();
    this.renderDayLog();
    this.updateDailyScorecard();
    this.showToast(`Logged "${preset.name}"!`);
  }

  logPresetById(presetId) {
    const preset = DEFAULT_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      this.logPreset(preset);
    }
  }

  // ================= ROUTINE PLANS (OPTION A VS OPTION B) =================
  togglePlanView(optionLetter) {
    const optABtn = document.getElementById('viewOptionABtn');
    const optBBtn = document.getElementById('viewOptionBBtn');
    const optADetails = document.getElementById('optionADetails');
    const optBDetails = document.getElementById('optionBDetails');

    if (optionLetter === 'A') {
      optABtn.className = 'flex-1 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white transition-all shadow';
      optBBtn.className = 'flex-1 py-2 text-xs font-semibold rounded-lg text-slate-300 hover:text-white transition-all';
      optADetails.classList.remove('hidden');
      optBDetails.classList.add('hidden');
    } else {
      optBBtn.className = 'flex-1 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white transition-all shadow';
      optABtn.className = 'flex-1 py-2 text-xs font-semibold rounded-lg text-slate-300 hover:text-white transition-all';
      optBDetails.classList.remove('hidden');
      optADetails.classList.add('hidden');
    }

    if (window.lucide) window.lucide.createIcons();
  }

  applyOptionTemplate(optionLetter) {
    if (optionLetter === 'A') {
      // Option A: Giant Morning Shake + Lunch + Dinner
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
      this.showToast('Applied Option A (Fast Morning Shake) routine to today!');
    } else {
      // Option B: Split Shakes (AM & PM)
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
      this.showToast('Applied Option B (Even Muscle Distribution) routine to today!');
    }
  }

  // ================= MANUAL FOOD ENTRY =================
  openAddFoodModal(defaultMeal = 'lunch') {
    document.getElementById('foodEntryForm').reset();
    document.getElementById('editFoodId').value = '';
    document.getElementById('foodMealSelect').value = defaultMeal;
    document.getElementById('addFoodModalTitle').innerHTML = `
      <i data-lucide="plus-circle" class="w-5 h-5 text-emerald-400"></i> Log Food Item
    `;
    document.getElementById('addFoodModal').classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  closeAddFoodModal() {
    document.getElementById('addFoodModal').classList.add('hidden');
  }

  handleFoodFormSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('editFoodId').value;
    const name = document.getElementById('foodNameInput').value.trim();
    const meal = document.getElementById('foodMealSelect').value;
    const portion = document.getElementById('foodPortionInput').value.trim();
    const calories = parseFloat(document.getElementById('foodCaloriesInput').value) || 0;
    const protein = parseFloat(document.getElementById('foodProteinInput').value) || 0;
    const carbs = parseFloat(document.getElementById('foodCarbsInput').value) || 0;
    const fat = parseFloat(document.getElementById('foodFatInput').value) || 0;

    if (editId) {
      const idx = this.state.entries.findIndex((i) => i.id === editId);
      if (idx !== -1) {
        this.state.entries[idx] = {
          ...this.state.entries[idx],
          name,
          meal,
          portion,
          calories,
          protein,
          carbs,
          fat
        };
      }
    } else {
      this.state.entries.push({
        id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        date: this.state.currentDate,
        name,
        meal,
        portion,
        calories,
        protein,
        carbs,
        fat,
        photo: null
      });
    }

    this.saveEntries();
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

  // ================= PRESETS MODAL =================
  openPresetsModal() {
    document.getElementById('presetsModal').classList.remove('hidden');
  }

  closePresetsModal() {
    document.getElementById('presetsModal').classList.add('hidden');
  }

  // ================= PHOTO & LABEL SCANNER =================
  openScanModal() {
    document.getElementById('scanPhotoModal').classList.remove('hidden');
    this.resetPhotoScanner();
  }

  closeScanModal() {
    document.getElementById('scanPhotoModal').classList.add('hidden');
  }

  setScanMode(mode) {
    this.state.currentScanMode = mode;
    const labelBtn = document.getElementById('scanModeLabel');
    const foodBtn = document.getElementById('scanModeFood');

    if (mode === 'label') {
      labelBtn.className = 'py-2 rounded-lg font-semibold bg-emerald-600 text-white shadow';
      foodBtn.className = 'py-2 rounded-lg font-semibold text-slate-300 hover:text-white';
    } else {
      foodBtn.className = 'py-2 rounded-lg font-semibold bg-emerald-600 text-white shadow';
      labelBtn.className = 'py-2 rounded-lg font-semibold text-slate-300 hover:text-white';
    }
  }

  resetPhotoScanner() {
    document.getElementById('cameraPhotoInput').value = '';
    document.getElementById('photoPlaceholderState').classList.remove('hidden');
    document.getElementById('photoPreviewContainer').classList.add('hidden');
    document.getElementById('scanningProgressIndicator').classList.add('hidden');
    document.getElementById('detectedResultsContainer').classList.add('hidden');
    this.state.selectedImageBase64 = null;
  }

  handlePhotoSelected(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result;
      this.state.selectedImageBase64 = base64Data;

      // Show preview
      const previewImg = document.getElementById('photoPreviewImg');
      previewImg.src = base64Data;
      document.getElementById('photoPlaceholderState').classList.add('hidden');
      document.getElementById('photoPreviewContainer').classList.remove('hidden');

      // Process image
      this.analyzePhoto(base64Data);
    };
    reader.readAsDataURL(file);
  }

  async analyzePhoto(imageBase64) {
    const progressEl = document.getElementById('scanningProgressIndicator');
    const statusMsg = document.getElementById('scanStatusMessage');
    const resultsContainer = document.getElementById('detectedResultsContainer');

    progressEl.classList.remove('hidden');
    resultsContainer.classList.add('hidden');

    const apiKey = this.state.settings.geminiApiKey;

    // PATH 1: If Gemini API key is configured OR scan mode is 'food', use Gemini Multimodal
    if (apiKey) {
      statusMsg.textContent = 'Calling Gemini Vision AI to inspect food & portion...';
      try {
        const result = await this.callGeminiVision(imageBase64, apiKey, this.state.currentScanMode);
        this.populateDetectedResults(result);
        progressEl.classList.add('hidden');
        resultsContainer.classList.remove('hidden');
        return;
      } catch (err) {
        console.warn('Gemini vision failed, attempting client-side OCR fallback:', err);
        statusMsg.textContent = 'Gemini error; switching to built-in nutrition label OCR...';
      }
    }

    // PATH 2: Client-side OCR with Tesseract.js (Nutrition facts label scanner)
    statusMsg.textContent = 'Scanning nutrition facts table with built-in OCR...';
    try {
      if (window.Tesseract) {
        const ocrResult = await Tesseract.recognize(imageBase64, 'eng');
        const text = ocrResult.data.text;
        const parsed = this.parseNutritionLabelText(text);
        this.populateDetectedResults(parsed);
      } else {
        // Fallback default
        this.populateDetectedResults({
          name: 'Nutrition Label Item',
          calories: 250,
          protein: 20,
          carbs: 25,
          fat: 8
        });
      }
    } catch (ocrErr) {
      console.error('OCR Error:', ocrErr);
      this.populateDetectedResults({
        name: 'Logged Meal',
        calories: 300,
        protein: 25,
        carbs: 30,
        fat: 10
      });
    } finally {
      progressEl.classList.add('hidden');
      resultsContainer.classList.remove('hidden');
    }
  }

  async callGeminiVision(base64DataUrl, apiKey, mode) {
    // Extract base64 without prefix
    const mimeMatch = base64DataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const base64Data = mimeMatch ? mimeMatch[2] : base64DataUrl;

    const promptText = `
      You are an expert sports nutrition analysis assistant.
      Examine this image.
      If it is a nutrition facts label: extract the item name, calories, protein (g), total carbohydrate (g), and total fat (g).
      If it is a prepared plate of food: identify the dish, estimate the portion size, and estimate total calories, protein in grams, carbohydrates in grams, and fat in grams.
      
      Respond ONLY with a valid JSON object in this exact schema, with no markdown code fences:
      {
        "name": "Food or Brand Name",
        "portion": "Estimated portion or serving size",
        "calories": 250,
        "protein": 25,
        "carbs": 20,
        "fat": 8
      }
    `;

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

    if (!response.ok) {
      throw new Error(`Gemini API HTTP ${response.status}: ${await response.text()}`);
    }

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

    // Calories Regex
    const calMatch = text.match(/calories\s*[:=]?\s*(\d{1,4})/i) || text.match(/energy\D*(\d{2,4})\s*kcal/i);
    if (calMatch) calories = parseFloat(calMatch[1]);

    // Protein Regex
    const protMatch = text.match(/protein\s*[:=]?\s*(\d+(?:\.\d+)?)\s*g?/i);
    if (protMatch) protein = parseFloat(protMatch[1]);

    // Carbohydrate Regex
    const carbMatch = text.match(/(?:total\s+)?carb(?:ohydrate)?s?\s*[:=]?\s*(\d+(?:\.\d+)?)\s*g?/i);
    if (carbMatch) carbs = parseFloat(carbMatch[1]);

    // Total Fat Regex
    const fatMatch = text.match(/(?:total\s+)?fat\s*[:=]?\s*(\d+(?:\.\d+)?)\s*g?/i);
    if (fatMatch) fat = parseFloat(fatMatch[1]);

    // Defaults if missing
    return {
      name: 'Scanned Label Item',
      portion: '1 serving',
      calories: calories !== null ? calories : 200,
      protein: protein !== null ? protein : 15,
      carbs: carbs !== null ? carbs : 20,
      fat: fat !== null ? fat : 5
    };
  }

  populateDetectedResults(data) {
    document.getElementById('detectedName').value = data.name || 'Scanned Food';
    document.getElementById('detectedCalories').value = data.calories || 0;
    document.getElementById('detectedProtein').value = data.protein || 0;
    document.getElementById('detectedCarbs').value = data.carbs || 0;
    document.getElementById('detectedFat').value = data.fat || 0;
  }

  saveDetectedFoodToDiary() {
    const name = document.getElementById('detectedName').value.trim() || 'Scanned Item';
    const calories = parseFloat(document.getElementById('detectedCalories').value) || 0;
    const protein = parseFloat(document.getElementById('detectedProtein').value) || 0;
    const carbs = parseFloat(document.getElementById('detectedCarbs').value) || 0;
    const fat = parseFloat(document.getElementById('detectedFat').value) || 0;
    const meal = document.getElementById('detectedMealCategory').value;

    const newEntry = {
      id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      date: this.state.currentDate,
      name,
      meal,
      portion: 'Photo scan',
      calories,
      protein,
      carbs,
      fat,
      photo: this.state.selectedImageBase64
    };

    this.state.entries.push(newEntry);
    this.saveEntries();
    this.renderDayLog();
    this.updateDailyScorecard();
    this.closeScanModal();
    this.showToast(`Saved "${name}" with photo!`);
  }

  // ================= BODY METRICS & WAIST TRACKING =================
  saveBodyMetricToday() {
    const weightVal = parseFloat(document.getElementById('inputBodyWeight').value);
    const waistVal = parseFloat(document.getElementById('inputWaistSize').value);

    if (isNaN(weightVal) && isNaN(waistVal)) {
      alert('Please enter at least body weight or waist measurement.');
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

    // Sort by date
    this.state.bodyMetrics.sort((a, b) => new Date(a.date) - new Date(b.date));
    this.saveBodyMetrics();
    this.renderCharts();
    this.showToast('Body metrics saved for ' + todayStr);
  }

  // ================= CHARTS (CHART.JS) =================
  renderCharts() {
    if (!window.Chart) return;

    // 1. Weekly Calorie & Protein Chart
    const past7Days = [];
    for (let i = 6; i >= 0; i--) {
      past7Days.push(this.offsetDateString(-i));
    }

    const dayLabels = past7Days.map((dateStr) => {
      const [y, m, d] = dateStr.split('-').map(Number);
      return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short' });
    });

    const caloriesData = past7Days.map((dateStr) => {
      const dayEntries = this.state.entries.filter((i) => i.date === dateStr);
      return dayEntries.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
    });

    const proteinData = past7Days.map((dateStr) => {
      const dayEntries = this.state.entries.filter((i) => i.date === dateStr);
      return dayEntries.reduce((sum, item) => sum + (Number(item.protein) || 0), 0);
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
            legend: {
              labels: { color: '#94a3b8', font: { size: 11 } }
            }
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

    // 2. Waist Trend Chart
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
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: this.state.settings,
      entries: this.state.entries,
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
        if (parsed.settings) {
          this.state.settings = { ...this.state.settings, ...parsed.settings };
          this.saveSettings();
        }
        if (parsed.bodyMetrics && Array.isArray(parsed.bodyMetrics)) {
          this.state.bodyMetrics = parsed.bodyMetrics;
          this.saveBodyMetrics();
        }
        this.renderTargetsInUI();
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
    // Add default Option A day sample so the user immediately sees their exact routine
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
    if (confirm('Are you sure you want to clear all your diary logs? This cannot be undone unless you have a backup.')) {
      this.state.entries = [];
      this.saveEntries();
      this.renderDayLog();
      this.updateDailyScorecard();
      this.showToast('All log entries cleared.');
    }
  }

  // ================= TOAST NOTIFICATION =================
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

// Instantiate on load
let app;
window.addEventListener('DOMContentLoaded', () => {
  app = new NourishApp();
});
