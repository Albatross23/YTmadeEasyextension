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

document.addEventListener('DOMContentLoaded', function () {
    updatePlaybackSpeed();
    setInterval(updatePlaybackSpeed, 1000);
});

function setNewShortcut() {
    const speedUpShortcut = document.getElementById("shortcut-1").value.trim();
    const speedDownShortcut = document.getElementById("shortcut-2").value.trim();
    const pictureInPictureShortcut = document.getElementById("shortcut-3").value.trim();
    const toggleSuggestionsShortcut = document.getElementById("shortcut-4").value.trim();

    chrome.storage.sync.set({
        speedUpShortcut: speedUpShortcut || ']',
        speedDownShortcut: speedDownShortcut || '[',
        pictureInPictureShortcut: pictureInPictureShortcut || 'p',
        toggleSuggestionsShortcut: toggleSuggestionsShortcut || 'h'
    }, () => {
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

    updatePlaybackSpeed();
    setInterval(updatePlaybackSpeed, 1000);
});

const button = document.getElementById("form-submit-button");
button.addEventListener('click', setNewShortcut);
