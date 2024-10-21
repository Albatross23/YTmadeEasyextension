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