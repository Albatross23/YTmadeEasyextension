let previousPlaybackRate = 1;

function getVideoElement() {
    return document.querySelector('video');
}

function getInputElement() {
    return document.querySelector('input');
}

function isInputActive(inputElement) {
    return document.activeElement === inputElement;  
}

function togglePictureInPicture(video) {
    if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
    } else if (video.requestPictureInPicture) {
        video.requestPictureInPicture();
    }
}

function createSpeedOverlay() {
    const overlay = document.getElementById('speed-overlay') || document.createElement('div');
    if (!overlay.id) {
        overlay.id = 'speed-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '10px';
        overlay.style.right = '10px';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        overlay.style.color = 'white';
        overlay.style.padding = '10px';
        overlay.style.borderRadius = '5px';
        overlay.style.zIndex = '9999';
        overlay.style.fontSize = '16px';
        overlay.style.display = 'none';

        const videoContainer = document.getElementById('movie_player');
        if (videoContainer) {
            videoContainer.appendChild(overlay);
        } else {
            document.body.appendChild(overlay);
        }
    }
    return overlay;
}

function updateSpeedOverlay(speed) {
    const overlay = createSpeedOverlay();
    overlay.textContent = `Speed: ${speed.toFixed(2)}x`;
    overlay.style.display = 'block';
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 1000);
}

function checkShortcut(event, shortcut) {
    if (!shortcut) return false;
    
    const parts = shortcut.split('+');
    const key = parts[parts.length - 1].toLowerCase();
    const needsAlt = parts.includes('Alt');
    const needsCtrl = parts.includes('Ctrl');

    return event.key.toLowerCase() === key && 
           event.altKey === needsAlt && 
           event.ctrlKey === needsCtrl;
}

function handleShortcuts(event) {
    const video = getVideoElement();
    if (!video || isInputActive(getInputElement())) return;

    chrome.runtime.sendMessage({ action: "getShortcuts" }, (data) => {
        if (checkShortcut(event, data.speedUpShortcut)) {
            video.playbackRate += 0.10;
            chrome.runtime.sendMessage({ action: "savePlaybackSpeed", playbackSpeed: video.playbackRate });
            updateSpeedOverlay(video.playbackRate);
        }
        else if (checkShortcut(event, data.speedDownShortcut)) {
            video.playbackRate = Math.max(0.10, video.playbackRate - 0.10);
            chrome.runtime.sendMessage({ action: "savePlaybackSpeed", playbackSpeed: video.playbackRate });
            updateSpeedOverlay(video.playbackRate);
        }
        else if (checkShortcut(event, data.pictureInPictureShortcut)) {
            togglePictureInPicture(video);
        }
        else if (checkShortcut(event, data.toggleSuggestionsShortcut)) {
            const suggestions = document.querySelector('#related');
            if (suggestions) {
                suggestions.style.display = suggestions.style.display === 'none' ? 'block' : 'none';
            }
        }
    });
}

function initializePlaybackSpeed() {
    const video = getVideoElement();
    if (video) {
        chrome.runtime.sendMessage({ action: "getShortcuts" }, (data) => {
            const savedSpeed = data.playbackSpeed || 1;
            video.playbackRate = savedSpeed;
        });
        video.onloadeddata = () => {
            chrome.runtime.sendMessage({ action: "getShortcuts" }, (data) => {
                const savedSpeed = data.playbackSpeed || 1;
                video.playbackRate = savedSpeed;
            });
        };
    }
}

initializePlaybackSpeed();
document.addEventListener('keydown', handleShortcuts);
document.addEventListener('visibilitychange', () => {
    const video = getVideoElement();
    if (video) {
        if (document.hidden) {
            video.pause();
        } else {
            video.play();
        }
    }
});