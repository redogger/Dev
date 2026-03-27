/**
 * Content Script - Auto Interactor Pro
 * 
 * المسؤوليات:
 * - التفاعل المباشر مع DOM
 * - تنفيذ القواعد التلقائية
 * - محاكاة النقرات وملء النماذج
 * - استخراج البيانات
 * - التواصل مع Background Worker
 */

// ==================== Initialization ====================
let localSettings = {};
let isInitialized = false;

// تحميل الإعدادات المحلية
async function loadLocalSettings() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
    localSettings = response.settings || {};
    console.log('[Content] Settings loaded:', localSettings);
  } catch (error) {
    console.warn('[Content] Could not load settings:', error);
    localSettings = getDefaultSettings();
  }
}

function getDefaultSettings() {
  return {
    autoClickDelay: 1000,
    formFillSpeed: 'normal',
    enableLogging: true,
    maxRetries: 3,
    retryDelay: 2000
  };
}

// ==================== Message Listener ====================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Content] Message received:', message);
  
  handleMessage(message)
    .then(response => sendResponse(response))
    .catch(error => {
      console.error('[Content] Error handling message:', error);
      sendResponse({ error: error.message });
    });
  
  return true; // Keep channel open for async response
});

async function handleMessage(message) {
  switch (message.action) {
    case 'pageLoaded':
      await handlePageLoaded(message.url, message.settings);
      return { success: true };
    
    case 'executeRule':
      return await executeRule(message.rule);
    
    case 'executeTask':
      return await executeTask(message.task);
    
    case 'addAutoClickRule':
      return await addAutoClickRule(message.selection);
    
    case 'extractSelection':
      return await extractSelection(message.selection);
    
    case 'startElementMonitoring':
      return await startElementMonitoring(message.selection);
    
    case 'clickElement':
      return await clickElement(message.selector, message.options);
    
    case 'fillForm':
      return await fillForm(message.fields, message.options);
    
    case 'extractData':
      return await extractData(message.selectors, message.options);
    
    case 'waitForElement':
      return await waitForElement(message.selector, message.timeout);
    
    default:
      throw new Error(`Unknown action: ${message.action}`);
  }
}

// ==================== Page Load Handler ====================
async function handlePageLoaded(url, settings) {
  if (settings) {
    localSettings = { ...localSettings, ...settings };
  }
  
  console.log(`[Content] Page loaded: ${url}`);
  
  // تسجيل حدث تحميل الصفحة
  if (localSettings.enableLogging) {
    await logEvent('page_load', { url, timestamp: Date.now() });
  }
  
  // تنفيذ الإجراءات التلقائية المحددة للصفحة
  await executePageSpecificActions(url);
}

async function executePageSpecificActions(url) {
  const pageActions = localSettings.pageActions || [];
  
  for (const action of pageActions) {
    if (!action.enabled) continue;
    
    if (matchUrlPattern(url, action.urlPattern)) {
      console.log(`[Content] Executing page action: ${action.name}`);
      
      if (action.delay) {
        await sleep(action.delay);
      }
      
      await executeAction(action);
    }
  }
}

// ==================== Rule Execution ====================
async function executeRule(rule) {
  console.log(`[Content] Executing rule: ${rule.name}`);
  
  const actions = rule.actions || [];
  
  for (const action of actions) {
    try {
      await executeAction(action);
      
      if (action.delayBetween) {
        await sleep(action.delayBetween);
      }
    } catch (error) {
      console.error(`[Content] Action failed: ${action.type}`, error);
      
      if (localSettings.enableLogging) {
        await logEvent('rule_action_failed', {
          rule: rule.name,
          action: action.type,
          error: error.message
        });
      }
      
      // إعادة المحاولة إذا تم التمكين
      if (action.retries > 0) {
        await retryAction(action, action.retries);
      }
    }
  }
  
  return { success: true, ruleName: rule.name };
}

async function executeAction(action) {
  const { type, selector, value, xpath, options = {} } = action;
  
  let element;
  
  // الحصول على العنصر باستخدام selector أو xpath
  if (xpath) {
    element = getElementByXPath(xpath);
  } else if (selector) {
    element = document.querySelector(selector);
  }
  
  switch (type) {
    case 'click':
      return await clickElement(element, options);
    
    case 'fill':
      return await fillField(element, value, options);
    
    case 'fillForm':
      return await fillFormFields(action.fields, options);
    
    case 'extract':
      return await extractFromElement(element, options);
    
    case 'scroll':
      return await scrollToElement(element, options);
    
    case 'hover':
      return await hoverOverElement(element, options);
    
    case 'select':
      return await selectOption(element, value, options);
    
    case 'check':
      return await checkElement(element, value, options);
    
    case 'wait':
      return await sleep(options.duration || 1000);
    
    case 'navigate':
      window.location.href = value;
      return { success: true, action: 'navigate' };
    
    case 'refresh':
      window.location.reload();
      return { success: true, action: 'refresh' };
    
    case 'custom':
      return await executeCustomCode(options.code);
    
    default:
      throw new Error(`Unknown action type: ${type}`);
  }
}

// ==================== Task Execution ====================
async function executeTask(task) {
  console.log(`[Content] Executing task: ${task.name}`);
  
  try {
    const result = await executeRule(task);
    
    if (localSettings.enableLogging) {
      await logEvent('task_executed', {
        task: task.name,
        timestamp: Date.now()
      });
    }
    
    return result;
  } catch (error) {
    console.error(`[Content] Task failed: ${task.name}`, error);
    
    if (localSettings.enableLogging) {
      await logEvent('task_failed', {
        task: task.name,
        error: error.message,
        timestamp: Date.now()
      });
    }
    
    throw error;
  }
}

// ==================== Element Actions ====================
async function clickElement(element, options = {}) {
  if (!element) {
    throw new Error('Element not found for click');
  }
  
  const { simulateHuman = true, delay = 0 } = options;
  
  if (delay > 0) {
    await sleep(delay);
  }
  
  if (simulateHuman) {
    // محاكاة النقر البشري
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await sleep(100 + Math.random() * 200);
    
    element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    await sleep(50 + Math.random() * 100);
    
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await sleep(50 + Math.random() * 100);
    
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    element.click();
  } else {
    element.click();
  }
  
  console.log('[Content] Element clicked:', element);
  return { success: true, action: 'clicked' };
}

async function fillField(element, value, options = {}) {
  if (!element) {
    throw new Error('Element not found for fill');
  }
  
  const { speed = 'normal', clearFirst = true } = options;
  
  if (clearFirst) {
    element.value = '';
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  // محاكاة الكتابة البشرية
  if (speed === 'human') {
    for (const char of value) {
      element.value += char;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      await sleep(50 + Math.random() * 100);
    }
  } else {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
  
  console.log('[Content] Field filled:', element);
  return { success: true, action: 'filled' };
}

async function fillFormFields(fields, options = {}) {
  const results = [];
  
  for (const field of fields) {
    try {
      const element = document.querySelector(field.selector) || 
                     getElementByXPath(field.xpath);
      
      if (element) {
        const result = await fillField(element, field.value, options);
        results.push({ selector: field.selector, success: true });
        
        if (field.delayBetween) {
          await sleep(field.delayBetween);
        }
      } else {
        results.push({ selector: field.selector, success: false, error: 'Not found' });
      }
    } catch (error) {
      results.push({ selector: field.selector, success: false, error: error.message });
    }
  }
  
  return { success: true, results };
}

async function extractFromElement(element, options = {}) {
  if (!element) {
    throw new Error('Element not found for extraction');
  }
  
  const { extractType = 'text', attribute = null } = options;
  
  let data;
  
  switch (extractType) {
    case 'text':
      data = element.textContent.trim();
      break;
    case 'html':
      data = element.innerHTML;
      break;
    case 'attribute':
      data = element.getAttribute(attribute);
      break;
    case 'value':
      data = element.value;
      break;
    case 'all':
      data = {
        text: element.textContent.trim(),
        html: element.innerHTML,
        attributes: Array.from(element.attributes).reduce((acc, attr) => {
          acc[attr.name] = attr.value;
          return acc;
        }, {})
      };
      break;
    default:
      data = element.textContent.trim();
  }
  
  return { success: true, action: 'extracted', data };
}

async function scrollToElement(element, options = {}) {
  if (!element) {
    throw new Error('Element not found for scroll');
  }
  
  const { behavior = 'smooth', block = 'center' } = options;
  
  element.scrollIntoView({ behavior, block });
  
  return { success: true, action: 'scrolled' };
}

async function hoverOverElement(element, options = {}) {
  if (!element) {
    throw new Error('Element not found for hover');
  }
  
  element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
  element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
  
  return { success: true, action: 'hovered' };
}

async function selectOption(element, value, options = {}) {
  if (!element) {
    throw new Error('Element not found for select');
  }
  
  if (element.tagName !== 'SELECT') {
    throw new Error('Element is not a SELECT element');
  }
  
  const option = Array.from(element.options).find(opt => 
    opt.value === value || opt.textContent === value
  );
  
  if (!option) {
    throw new Error('Option not found');
  }
  
  element.value = option.value;
  element.dispatchEvent(new Event('change', { bubbles: true }));
  
  return { success: true, action: 'selected', value: option.value };
}

async function checkElement(element, value, options = {}) {
  if (!element) {
    throw new Error('Element not found for check');
  }
  
  const shouldCheck = value !== undefined ? value : !element.checked;
  
  element.checked = shouldCheck;
  element.dispatchEvent(new Event('change', { bubbles: true }));
  
  return { success: true, action: shouldCheck ? 'checked' : 'unchecked' };
}

// ==================== Data Extraction ====================
async function extractData(selectors, options = {}) {
  const results = {};
  
  for (const [key, selectorConfig] of Object.entries(selectors)) {
    try {
      const selector = typeof selectorConfig === 'string' 
        ? selectorConfig 
        : selectorConfig.selector;
      
      const extractOptions = typeof selectorConfig === 'object' 
        ? selectorConfig 
        : options;
      
      const element = document.querySelector(selector) || 
                     getElementByXPath(selectorConfig.xpath);
      
      if (element) {
        const extracted = await extractFromElement(element, extractOptions);
        results[key] = extracted.data;
      } else {
        results[key] = null;
      }
    } catch (error) {
      results[key] = { error: error.message };
    }
  }
  
  return { success: true, data: results };
}

async function extractSelection(selectionText) {
  const selectedText = selectionText || window.getSelection().toString();
  
  if (!selectedText) {
    return { success: false, error: 'No selection found' };
  }
  
  return { 
    success: true, 
    data: {
      text: selectedText,
      length: selectedText.length
    }
  };
}

// ==================== Auto-Click Rules ====================
async function addAutoClickRule(selectionText) {
  const element = getSelectedElement();
  
  if (!element) {
    return { success: false, error: 'No element selected' };
  }
  
  const selector = generateSelector(element);
  
  // إضافة القاعدة للإعدادات
  const newRule = {
    name: `Auto-click: ${selectionText || selector}`,
    enabled: true,
    urlPattern: window.location.origin,
    actions: [{
      type: 'click',
      selector: selector,
      delayBetween: 2000
    }]
  };
  
  // حفظ القاعدة
  await chrome.runtime.sendMessage({
    action: 'updateSettings',
    settings: {
      autoRules: [...(localSettings.autoRules || []), newRule]
    }
  });
  
  return { success: true, selector, rule: newRule };
}

// ==================== Monitoring ====================
let monitoringInterval = null;

async function startElementMonitoring(selectionText) {
  const element = getSelectedElement();
  
  if (!element) {
    return { success: false, error: 'No element selected' };
  }
  
  const selector = generateSelector(element);
  const initialState = element.textContent.trim();
  
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
  }
  
  monitoringInterval = setInterval(() => {
    const currentElement = document.querySelector(selector);
    
    if (!currentElement) {
      console.log('[Content] Monitored element disappeared');
      chrome.runtime.sendMessage({
        action: 'logEvent',
        eventType: 'element_missing',
        data: { selector }
      });
      return;
    }
    
    const currentState = currentElement.textContent.trim();
    
    if (currentState !== initialState) {
      console.log('[Content] Monitored element changed:', currentState);
      chrome.runtime.sendMessage({
        action: 'logEvent',
        eventType: 'element_changed',
        data: { selector, oldValue: initialState, newValue: currentState }
      });
    }
  }, 3000);
  
  return { success: true, selector, initialState };
}

// ==================== Wait Utilities ====================
async function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }
    
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout waiting for element: ${selector}`));
    }, timeout);
  });
}

// ==================== Custom Code Execution ====================
async function executeCustomCode(code) {
  try {
    const result = await eval(`(async () => { ${code} })()`);
    return { success: true, result };
  } catch (error) {
    console.error('[Content] Custom code execution failed:', error);
    return { success: false, error: error.message };
  }
}

// ==================== Helper Functions ====================
function getElementByXPath(xpath) {
  const result = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  );
  return result.singleNodeValue;
}

function getSelectedElement() {
  const selection = window.getSelection();
  if (selection.rangeCount === 0) return null;
  
  const range = selection.getRangeAt(0);
  const commonAncestor = range.commonAncestorContainer;
  
  if (commonAncestor.nodeType === Node.TEXT_NODE) {
    return commonAncestor.parentElement;
  }
  
  return commonAncestor;
}

function generateSelector(element) {
  if (element.id) {
    return `#${element.id}`;
  }
  
  if (element.className && typeof element.className === 'string') {
    const classes = element.className.split(' ').filter(c => c).join('.');
    if (classes) {
      return `${element.tagName.toLowerCase()}.${classes}`;
    }
  }
  
  // Fallback to nth-child
  const parent = element.parentElement;
  if (parent) {
    const siblings = Array.from(parent.children);
    const index = siblings.indexOf(element) + 1;
    return `${parent.tagName.toLowerCase()} > ${element.tagName.toLowerCase()}:nth-child(${index})`;
  }
  
  return element.tagName.toLowerCase();
}

function matchUrlPattern(url, pattern) {
  if (!pattern) return true;
  
  if (pattern.startsWith('/') && pattern.endsWith('/')) {
    const regex = new RegExp(pattern.slice(1, -1));
    return regex.test(url);
  }
  
  if (pattern.includes('*')) {
    const regexPattern = pattern.replace(/\*/g, '.*');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(url);
  }
  
  return url.includes(pattern);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryAction(action, retries) {
  for (let i = 0; i < retries; i++) {
    console.log(`[Content] Retrying action (${i + 1}/${retries})`);
    await sleep(localSettings.retryDelay || 2000);
    
    try {
      await executeAction(action);
      return { success: true };
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }
    }
  }
}

async function logEvent(eventType, data) {
  try {
    await chrome.runtime.sendMessage({
      action: 'logEvent',
      eventType,
      data
    });
  } catch (error) {
    console.warn('[Content] Could not log event:', error);
  }
}

// ==================== Initialization ====================
(async function init() {
  if (isInitialized) return;
  
  await loadLocalSettings();
  isInitialized = true;
  
  console.log('[Content] Auto Interactor Pro initialized');
  
  // تسجيل حدث التهيئة
  if (localSettings.enableLogging) {
    await logEvent('content_initialized', {
      url: window.location.href,
      timestamp: Date.now()
    });
  }
})();
