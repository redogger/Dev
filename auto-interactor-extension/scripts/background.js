/**
 * Background Service Worker - Auto Interactor Pro
 * 
 * المسؤوليات:
 * - إدارة أحداث التنقل بين الصفحات
 * - جدولة المهام التلقائية باستخدام Alarms
 * - معالجة الرسائل من Content Scripts و Popup
 * - تجاوز CSP عبر طلبات الوكيل
 * - إدارة حالة التبويبات المتعددة
 */

// ==================== State Management ====================
const tabStates = new Map();
let globalSettings = {};

// تحميل الإعدادات عند بدء التشغيل
chrome.storage.sync.get(null, (data) => {
  globalSettings = data;
  console.log('[Background] Settings loaded:', globalSettings);
});

// الاستماع لتغييرات الإعدادات
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    Object.keys(changes).forEach(key => {
      globalSettings[key] = changes[key].newValue;
    });
    console.log('[Background] Settings updated:', globalSettings);
  }
});

// ==================== Web Navigation Events ====================
chrome.webNavigation.onCompleted.addListener(async (details) => {
  // تجاهل الإطارات الفرعية ما لم يكن مطلوباً
  if (details.frameId !== 0 && !globalSettings.monitorAllFrames) return;
  
  const tabId = details.tabId;
  const url = details.url;
  
  console.log(`[Background] Page loaded: ${url}`);
  
  // تحديث حالة التبويب
  updateTabState(tabId, {
    lastLoaded: Date.now(),
    url: url,
    status: 'loaded'
  });
  
  // التحقق من القواعد المطبقة
  await applyAutoRules(tabId, url);
  
  // إرسال إشعار لـ Content Script
  try {
    await chrome.tabs.sendMessage(tabId, {
      action: 'pageLoaded',
      url: url,
      settings: globalSettings
    });
  } catch (e) {
    console.warn('[Background] Could not send message to content script:', e);
  }
});

// مراقبة بدء التحميل
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) return;
  
  const tabId = details.tabId;
  updateTabState(tabId, {
    status: 'loading',
    navigatingTo: details.url
  });
});

// ==================== Tab State Management ====================
function updateTabState(tabId, updates) {
  const currentState = tabStates.get(tabId) || {};
  tabStates.set(tabId, { ...currentState, ...updates });
}

function getTabState(tabId) {
  return tabStates.get(tabId) || {};
}

// تنظيف حالة التبويب عند إغلاقه
chrome.tabs.onRemoved.addListener((tabId) => {
  tabStates.delete(tabId);
  console.log(`[Background] Tab ${tabId} closed, state cleaned`);
});

// ==================== Auto Rules Application ====================
async function applyAutoRules(tabId, url) {
  const rules = globalSettings.autoRules || [];
  
  for (const rule of rules) {
    if (!rule.enabled) continue;
    
    // التحقق من تطابق URL
    if (!matchUrlPattern(url, rule.urlPattern)) continue;
    
    console.log(`[Background] Applying rule: ${rule.name}`);
    
    // تأخير بسيط لضمان اكتمال تحميل الصفحة
    const delay = rule.delay || 1000;
    await sleep(delay);
    
    // إرسال الأمر لـ Content Script
    try {
      await chrome.tabs.sendMessage(tabId, {
        action: 'executeRule',
        rule: rule
      });
    } catch (e) {
      console.error(`[Background] Failed to execute rule ${rule.name}:`, e);
    }
    
    // إذا كانت القاعدة لمرة واحدة فقط
    if (rule.onceOnly) {
      rule.enabled = false;
      await saveSettings();
    }
  }
}

function matchUrlPattern(url, pattern) {
  if (!pattern) return true;
  
  // دعم الأنماط البسيطة والـ Regex
  if (pattern.startsWith('/') && pattern.endsWith('/')) {
    const regex = new RegExp(pattern.slice(1, -1));
    return regex.test(url);
  }
  
  // نمط بسيط يحتوي على *
  if (pattern.includes('*')) {
    const regexPattern = pattern.replace(/\*/g, '.*');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(url);
  }
  
  return url.includes(pattern);
}

// ==================== Alarms & Scheduling ====================
// إنشاء منبه دوري
chrome.alarms.create('periodicTask', {
  periodInMinutes: globalSettings.taskInterval || 5
});

chrome.alarms.create('dailyTask', {
  when: Date.now() + 1000,
  periodInMinutes: 24 * 60
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log(`[Background] Alarm triggered: ${alarm.name}`);
  
  if (alarm.name === 'periodicTask') {
    await executePeriodicTasks();
  } else if (alarm.name === 'dailyTask') {
    await executeDailyTasks();
  }
});

async function executePeriodicTasks() {
  const tasks = globalSettings.periodicTasks || [];
  
  for (const task of tasks) {
    if (!task.enabled) continue;
    
    console.log(`[Background] Executing periodic task: ${task.name}`);
    
    // تنفيذ المهمة على جميع التبويبات النشطة
    const tabs = await chrome.tabs.query({ active: true });
    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'executeTask',
          task: task
        });
      } catch (e) {
        console.warn(`[Background] Failed to execute task on tab ${tab.id}:`, e);
      }
    }
  }
}

async function executeDailyTasks() {
  const tasks = globalSettings.dailyTasks || [];
  
  for (const task of tasks) {
    if (!task.enabled) continue;
    
    console.log(`[Background] Executing daily task: ${task.name}`);
    
    // تسجيل المهمة
    await logEvent('daily_task', { task: task.name, timestamp: Date.now() });
  }
}

// ==================== Message Passing ====================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Background] Message received:', message);
  
  handleMessage(message, sender)
    .then(response => sendResponse(response))
    .catch(error => {
      console.error('[Background] Error handling message:', error);
      sendResponse({ error: error.message });
    });
  
  return true; // Keep channel open for async response
});

async function handleMessage(message, sender) {
  switch (message.action) {
    case 'getSettings':
      return { settings: globalSettings };
    
    case 'updateSettings':
      await chrome.storage.sync.set(message.settings);
      globalSettings = { ...globalSettings, ...message.settings };
      return { success: true };
    
    case 'executeAction':
      return await executeActionOnTab(message.tabId, message.actionData);
    
    case 'proxyRequest':
      return await proxyRequest(message.url, message.options);
    
    case 'logEvent':
      await logEvent(message.eventType, message.data);
      return { success: true };
    
    case 'getTabState':
      return { state: getTabState(message.tabId) };
    
    case 'startMonitoring':
      await startMonitoring(message.tabId, message.config);
      return { success: true };
    
    case 'stopMonitoring':
      await stopMonitoring(message.tabId);
      return { success: true };
    
    default:
      throw new Error(`Unknown action: ${message.action}`);
  }
}

// ==================== Action Execution ====================
async function executeActionOnTab(tabId, actionData) {
  const { type, selector, value, options = {} } = actionData;
  
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: executeDOMAction,
      args: [{ type, selector, value, options }]
    });
    
    return { success: true, results };
  } catch (error) {
    console.error('[Background] Execute action failed:', error);
    return { success: false, error: error.message };
  }
}

// دالة تُنفذ في سياق الصفحة
function executeDOMAction({ type, selector, value, options }) {
  const element = document.querySelector(selector);
  
  if (!element) {
    return { found: false, message: 'Element not found' };
  }
  
  switch (type) {
    case 'click':
      element.click();
      return { success: true, action: 'clicked' };
    
    case 'fill':
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      return { success: true, action: 'filled' };
    
    case 'extract':
      return { 
        success: true, 
        action: 'extracted',
        data: options.extractType === 'text' ? element.textContent : element.innerHTML
      };
    
    case 'scroll':
      element.scrollIntoView({ behavior: 'smooth' });
      return { success: true, action: 'scrolled' };
    
    default:
      return { success: false, message: 'Unknown action type' };
  }
}

// ==================== CSP Bypass via Proxy ====================
async function proxyRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      mode: 'cors'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.text();
    return { success: true, data };
  } catch (error) {
    console.error('[Background] Proxy request failed:', error);
    return { success: false, error: error.message };
  }
}

// ==================== Monitoring System ====================
const monitoringSessions = new Map();

async function startMonitoring(tabId, config) {
  if (monitoringSessions.has(tabId)) {
    clearInterval(monitoringSessions.get(tabId));
  }
  
  const intervalId = setInterval(async () => {
    try {
      const result = await chrome.scripting.executeScript({
        target: { tabId },
        func: checkMonitoringConditions,
        args: [config]
      });
      
      if (result[0]?.result?.triggered) {
        await handleMonitoringTrigger(tabId, config);
      }
    } catch (error) {
      console.warn(`[Background] Monitoring error on tab ${tabId}:`, error);
    }
  }, config.interval || 5000);
  
  monitoringSessions.set(tabId, intervalId);
  console.log(`[Background] Monitoring started on tab ${tabId}`);
}

function checkMonitoringConditions(config) {
  const { selectors, conditions } = config;
  
  for (const selectorConfig of selectors) {
    const element = document.querySelector(selectorConfig.selector);
    
    if (!element && selectorConfig.expectPresence) {
      return { triggered: true, reason: 'Element missing' };
    }
    
    if (element && !selectorConfig.expectPresence) {
      return { triggered: true, reason: 'Unexpected element' };
    }
    
    if (element && selectorConfig.expectedText) {
      const actualText = element.textContent.trim();
      if (actualText !== selectorConfig.expectedText) {
        return { triggered: true, reason: 'Text mismatch' };
      }
    }
  }
  
  return { triggered: false };
}

async function handleMonitoringTrigger(tabId, config) {
  console.log(`[Background] Monitoring trigger on tab ${tabId}`);
  
  // تسجيل الحدث
  await logEvent('monitoring_trigger', {
    tabId,
    config: config.name,
    timestamp: Date.now()
  });
  
  // تنفيذ الإجراءات المحددة
  if (config.actions) {
    for (const action of config.actions) {
      await executeActionOnTab(tabId, action);
    }
  }
  
  // إرسال إشعار
  if (config.notify) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Auto Interactor Alert',
      message: `Trigger: ${config.name || 'Monitoring condition met'}`
    });
  }
}

async function stopMonitoring(tabId) {
  const intervalId = monitoringSessions.get(tabId);
  if (intervalId) {
    clearInterval(intervalId);
    monitoringSessions.delete(tabId);
    console.log(`[Background] Monitoring stopped on tab ${tabId}`);
  }
}

// ==================== Event Logging ====================
async function logEvent(eventType, data) {
  const logEntry = {
    eventType,
    data,
    timestamp: Date.now()
  };
  
  // حفظ في التخزين المحلي
  const existingLogs = await chrome.storage.local.get('eventLogs');
  const logs = existingLogs.eventLogs || [];
  
  // الاحتفاظ بآخر 1000 حدث فقط
  logs.unshift(logEntry);
  if (logs.length > 1000) {
    logs.pop();
  }
  
  await chrome.storage.local.set({ eventLogs: logs });
}

// ==================== Utility Functions ====================
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function saveSettings() {
  await chrome.storage.sync.set(globalSettings);
}

// ==================== Context Menus ====================
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'autoInteractor',
    title: 'Auto Interactor Pro',
    contexts: ['all']
  });
  
  chrome.contextMenus.create({
    id: 'autoClick',
    parentId: 'autoInteractor',
    title: 'Auto-click this element',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'extractData',
    parentId: 'autoInteractor',
    title: 'Extract data from selection',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'monitorElement',
    parentId: 'autoInteractor',
    title: 'Monitor this element',
    contexts: ['editable', 'selection']
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'autoClick') {
    await chrome.tabs.sendMessage(tab.id, {
      action: 'addAutoClickRule',
      selection: info.selectionText
    });
  } else if (info.menuItemId === 'extractData') {
    await chrome.tabs.sendMessage(tab.id, {
      action: 'extractSelection',
      selection: info.selectionText
    });
  } else if (info.menuItemId === 'monitorElement') {
    await chrome.tabs.sendMessage(tab.id, {
      action: 'startElementMonitoring',
      selection: info.selectionText
    });
  }
});

console.log('[Background] Service Worker initialized');
