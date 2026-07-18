# Read Terms For Me

A privacy-first Chrome extension that detects **Terms of Service** links on any page, fetches the document, and produces a plain-language summary, a privacy-preference analysis, and a transparent, rule-based score.

## Features

- **Passive detection** — the extension icon shows a badge when a ToS link is found; no UI is injected into pages.
- **One-click summarize** — open the popup, choose a detected link, and get a summary.
- **Chrome side panel** — summaries and analysis are displayed in a dedicated side panel with a local history of previous runs.
- **Rule-based scoring** — scores each ToS on privacy, user rights, transparency, and freedom using configurable regex rules.
- **Privacy preferences** — configure preset and custom concerns in settings; the extension flags which ones are matched by the ToS.
- **Custom prompts** — edit the LLM prompts for summary and preference analysis.
- **BYOK or local LLMs** — supports OpenAI (bring your own key), DeepSeek, and Ollama (local).
- **Everything local** — analysis history, settings, and anonymous usage stats are stored in `chrome.storage.local` and never uploaded. The only data sent anywhere is the ToS text you choose to summarize, sent to the LLM provider you configure.

## Tech Stack

- React + TypeScript
- Bun
- Vite
- Tailwind CSS v4
- React Aria Components
- Chrome Manifest V3

## Development

```bash
# Install dependencies
bun install

# Build the extension
bun run build

# Build and package for the Chrome Web Store
bun run build:zip

# Watch mode for development
bun run build:watch
```

## Load the extension in Chrome

1. Build the project: `bun run build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode**
4. Click **Load unpacked** and select the `dist` folder
5. Pin the extension to the toolbar

## Configure the LLM

1. Click the extension icon and then the settings icon, or open the extension options page.
2. Choose a provider:
   - **Ollama** (default): install [Ollama](https://ollama.com/) and pull a model such as `llama3.2`. The extension uses `http://localhost:11434` by default.
   - **OpenAI**: set your API key and optionally a custom base URL. The default model is `gpt-4o-mini`.
   - **DeepSeek**: set your API key and optionally a custom base URL.
3. Save settings.

## Usage

1. Visit a page with a Terms of Service link.
2. The extension icon shows a badge if a ToS link is detected.
3. Click the icon to see the detected links.
4. Click **Summarize** on the desired link.
5. The Chrome side panel opens with the summary, key points, red flags, privacy-preference analysis, and a rule-based score.
6. Revisit previous analyses from the local history list at the bottom of the side panel.

## Privacy Notes

- The extension does not send any data to a third party until you click **Summarize**.
- API keys are stored locally in `chrome.storage.local`.
- Analysis history, settings, and anonymous usage statistics are stored locally in `chrome.storage.local` and are never uploaded.
- History expires automatically after the configured number of days (default 30) and can be cleared at any time in settings.
- The extension only fetches the Terms of Service URL you explicitly select.

## Project Structure

```
read-terms-for-me/
├── sidepanel/sidepanel.html    # side panel entry HTML
├── options/options.html        # settings page entry HTML
├── src/
│   ├── background.ts           # service worker
│   ├── content.ts              # content script for ToS detection
│   ├── sidepanel/              # side panel React app
│   ├── options/                # settings React app
│   ├── shared/                 # types, storage, LLM providers, prompts, scoring rules
│   └── components/             # shared UI components
├── public/
│   ├── manifest.json           # Chrome extension manifest
│   └── icons/                  # extension icons
├── docs/
│   └── privacy.html            # privacy policy page
└── dist/                       # built extension
```

## License

MIT
