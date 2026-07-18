# Chrome Web Store — Permission Justifications

Use this text when filling out the **Data Usage** / **Permissions** sections of the Chrome Web Store listing.

## Permissions

### `activeTab`

Used to query the current active tab so the extension can:
- Request the list of detected Terms of Service links from the content script.
- Read the current page title when a user clicks **Summarize** for history display.

The active tab data is never uploaded or shared; it is only used locally in the side panel.

### `storage`

Used to persist the following data locally in `chrome.storage.local`:
- User settings (provider, API key, model, custom prompts, scoring rules, privacy preferences).
- Local analysis history (ToS URLs, page titles, summaries, scores, and an SHA-256 hash of the analyzed text).
- Anonymous usage statistics (total analyses and matched preference category counts).

No data is uploaded to any backend; the extension has no server.

### `sidePanel`

Used to display the extension's analysis UI in Chrome's side panel when the user clicks the extension icon or a detected Terms of Service link.

## Host permissions

### `https://*/*` and `http://*/*`

Used to fetch the Terms of Service document selected by the user. The extension does not fetch any URL automatically; it only fetches the ToS URL the user explicitly clicks **Summarize** on.

### `http://localhost:11434/`

Optional, used only when the user configures the Ollama provider. This lets the extension reach a local Ollama instance. It is not fetched unless Ollama is selected.
