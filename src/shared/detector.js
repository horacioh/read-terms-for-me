const termsRegex = /terms?\s*(of\s*(service|use|conditions))?|tos|user\s*agreement|eula|legal\s*terms/i;
const hrefTermsRegex = /\/(terms?|tos|legal|eula|user-agreement|conditions)(\/?|$|[-_.])/i;
function normalizeUrl(url, baseUrl) {
    try {
        return new URL(url, baseUrl).href;
    }
    catch {
        return null;
    }
}
function scoreLink(element, baseUrl) {
    const url = normalizeUrl(element.href, baseUrl);
    if (!url)
        return null;
    const text = (element.innerText || element.title || '').trim();
    const lowerText = text.toLowerCase();
    const lowerHref = url.toLowerCase();
    let score = 0;
    if (termsRegex.test(text))
        score += 10;
    if (hrefTermsRegex.test(lowerHref))
        score += 8;
    if (lowerText.includes('terms of service'))
        score += 5;
    if (lowerText.includes('terms of use'))
        score += 4;
    if (lowerText.includes('user agreement'))
        score += 3;
    if (lowerHref.includes('/terms'))
        score += 3;
    if (score === 0)
        return null;
    return { url, text, score };
}
export function detectTermsLinks(document, baseUrl) {
    const links = Array.from(document.querySelectorAll('a'));
    const scored = new Map();
    for (const link of links) {
        const result = scoreLink(link, baseUrl);
        if (!result)
            continue;
        const existing = scored.get(result.url);
        if (!existing || existing.score < result.score) {
            scored.set(result.url, result);
        }
    }
    return Array.from(scored.values()).sort((a, b) => b.score - a.score);
}
