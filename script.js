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
    const overlay = document.createElement('div');
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
        videoContainer.style.position = 'relative'; 
        videoContainer.appendChild(overlay); 
    } else {
        document.body.appendChild(overlay); 
    }
}

function updateSpeedOverlay(speed) {
    const overlay = document.getElementById('speed-overlay');
    overlay.textContent = `Speed: ${speed.toFixed(2)}x`;
    overlay.style.display = 'block'; 
    setTimeout(() => {
        overlay.style.display = 'none'; 
    }, 1000);
}

function handleVisibilityChange(video) {
    if (document.hidden) {
        video.pause();
    } else {
        video.play();
    }
}

function handleShortcuts(event) {
    const video = getVideoElement();
    if (!video || isInputActive(getInputElement())) return;
    chrome.runtime.sendMessage({ action: "getShortcuts" }, (data) => {
        const speedUpShortcut = data.speedUpShortcut || ']';
        const speedDownShortcut = data.speedDownShortcut || '[';
        const pictureInPictureShortcut = data.pictureInPictureShortcut || 'p';
        const toggleSuggestionsShortcut = data.toggleSuggestionsShortcut || 'h';

        switch (event.key.toLowerCase()) {
            case speedUpShortcut:
                createSpeedOverlay();
                video.playbackRate += 0.10;
                chrome.runtime.sendMessage({ action: "savePlaybackSpeed", playbackSpeed: video.playbackRate });
                updateSpeedOverlay(video.playbackRate);
                break;
            case speedDownShortcut:
                createSpeedOverlay();
                video.playbackRate = Math.max(0.10, video.playbackRate - 0.10);
                chrome.runtime.sendMessage({ action: "savePlaybackSpeed", playbackSpeed: video.playbackRate });
                updateSpeedOverlay(video.playbackRate);
                break;
            case pictureInPictureShortcut:
                togglePictureInPicture(video);
                break;
            case toggleSuggestionsShortcut:
                const suggestions = document.querySelector('#related');
                suggestions.style.display = suggestions.style.display === 'none' ? 'block' : 'none';
                break;
        }
    });
}

function initializePlaybackSpeed() {
    const video = getVideoElement();
    if (video) {
        chrome.runtime.sendMessage({ action: "getShortcuts" }, (data) => {
            const savedSpeed = data.playbackSpeed || 1;
            console.log(savedSpeed);
            video.playbackRate = savedSpeed;
        });
        video.onloadeddata = () => {
            chrome.runtime.sendMessage({ action: "getShortcuts" }, (data) => {
                console.log(savedSpeed);
                const savedSpeed = data.playbackSpeed || 1;
                video.playbackRate = savedSpeed;
            });
        };
    }
}
initializePlaybackSpeed();

document.addEventListener('keydown', handleShortcuts);
document.addEventListener('visibilitychange', () => handleVisibilityChange(getVideoElement()));
