var processMap;
chrome.runtime.onMessageExternal.addListener(function (request, sender, sendResponse) {
    chrome.tabs.query({ active: true }, function (tabs) {
        chrome.processes.getProcessIdForTab(tabs[0].id, function (processId) {
            chrome.tabs.sendMessage(tabs[0].id, { process: processMap[processId] });
        });
    });
});

chrome.processes.onUpdatedWithMemory.addListener(function (processes) {
    processMap = processes;
});

console.log('reload extension');