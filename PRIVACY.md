# Privacy Policy for Read Terms For Me

Last updated: 2026-07-18

## Overview

Read Terms For Me is a Chrome extension that helps you understand Terms of Service documents. This privacy policy explains what data the extension handles and how it is used.

## Data we do not collect

We do **not** collect, store, or transmit:

- Your browsing history.
- The websites you visit.
- Any personally identifiable information.
- The full text of analyzed Terms of Service documents.
- Your prompts or queries.

## Data stored locally

The only data stored on your device is:

1. **Extension settings** (provider, model, base URL, API key, language, custom prompts, privacy preferences, and scoring rules).
2. **Anonymous usage statistics**:
   - The total number of analyses you have run.
   - An aggregated count of which privacy-preference categories were matched across all analyses.

These statistics are anonymous and contain no information about the websites or Terms of Service documents you analyzed.

## Data sent to third parties

When you click **Summarize**, the extension sends the text of the selected Terms of Service document to the LLM provider you configured (for example, Ollama running locally, OpenAI, or DeepSeek). This happens only when you explicitly request an analysis.

- If you use **Ollama**, the request is sent to your local machine (`http://localhost:11434` by default) and does not leave your device.
- If you use **OpenAI** or **DeepSeek**, the request is sent to their API using the API key you provided. The API key is stored locally in your browser and is only sent to the provider you selected.

## Your rights

You can:

- View and reset the anonymous usage statistics at any time from the extension settings.
- Delete all stored data by removing the extension from Chrome.
- Disable or uninstall the extension at any time.

## Contact

If you have questions about this privacy policy, please open an issue on the project repository.
