/**
 * Popup Script - Auto Interactor Pro
 * 
 * المسؤوليات:
 * - واجهة المستخدم للتفاعل السريع
 * - عرض حالة النظام
 * - التحكم في القواعد والمهام
 * - عرض السجلات الحديثة
 */

let currentTabId = null;
let settings = {};
let isPaused = false;

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Popup] Initialized');
  
  // الحصول على التبويب الحالي
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTabId = tab.id;
  
  // تحميل الإعدادات
  await loadSettings();
  
  // تحديث الواجهة
  updateUI();
  
  // تحميل السجلات
  await loadRecentLogs();
  
  // إعداد مستمعي الأحداث
  setupEventListeners();
});

// ==================== Settings Management ====================
async function loadSettings() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
    settings = response.settings || {};
    console.log('[Popup] Settings loaded:', settings);
  } catch (error) {
    console.warn('[Popup] Could not load settings:', error);
    settings = getDefaultSettings();
  }
}

function getDefaultSettings() {
  return {
    enabled: true,
    autoRules: [],
    periodicTasks: [],
    enableLogging: true,
    taskInterval: 5
  };
}

async function saveSettings(updates) {
  try {
    await chrome.runtime.sendMessage({
      action: 'updateSettings',
      settings: updates
    });
    settings = { ...settings, ...updates };
  } catch (error) {
    console.error('[Popup] Could not save settings:', error);
  }
}

// ==================== UI Updates ====================
function updateUI() {
  // تحديث حالة النظام
  const globalStatusEl = document.getElementById('globalStatus');
  const rulesCountEl = document.getElementById('rulesCount');
  const tabStatusEl = document.getElementById('tabStatus');
  
  if (globalStatusEl) {
    globalStatusEl.textContent = settings.enabled ? 'نشط' : 'متوقف';
    globalStatusEl.className = `status-value ${settings.enabled ? 'active' : 'inactive'}`;
  }
  
  if (rulesCountEl) {
    const rulesCount = (settings.autoRules || []).filter(r => r.enabled).length;
    rulesCountEl.textContent = rulesCount;
  }
  
  if (tabStatusEl && currentTabId) {
    tabStatusEl.textContent = `ID: ${currentTabId}`;
  }
  
  // تحديث زر الإيقاف المؤقت
  const toggleBtn = document.getElementById('btnToggle');
  if (toggleBtn) {
    toggleBtn.textContent = isPaused ? '▶️ استئناف' : '⏸️ إيقاف مؤقت';
    toggleBtn.className = isPaused ? 'btn btn-success' : 'btn btn-primary';
  }
}

async function loadRecentLogs() {
  try {
    const result = await chrome.storage.local.get('eventLogs');
    const logs = result.eventLogs || [];
    
    const logContainer = document.getElementById('logContainer');
    if (!logContainer) return;
    
    logContainer.innerHTML = '';
    
    const recentLogs = logs.slice(0, 10);
    
    if (recentLogs.length === 0) {
      logContainer.innerHTML = '<div class="log-entry">لا توجد سجلات حديثة</div>';
      return;
    }
    
    recentLogs.forEach(log => {
      const entry = document.createElement('div');
      entry.className = `log-entry ${log.eventType.includes('fail') ? 'error' : 'success'}`;
      
      const time = new Date(log.timestamp).toLocaleTimeString('ar-EG');
      entry.textContent = `[${time}] ${formatEventType(log.eventType)}`;
      
      logContainer.appendChild(entry);
    });
  } catch (error) {
    console.warn('[Popup] Could not load logs:', error);
  }
}

function formatEventType(type) {
  const eventNames = {
    'page_load': '📄 تحميل صفحة',
    'task_executed': '✅ مهمة منفذة',
    'task_failed': '❌ فشل المهمة',
    'rule_action_failed': '⚠️ فشل الإجراء',
    'content_initialized': '🚀 تهيئة المحتوى',
    'element_changed': '👁️ تغير العنصر',
    'element_missing': '👁️ اختفاء العنصر',
    'monitoring_trigger': '🔔 تنبيه المراقبة'
  };
  
  return eventNames[type] || type;
}

// ==================== Event Listeners ====================
function setupEventListeners() {
  // زر الإيقاف المؤقت
  const toggleBtn = document.getElementById('btnToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', togglePause);
  }
  
  // زر تشغيل القاعدة
  const runRuleBtn = document.getElementById('btnRunRule');
  if (runRuleBtn) {
    runRuleBtn.addEventListener('click', runCurrentRule);
  }
  
  // زر الإعدادات
  const optionsBtn = document.getElementById('btnOptions');
  if (optionsBtn) {
    optionsBtn.addEventListener('click', openOptions);
  }
  
  // زر مسح السجلات
  const clearLogsBtn = document.getElementById('btnClearLogs');
  if (clearLogsBtn) {
    clearLogsBtn.addEventListener('click', clearLogs);
  }
  
  // الأزرار السريعة
  const btnClick = document.getElementById('btnClick');
  if (btnClick) {
    btnClick.addEventListener('click', () => quickAction('click'));
  }
  
  const btnFill = document.getElementById('btnFill');
  if (btnFill) {
    btnFill.addEventListener('click', () => quickAction('fill'));
  }
  
  const btnExtract = document.getElementById('btnExtract');
  if (btnExtract) {
    btnExtract.addEventListener('click', () => quickAction('extract'));
  }
  
  const btnMonitor = document.getElementById('btnMonitor');
  if (btnMonitor) {
    btnMonitor.addEventListener('click', () => quickAction('monitor'));
  }
  
  // رابط فتح الإعدادات
  const openOptionsLink = document.getElementById('openOptions');
  if (openOptionsLink) {
    openOptionsLink.addEventListener('click', (e) => {
      e.preventDefault();
      openOptions();
    });
  }
}

// ==================== Actions ====================
async function togglePause() {
  isPaused = !isPaused;
  
  await saveSettings({ enabled: !isPaused });
  updateUI();
  
  // إعلام Content Script
  try {
    await chrome.tabs.sendMessage(currentTabId, {
      action: 'setPaused',
      paused: isPaused
    });
  } catch (error) {
    console.warn('[Popup] Could not send pause state:', error);
  }
}

async function runCurrentRule() {
  if (!currentTabId) return;
  
  const enabledRules = (settings.autoRules || []).filter(r => r.enabled);
  
  if (enabledRules.length === 0) {
    alert('لا توجد قواعد مفعلة لتشغيلها');
    return;
  }
  
  // تشغيل أول قاعدة مفعالة
  const rule = enabledRules[0];
  
  try {
    await chrome.tabs.sendMessage(currentTabId, {
      action: 'executeRule',
      rule: rule
    });
    
    showNotification('تم بدء تنفيذ القاعدة', 'success');
  } catch (error) {
    console.error('[Popup] Rule execution failed:', error);
    showNotification('فشل تنفيذ القاعدة', 'error');
  }
}

function openOptions() {
  chrome.runtime.openOptionsPage();
}

async function clearLogs() {
  try {
    await chrome.storage.local.set({ eventLogs: [] });
    await loadRecentLogs();
    showNotification('تم مسح السجلات', 'success');
  } catch (error) {
    console.error('[Popup] Could not clear logs:', error);
    showNotification('فشل مسح السجلات', 'error');
  }
}

async function quickAction(actionType) {
  if (!currentTabId) return;
  
  switch (actionType) {
    case 'click':
      await initiateAutoClick();
      break;
    case 'fill':
      await initiateFormFill();
      break;
    case 'extract':
      await initiateExtraction();
      break;
    case 'monitor':
      await initiateMonitoring();
      break;
  }
}

async function initiateAutoClick() {
  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: currentTabId },
      func: () => {
        const clickableElements = document.querySelectorAll('button, a, input[type="button"], input[type="submit"], [role="button"]');
        
        if (clickableElements.length === 0) {
          return { count: 0, message: 'No clickable elements found' };
        }
        
        // النقر على أول عنصر قابل للنقر
        const firstElement = clickableElements[0];
        firstElement.click();
        
        return { 
          count: clickableElements.length,
          clicked: firstElement.tagName,
          message: `Clicked first element. Found ${clickableElements.length} clickable elements.`
        };
      }
    });
    
    console.log('[Popup] Auto-click result:', result);
    showNotification(`تم النقر على عنصر (${result[0]?.result?.count} عناصر متاحة)`, 'success');
  } catch (error) {
    console.error('[Popup] Auto-click failed:', error);
    showNotification('فشل النقر التلقائي', 'error');
  }
}

async function initiateFormFill() {
  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: currentTabId },
      func: () => {
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
        
        if (inputs.length === 0) {
          return { count: 0, message: 'No input fields found' };
        }
        
        // ملء أول حقل
        const firstInput = inputs[0];
        firstInput.value = 'Test Value';
        firstInput.dispatchEvent(new Event('input', { bubbles: true }));
        firstInput.dispatchEvent(new Event('change', { bubbles: true }));
        
        return { 
          count: inputs.length,
          filled: firstInput.type,
          message: `Filled first input. Found ${inputs.length} input fields.`
        };
      }
    });
    
    console.log('[Popup] Form fill result:', result);
    showNotification(`تم ملء حقل (${result[0]?.result?.count} حقول متاحة)`, 'success');
  } catch (error) {
    console.error('[Popup] Form fill failed:', error);
    showNotification('فشل ملء النموذج', 'error');
  }
}

async function initiateExtraction() {
  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: currentTabId },
      func: () => {
        const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent.trim());
        const paragraphs = Array.from(document.querySelectorAll('p')).slice(0, 5).map(p => p.textContent.trim());
        const links = Array.from(document.querySelectorAll('a')).slice(0, 10).map(a => ({
          text: a.textContent.trim(),
          href: a.href
        }));
        
        return {
          headings: headings.slice(0, 5),
          paragraphs: paragraphs,
          links: links,
          url: window.location.href,
          title: document.title
        };
      }
    });
    
    console.log('[Popup] Extraction result:', result);
    
    // عرض النتائج في نافذة منبثقة
    const data = result[0]?.result;
    if (data) {
      alert(`عنوان الصفحة: ${data.title}\n\nالعناوين الرئيسية:\n${data.headings.join('\n')}\n\nعدد الروابط: ${data.links.length}`);
    }
    
    showNotification('تم استخراج البيانات بنجاح', 'success');
  } catch (error) {
    console.error('[Popup] Extraction failed:', error);
    showNotification('فشل استخراج البيانات', 'error');
  }
}

async function initiateMonitoring() {
  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: currentTabId },
      func: () => {
        const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
        
        return {
          count: interactiveElements.length,
          url: window.location.href,
          message: `Found ${interactiveElements.length} interactive elements to monitor`
        };
      }
    });
    
    console.log('[Popup] Monitoring initiated:', result);
    
    // بدء جلسة المراقبة
    await chrome.runtime.sendMessage({
      action: 'startMonitoring',
      tabId: currentTabId,
      config: {
        name: 'Quick Monitor',
        interval: 5000,
        selectors: [],
        notify: true
      }
    });
    
    showNotification(`تم بدء المراقبة (${result[0]?.result?.count} عنصر)`, 'success');
  } catch (error) {
    console.error('[Popup] Monitoring failed:', error);
    showNotification('فشل بدء المراقبة', 'error');
  }
}

function showNotification(message, type = 'info') {
  // إنشاء إشعار مؤقت في الـ Popup
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#667eea'};
    color: white;
    padding: 10px 20px;
    border-radius: 6px;
    font-size: 13px;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    animation: slideDown 0.3s ease;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// إضافة أنيميشن للإشعارات
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
  
  @keyframes slideUp {
    from {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    to {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
  }
`;
document.head.appendChild(style);

// ==================== Tab Updates ====================
chrome.tabs.onActivated.addListener(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTabId = tab.id;
  updateUI();
  await loadRecentLogs();
});

console.log('[Popup] Script loaded');
