import { detectTermsLinks } from './shared/detector';
function updateBadge() {
    const links = detectTermsLinks(document, location.href);
    void chrome.runtime.sendMessage({
        type: 'UPDATE_BADGE',
        count: links.length,
        tabId: null,
    });
}
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    updateBadge();
}
else {
    window.addEventListener('load', updateBadge);
}
const observer = new MutationObserver(() => {
    updateBadge();
});
if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
}
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'GET_DETECTED_LINKS') {
        const links = detectTermsLinks(document, location.href);
        return Promise.resolve({ type: 'DETECTED_LINKS', links });
    }
    return false;
});
