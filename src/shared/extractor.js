export function extractTextFromHtml(html) {
    if (typeof DOMParser !== 'undefined') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const removeElements = (selector) => {
            for (const el of Array.from(doc.querySelectorAll(selector))) {
                el.remove();
            }
        };
        removeElements('script, style, nav, header, footer, aside, .advertisement, .ads, iframe, noscript');
        const title = doc.title?.trim();
        const body = doc.body?.innerText?.trim();
        if (body) {
            const parts = [title ? `Title: ${title}` : '', body].filter(Boolean);
            return parts.join('\n\n').replace(/\s+/g, ' ').trim();
        }
    }
    return html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
        .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
        .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
        .replace(/<header[\s\S]*?<\/header>/gi, ' ')
        .replace(/<aside[\s\S]*?<\/aside>/gi, ' ')
        .replace(/<iframe[\s\S]*?<\/iframe>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim();
}
export function truncateText(text, maxChars) {
    if (text.length <= maxChars)
        return text;
    return text.slice(0, maxChars).trimEnd() + '\n\n[Document truncated]';
}
