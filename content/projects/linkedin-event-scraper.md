# Project: LinkedIn Event Attendee Scraper (Chrome Extension)

**Stack:** Vanilla JavaScript, Chrome Extension APIs, manifest v2/v3
**Status:** Open source, originally built during the Prospectss engagement
**Repo:** https://github.com/Siddharth2001-July/Linkedin-Event-Scrapper

## What it is

A Chrome extension that scrapes attendee information from LinkedIn events and exports it for downstream use (sales prospecting, outreach, lead gen).

## Why he built it

Originally built during Siddharth's engagement at Prospectss (Novus Enterprises) — sales and growth teams wanted attendee data from LinkedIn events as a prospecting signal, but LinkedIn doesn't offer that data in any easily-exportable format. The extension solved that problem from inside the browser, using Chrome APIs and content scripts.

## Interesting technical bits

- **Pure Vanilla JS, no framework:** The whole extension is plain JavaScript + Chrome APIs — no React, no build step. For a small Chrome extension, this keeps the bundle tiny and the moving parts minimal.
- **Built end-to-end:** manifest, background scripts, content scripts that interact with LinkedIn's DOM, and the popup UI — all assembled by Siddharth.
- **DOM scraping is brittle:** A real lesson from this project — when you scrape a third-party site's DOM, every redesign by that site can break you. Worth knowing before architecting around it.

## Install (for trying it out)

1. Clone the repo
2. Open `chrome://extensions`, enable Developer Mode
3. Click "Load unpacked" and select the cloned folder
