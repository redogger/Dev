/**
 * Options Page Script - Auto Interactor Pro
 * 
 * المسؤوليات:
 * - إدارة صفحة الإعدادات المتقدمة
 * - إنشاء وتعديل القواعد التلقائية
 * - إدارة المهام المجدولة
 * - عرض وتصدير السجلات
 */

let settings = {};
let currentActions = [];

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Options] Initialized');
  
  // تحميل الإعدادات
  await loadSettings();
  
  // إعداد التبويبات
  setupTabs();
  
  // ملء النماذج بالقيم الحالية
  populateForms();
  
  // إعداد مستمعي الأحداث
  setupEventListeners();
  
  // تحميل القواعد المحفوظة
  loadSavedRules();
  
  // تحميل السجلات
  loadLogs();
});

// ==================== Settings Management ====================
async function loadSettings() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
    settings = response.settings || {};
    console.log('[Options] Settings loaded:', settings);
  } catch (error) {
    console.warn('[Options] Could not load settings:', error);
    settings = getDefaultSettings();
  }
}

function getDefaultSettings() {
  return {
    enabled: true,
    taskInterval: 5,
    monitorAllFrames: false,
    enableLogging: true,
    maxRetries: 3,
    retryDelay: 2000,
    autoRules: [],
    periodicTasks: [],
    dailyTasks: [],
    monitoringConfig: {
      interval: 5000,
      enableNotifications: true
    }
  };
}

async function saveSettings(updates) {
  try {
    await chrome.runtime.sendMessage({
      action: 'updateSettings',
      settings: updates
    });
    settings = { ...settings, ...updates };
    showNotification('تم حفظ الإعدادات بنجاح', 'success');
  } catch (error) {
    console.error('[Options] Could not save settings:', error);
    showNotification('فشل حفظ الإعدادات', 'error');
  }
}

// ==================== Tabs Management ====================
function setupTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      
      // إزالة الفئة النشطة من جميع الأزرار والمحتويات
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // إضافة الفئة النشطة للزر والمحتوى المحددين
      btn.classList.add('active');
      document.getElementById(tabId).classList.add('active');
    });
  });
}

// ==================== Forms Population ====================
function populateForms() {
  // General Tab
  document.getElementById('enabled').checked = settings.enabled !== false;
  document.getElementById('taskInterval').value = settings.taskInterval || 5;
  document.getElementById('monitorAllFrames').checked = settings.monitorAllFrames || false;
  document.getElementById('enableLogging').checked = settings.enableLogging !== false;
  document.getElementById('maxRetries').value = settings.maxRetries || 3;
  document.getElementById('retryDelay').value = settings.retryDelay || 2000;
  
  // Monitoring Tab
  document.getElementById('monitorInterval').value = (settings.monitoringConfig?.interval) || 5000;
  document.getElementById('enableNotifications').checked = settings.monitoringConfig?.enableNotifications !== false;
}

// ==================== Event Listeners ====================
function setupEventListeners() {
  // General Tab
  document.getElementById('saveGeneral')?.addEventListener('click', saveGeneralSettings);
  
  // Rules Tab
  document.getElementById('addAction')?.addEventListener('click', addActionField);
  document.getElementById('saveRule')?.addEventListener('click', saveRule);
  
  // Tasks Tab
  document.getElementById('addTask')?.addEventListener('click', addNewTask);
  
  // Monitoring Tab
  document.getElementById('saveMonitoring')?.addEventListener('click', saveMonitoringSettings);
  
  // Logs Tab
  document.getElementById('refreshLogs')?.addEventListener('click', loadLogs);
  document.getElementById('clearLogs')?.addEventListener('click', clearLogs);
  document.getElementById('exportLogs')?.addEventListener('click', exportLogs);
  
  // تفويض أحداث حذف الإجراءات
  document.getElementById('actionsContainer')?.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-action')) {
      e.target.closest('.action-item').remove();
    }
  });
}

// ==================== General Settings ====================
async function saveGeneralSettings() {
  const updates = {
    enabled: document.getElementById('enabled').checked,
    taskInterval: parseInt(document.getElementById('taskInterval').value),
    monitorAllFrames: document.getElementById('monitorAllFrames').checked,
    enableLogging: document.getElementById('enableLogging').checked,
    maxRetries: parseInt(document.getElementById('maxRetries').value),
    retryDelay: parseInt(document.getElementById('retryDelay').value)
  };
  
  await saveSettings(updates);
}

// ==================== Rules Management ====================
function addActionField() {
  const container = document.getElementById('actionsContainer');
  
  const actionDiv = document.createElement('div');
  actionDiv.className = 'action-item';
  actionDiv.style.cssText = 'background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 10px;';
  
  actionDiv.innerHTML = `
    <div class="form-group">
      <label>نوع الإجراء</label>
      <select class="action-type">
        <option value="click">نقر (Click)</option>
        <option value="fill">ملء حقل (Fill)</option>
        <option value="extract">استخراج بيانات (Extract)</option>
        <option value="scroll">تمرير (Scroll)</option>
        <option value="hover">تحويم (Hover)</option>
        <option value="select">اختيار (Select)</option>
        <option value="check">تحديد (Check)</option>
        <option value="wait">انتظار (Wait)</option>
      </select>
    </div>
    
    <div class="form-group">
      <label>CSS Selector أو XPath</label>
      <input type="text" class="action-selector" placeholder="#myButton أو //button[@id='submit']">
    </div>
    
    <div class="form-group">
      <label>القيمة (للملء/الاختيار)</label>
      <input type="text" class="action-value" placeholder="القيمة المراد إدخالها">
    </div>
    
    <div class="form-group">
      <label>التأخير بعد الإجراء (مللي ثانية)</label>
      <input type="number" class="action-delay" min="0" max="10000" value="500">
    </div>
    
    <button class="btn btn-danger btn-sm remove-action">🗑️ حذف</button>
  `;
  
  container.appendChild(actionDiv);
}

async function saveRule() {
  const name = document.getElementById('ruleName').value.trim();
  const urlPattern = document.getElementById('ruleUrlPattern').value.trim();
  const delay = parseInt(document.getElementById('ruleDelay').value);
  const onceOnly = document.getElementById('ruleOnceOnly').checked;
  
  if (!name) {
    showNotification('يرجى إدخال اسم للقاعدة', 'error');
    return;
  }
  
  // جمع الإجراءات
  const actions = [];
  const actionItems = document.querySelectorAll('.action-item');
  
  actionItems.forEach(item => {
    const type = item.querySelector('.action-type').value;
    const selector = item.querySelector('.action-selector').value.trim();
    const value = item.querySelector('.action-value').value.trim();
    const actionDelay = parseInt(item.querySelector('.action-delay').value);
    
    if (selector || type === 'wait') {
      actions.push({
        type,
        selector: selector || null,
        xpath: selector?.startsWith('//') ? selector : null,
        value: value || null,
        delayBetween: actionDelay
      });
    }
  });
  
  if (actions.length === 0) {
    showNotification('يرجى إضافة إجراء واحد على الأقل', 'error');
    return;
  }
  
  const newRule = {
    id: Date.now().toString(),
    name,
    urlPattern,
    delay,
    onceOnly,
    enabled: true,
    actions,
    createdAt: new Date().toISOString()
  };
  
  // إضافة القاعدة للإعدادات
  const existingRules = settings.autoRules || [];
  await saveSettings({
    autoRules: [...existingRules, newRule]
  });
  
  // تحديث العرض
  loadSavedRules();
  
  // تفريغ النموذج
  document.getElementById('ruleName').value = '';
  document.getElementById('ruleUrlPattern').value = '';
  document.getElementById('ruleDelay').value = '1000';
  document.getElementById('ruleOnceOnly').checked = false;
  document.getElementById('actionsContainer').innerHTML = '';
  addActionField();
  
  showNotification('تم حفظ القاعدة بنجاح', 'success');
}

function loadSavedRules() {
  const container = document.getElementById('savedRules');
  if (!container) return;
  
  const rules = settings.autoRules || [];
  
  if (rules.length === 0) {
    container.innerHTML = '<p style="color: #666; text-align: center;">لا توجد قواعد محفوظة</p>';
    return;
  }
  
  container.innerHTML = '';
  
  rules.forEach((rule, index) => {
    const ruleCard = document.createElement('div');
    ruleCard.className = 'rule-card';
    ruleCard.innerHTML = `
      <div class="rule-card-header">
        <span class="rule-card-title">${rule.name}</span>
        <div>
          <label class="toggle-switch" style="transform: scale(0.8);">
            <input type="checkbox" ${rule.enabled ? 'checked' : ''} onchange="toggleRule(${index}, this.checked)">
            <span class="slider"></span>
          </label>
          <button class="btn btn-danger btn-sm" onclick="deleteRule(${index})" style="margin-right: 5px;">🗑️</button>
        </div>
      </div>
      <div style="font-size: 13px; color: #666;">
        <p><strong>URL Pattern:</strong> ${rule.urlPattern || '*'}</p>
        <p><strong>الإجراءات:</strong> ${rule.actions.length}</p>
        <p><strong>التأخير:</strong> ${rule.delay}ms</p>
        <p><strong>لمرة واحدة:</strong> ${rule.onceOnly ? 'نعم' : 'لا'}</p>
      </div>
    `;
    
    container.appendChild(ruleCard);
  });
}

async function toggleRule(index, enabled) {
  const rules = settings.autoRules || [];
  if (rules[index]) {
    rules[index].enabled = enabled;
    await saveSettings({ autoRules: rules });
  }
}

async function deleteRule(index) {
  if (!confirm('هل أنت متأكد من حذف هذه القاعدة؟')) return;
  
  const rules = settings.autoRules || [];
  rules.splice(index, 1);
  await saveSettings({ autoRules: rules });
  loadSavedRules();
}

// ==================== Tasks Management ====================
async function addNewTask() {
  const taskName = prompt('أدخل اسم المهمة الجديدة:');
  
  if (!taskName) return;
  
  const newTask = {
    id: Date.now().toString(),
    name: taskName,
    enabled: true,
    actions: []
  };
  
  const existingTasks = settings.periodicTasks || [];
  await saveSettings({
    periodicTasks: [...existingTasks, newTask]
  });
  
  loadTasks();
}

function loadTasks() {
  const tbody = document.getElementById('tasksList');
  if (!tbody) return;
  
  const tasks = settings.periodicTasks || [];
  
  if (tasks.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">لا توجد مهام مجدولة</td></tr>';
    return;
  }
  
  tbody.innerHTML = '';
  
  tasks.forEach((task, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${task.name}</td>
      <td>
        <label class="toggle-switch" style="transform: scale(0.8);">
          <input type="checkbox" ${task.enabled ? 'checked' : ''} onchange="toggleTask(${index}, this.checked)">
          <span class="slider"></span>
        </label>
      </td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteTask(${index})">🗑️ حذف</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

async function toggleTask(index, enabled) {
  const tasks = settings.periodicTasks || [];
  if (tasks[index]) {
    tasks[index].enabled = enabled;
    await saveSettings({ periodicTasks: tasks });
  }
}

async function deleteTask(index) {
  if (!confirm('هل أنت متأكد من حذف هذه المهمة؟')) return;
  
  const tasks = settings.periodicTasks || [];
  tasks.splice(index, 1);
  await saveSettings({ periodicTasks: tasks });
  loadTasks();
}

// ==================== Monitoring Settings ====================
async function saveMonitoringSettings() {
  const updates = {
    monitoringConfig: {
      interval: parseInt(document.getElementById('monitorInterval').value),
      enableNotifications: document.getElementById('enableNotifications').checked
    }
  };
  
  await saveSettings(updates);
}

// ==================== Logs Management ====================
async function loadLogs() {
  const logsDisplay = document.getElementById('logsDisplay');
  const logsLimit = parseInt(document.getElementById('logsLimit')?.value) || 100;
  
  if (!logsDisplay) return;
  
  try {
    const result = await chrome.storage.local.get('eventLogs');
    const logs = (result.eventLogs || []).slice(0, logsLimit);
    
    if (logs.length === 0) {
      logsDisplay.innerHTML = '<p style="color: #666; text-align: center;">لا توجد سجلات</p>';
      return;
    }
    
    logsDisplay.innerHTML = logs.map(log => `
      <div style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-size: 13px;">
        <span style="color: #667eea;">[${new Date(log.timestamp).toLocaleString('ar-EG')}]</span>
        <span style="color: ${log.eventType.includes('fail') ? '#dc3545' : '#28a745'};">${log.eventType}</span>
        <span style="color: #666;">${JSON.stringify(log.data)}</span>
      </div>
    `).join('');
  } catch (error) {
    console.error('[Options] Could not load logs:', error);
    logsDisplay.innerHTML = '<p style="color: #dc3545;">فشل تحميل السجلات</p>';
  }
}

async function clearLogs() {
  if (!confirm('هل أنت متأكد من مسح جميع السجلات؟')) return;
  
  try {
    await chrome.storage.local.set({ eventLogs: [] });
    loadLogs();
    showNotification('تم مسح السجلات بنجاح', 'success');
  } catch (error) {
    console.error('[Options] Could not clear logs:', error);
    showNotification('فشل مسح السجلات', 'error');
  }
}

async function exportLogs() {
  try {
    const result = await chrome.storage.local.get('eventLogs');
    const logs = result.eventLogs || [];
    
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `auto-interactor-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    
    showNotification('تم تصدير السجلات بنجاح', 'success');
  } catch (error) {
    console.error('[Options] Could not export logs:', error);
    showNotification('فشل تصدير السجلات', 'error');
  }
}

// ==================== Notifications ====================
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#667eea'};
    color: white;
    padding: 15px 30px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 1000;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    animation: slideDown 0.3s ease;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ==================== Global Functions for Inline Handlers ====================
window.toggleRule = toggleRule;
window.deleteRule = deleteRule;
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;

console.log('[Options] Script loaded');
