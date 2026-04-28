# Project: My PDF Chat App

**Stack:** React + Vite, PSPDFKit (PDF rendering and text extraction), separate Python backend exposing an OpenAI-compatible `/v1/chat/completions` endpoint
**Status:** Working prototype (Jan 2025)
**Repo:** https://github.com/Siddharth2001-July/my-pdf-chat-app

## What it is

A "chat with your PDF" web app. The user uploads a PDF, the app renders it in a viewer using PSPDFKit, extracts the text, and lets the user ask questions about the document. The frontend forwards the user's question along with the extracted PDF text to a local backend that runs the actual LLM call.

## Why he built it

This was Siddharth's earlier exploration into combining the document-tech world he works in at Nutrient with conversational AI — a precursor to his current RAG app. The idea was simple: PDFs are everywhere, reading long PDFs is slow, and "ask the document a question" is a much better UX than scrolling and Cmd+F.

## Interesting technical bits

- **Frontend / backend split:** The React app handles PDF rendering and text extraction (the parts that need PSPDFKit and a real DOM), while a Python backend handles the LLM call. They speak over an OpenAI-compatible API contract (`/v1/chat/completions`), which means the backend is swappable — any LLM that exposes that schema can plug in.
- **Real PDF rendering, not just text:** Using PSPDFKit means the user sees the actual PDF (annotations, layout, images) while chatting with it, instead of getting a stripped-down text-only view.
- **Side-by-side panel layout:** Built with `@baseline-ui` resizable panels so the user can adjust how much space the document vs. chat gets.

## How this relates to the current RAG app

`my-pdf-chat-app` stuffs the *entire* extracted PDF text into the prompt as context — fine for one document, but breaks down for large documents or many documents at once. The current portfolio RAG app fixes that by embedding chunks ahead of time and retrieving only the relevant ones at query time. Same problem shape, scaled-up solution.
