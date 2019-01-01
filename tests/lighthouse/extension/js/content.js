chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    request['url'] = location.protocol + '//' + location.host + location.pathname;
    console.log('[PerformanceMonitor]', JSON.stringify(request));
});