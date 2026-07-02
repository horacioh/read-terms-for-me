# Read Terms For Me

A Chrome extension that detects **Terms of Service** links on any page, fetches the document, and produces a plain-language summary and privacy-preference analysis using a BYOK or local LLM.

## Features

- **Passive detection** — the extension icon shows a badge when a ToS link is found; no UI is injected into pages.
- **One-click summarize** — open the popup, choose a detected link, and get a summary.
- **Chrome side panel** — summaries and analysis are displayed in a dedicated side panel with a searchable history.
- **Privacy preferences** — configure preset and custom concerns in settings; the extension flags which ones are matched by the ToS.
- **BYOK or local LLMs** — supports OpenAI (bring your own key) and Ollama (local).
- **30-day history** — summaries are stored locally and expire after 30 days.

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
3. Save settings.

## Usage

1. Visit a page with a Terms of Service link.
2. The extension icon shows a badge if a ToS link is detected.
3. Click the icon to see the detected links.
4. Click **Summarize** on the desired link.
5. The Chrome side panel opens with the summary, key points, red flags, and a privacy-preference analysis.
6. Past summaries are available in the side panel history.

## Privacy Notes

- The extension does not send any page data to a third party until you click **Summarize**.
- API keys are stored locally in `chrome.storage.local`.
- All summaries and history are stored locally and expire after the configured number of days (default 30).
- The extension only fetches the Terms of Service URL you explicitly select.

## Project Structure

```
read-terms-for-me/
├── popup/popup.html            # popup entry HTML
├── sidepanel/sidepanel.html    # side panel entry HTML
├── options/options.html        # settings page entry HTML
├── src/
│   ├── background.ts           # service worker
│   ├── content.ts              # content script for ToS detection
│   ├── popup/                  # popup React app
│   ├── sidepanel/              # side panel React app
│   ├── options/                # settings React app
│   ├── shared/                 # types, storage, LLM providers, prompts
│   └── components/             # shared UI components
├── public/
│   ├── manifest.json           # Chrome extension manifest
│   └── icons/icon.svg          # extension icon
└── dist/                       # built extension
```

## License

MIT
