# Privacy Policy for Read Terms For Me

Last updated: 2026-07-18

## Overview

Read Terms For Me is a Chrome extension that helps you understand Terms of Service documents. This privacy policy explains what data the extension handles and how it is used. The guiding principle is that **everything stays on your device** unless you explicitly choose to send a document to the LLM provider you configure.

## What stays on your device

All of the following are stored **locally** in your browser using `chrome.storage.local`:

- **Extension settings** — provider, model, base URL, API key, language, custom prompts, privacy preferences, scoring rules, and consent status.
- **Local analysis history** — the URLs you analyze, the page title/URL where the Terms of Service link was found, the summary, scores, and preference analysis. This is stored so you can view previous runs and avoid re-analyzing the same URL.
- **Anonymous usage statistics** — only a count of total analyses and how many times each privacy-preference category was matched.

You can view, clear, or reset this local data at any time from the extension settings. The history also expires automatically after the number of days you configure (default 30).

## What is sent to third parties

When you click **Summarize**, the extension fetches the selected Terms of Service document and sends its text to the LLM provider you configured (OpenAI, DeepSeek, or Ollama). This happens only when you explicitly request an analysis.

- If you use **Ollama**, the request is sent to your local machine (`http://localhost:11434` by default) and does not leave your device.
- If you use **OpenAI** or **DeepSeek**, the request is sent to their API using the API key you provided. The API key is stored locally in your browser and is only sent to the provider you selected.

No page URLs, browsing history, prompts, or analysis results are sent to any third party.

## Your rights

You can:

- View and reset anonymous usage statistics in the extension settings.
- Clear your local analysis history in the extension settings.
- Delete all stored data by removing the extension from Chrome.
- Disable or uninstall the extension at any time.

## Contact

If you have questions about this privacy policy, please open an issue on the project repository.
