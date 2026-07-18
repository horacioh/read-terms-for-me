# Chrome Web Store Screenshot Guide

The Chrome Web Store requires at least one **1280×800** screenshot of the extension in action. This guide shows how to capture a good one for Read Terms For Me.

## What to capture

The best screenshot shows the **Chrome side panel** displaying a scored summary, because it demonstrates the core value of the extension in one image. Include:

- The side panel header (`Read Terms For Me`).
- The detected Terms of Service URL.
- The overall score gauges (Privacy, User Rights, Transparency, Freedom).
- A short summary and a few key points or red flags.
- A preference match card (e.g., "Dealbreaker" or "Warning").

## Step-by-step

1. **Load the extension**
   - Run `bun run build`.
   - Open `chrome://extensions/`, enable **Developer mode**, click **Load unpacked**, and select the `dist/` folder.
   - Pin the extension to the toolbar.

2. **Configure an LLM**
   - Open the extension options.
   - If you have a local Ollama server, use **Ollama**.
   - Otherwise, use **OpenAI** or **DeepSeek** with your own API key.
   - Save the settings and accept the privacy notice.

3. **Open a page with a ToS link**
   - A good example is `https://policies.google.com/terms` or `https://www.reddit.com/user-agreement/`.
   - Wait for the extension icon badge to show a count (usually `1`).

4. **Summarize**
   - Click the extension icon to open the side panel.
   - Click **Summarize** on the detected Terms of Service link.
   - Wait for the analysis to complete (this can take a few seconds).

5. **Size the window**
   - Resize the browser window so the viewport is at least **1280×800**.
   - Make sure the side panel is wide enough to show the full summary and gauges clearly.

6. **Capture the screenshot**
   - You can use the browser DevTools (`Ctrl+Shift+J` → `Ctrl+Shift+P` → **Capture full size screenshot** or **Capture screenshot**) to save a 1280×800 image.
   - Alternatively, use a system screenshot tool and crop to **1280×800**.

## Tips

- Use a clean browser profile with no dark-mode themes or unrelated extensions visible.
- Choose a ToS page that produces a mix of warnings/dealbreakers so the score gauges and preference cards are visually informative.
- Do not include your API key in the screenshot.
- Save the image as a **PNG** named `store-screenshot-1280x800.png`.

## Optional promotional tiles

- **Small promo tile**: 440×280
- **Large promo tile** (marquee): 1400×560

These should show the extension name and a short tagline such as "Understand Terms of Service in seconds, privately."
