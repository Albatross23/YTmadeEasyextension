
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getShortcuts") {
        chrome.storage.sync.get(['speedUpShortcut', 'speedDownShortcut', 'pictureInPictureShortcut', 'toggleSuggestionsShortcut' , 'playbackSpeed'], (data) => {
            sendResponse(data);
        });
        return true; 
    } else if (request.action === "savePlaybackSpeed") {
        chrome.storage.sync.set({ playbackSpeed: request.playbackSpeed });
        sendResponse({ status: "success" });
    }
});
