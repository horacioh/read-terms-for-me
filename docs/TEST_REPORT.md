# Smoke Test Report — Read Terms For Me

Date: 2026-07-18
Environment: Chromium 121, Linux VM, local fake Ollama/ToS server

## Summary

Loaded the unpacked extension in a fresh Chromium profile, accepted the privacy notice, used a local fake server to simulate both the Terms of Service fetch and the LLM call, and completed a full end-to-end analysis. The side panel rendered the scored summary, the **Re-analyze** button triggered a new run, and `chrome.storage.local` accumulated analysis history.

## What was tested

1. **Extension loads and options page opens.**
2. **Consent UI is shown before first use.**
3. **Side panel displays a scored summary with score gauges, key points, and preference matches.**
4. **Re-analyze button triggers a fresh analysis.**
5. **Local analysis history is stored in `chrome.storage.local`.**
6. **Rule-based scoring produces deterministic scores for the test text.**

## Test setup

- Built extension: `bun run build`.
- Launched Chromium with `--load-extension=dist`.
- Started a local Python server on `http://localhost:8000`:
  - `GET /terms` returns a minimal HTML ToS document.
  - `POST /api/chat` mimics Ollama's chat endpoint and returns a plaintext summary or JSON preference array depending on the prompt.
- Updated the extension's Ollama base URL to `http://localhost:8000` via `chrome.storage.local`.

## Results

### 1. Options page and consent banner

The options page loaded and displayed the consent banner. After setting `settings.consentGiven = true` and reloading, the full settings form appeared.

![Options page showing the privacy-first consent banner](docs/screenshot-options-consent.png)

### 2. Side panel scored summary

The side panel rendered a complete scored summary:

- Overall score: 42
- Privacy score: 42
- User Rights score: 27
- Transparency score: 50
- Freedom score: 50
- Dealbreakers found badge
- Summary, Key Points, Data Usage, Restrictions, Termination, and Privacy Preferences Analysis sections

![Side panel after successful analysis](docs/screenshot-sidepanel-success.png)

### 3. Re-analyze and local history

Clicking **Re-analyze** (via `chrome.runtime.sendMessage` with `force: true`) triggered a new analysis against the local fake server. The side panel updated with a new timestamp and score. After the run, `chrome.storage.local.analysisHistory` contained two entries:

```json
[
  {"id": "...", "title": "localhost"},
  {"id": "hist-1", "title": "Google Terms of Service"}
]
```

![Side panel reloaded with history](docs/screenshot-sidepanel-reloaded.png)

### 4. Deterministic scoring

The scoring engine evaluated the test document and returned consistent scores. The negative signals matched for the test text ("sell your data", "broad license", "terminate ... without notice"), lowering Privacy and User Rights scores.

## Store screenshot

A 1280×800 PNG of the side panel with a scored summary was saved as `docs/store-screenshot.png` at the repository root.

## Issues / notes

- The first re-analysis attempt failed because Ollama was not running. This is expected behavior — the extension correctly surfaced the error in the side panel.
- A local fake server was needed because the test environment has no network access to real Ollama/OpenAI endpoints.
- The original Devin Chrome session was accidentally terminated during cleanup (`pkill -f "chrome-linux/chrome"` matched the environment browser as well as the test browser). It was relaunched.
