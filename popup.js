function updatePlaybackSpeed() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.scripting.executeScript(
            {
                target: { tabId: tabs[0].id },
                function: getPlaybackSpeed
            },
            (results) => {
                if (results && results[0] && results[0].result !== undefined) {
                    document.getElementById('speed').textContent = `Playback Speed: ${results[0].result.toFixed(2)}x`;
                } else {
                    document.getElementById('speed').textContent = 'No video found';
                }
            }
        );
    });
}

function getPlaybackSpeed() {
    const video = document.querySelector('video');
    return video ? video.playbackRate : undefined;
}

function handleKeyDown(event) {
    event.preventDefault();
    const input = event.target;
    let keys = [];
    
    if (event.altKey) keys.push('Alt');
    if (event.ctrlKey) keys.push('Ctrl');
    
    if (event.key !== 'Alt' && event.key !== 'Control') {
        keys.push(event.key);
    }

    if (keys.length > 0) {
        input.value = keys.join('+');
    }
}

function setNewShortcut() {
    const shortcuts = {
        speedUpShortcut: document.getElementById("shortcut-1").value.trim(),
        speedDownShortcut: document.getElementById("shortcut-2").value.trim(),
        pictureInPictureShortcut: document.getElementById("shortcut-3").value.trim(),
        toggleSuggestionsShortcut: document.getElementById("shortcut-4").value.trim()
    };

    chrome.storage.sync.set(shortcuts, () => {
        alert('Shortcuts updated!');
    });
}

document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.sync.get(['speedUpShortcut', 'speedDownShortcut', 'pictureInPictureShortcut', 'toggleSuggestionsShortcut'], (data) => {
        document.getElementById("shortcut-1").value = data.speedUpShortcut || ']';
        document.getElementById("shortcut-2").value = data.speedDownShortcut || '[';
        document.getElementById("shortcut-3").value = data.pictureInPictureShortcut || 'p';
        document.getElementById("shortcut-4").value = data.toggleSuggestionsShortcut || 'h';
    });

    const shortcutInputs = document.querySelectorAll('input[type="text"]');
    shortcutInputs.forEach(input => {
        input.addEventListener('keydown', handleKeyDown);
    });

    updatePlaybackSpeed();
    setInterval(updatePlaybackSpeed, 1000);
    
    document.getElementById("form-submit-button").addEventListener('click', setNewShortcut);
});