# Project: ChatGPT Console App (Harry Potter themed)

**Stack:** Node.js, OpenAI / ChatGPT API
**Status:** Working CLI tool (Oct 2023)
**Repo:** https://github.com/Siddharth2001-July/chatGPT_ConsoleApp

## What it is

A command-line ChatGPT client themed around the world of Hogwarts — chat with the API from your terminal in a Harry Potter setting instead of the standard chat UI.

## Why he built it

An early experiment with the OpenAI API — the goal was to learn how to integrate an LLM into an app from scratch (auth, request shape, prompt engineering for persona) rather than just using the ChatGPT website. Theming it as a Harry Potter character was both a system-prompt experiment and a way to make the project memorable.

## Setup

Standard Node.js CLI: clone, `npm install`, drop an OpenAI API key into a `.env` file, run `npm run dev`. The README walks through it.

## What it taught him

How to wire up an LLM API end-to-end without any framework — useful background for the more sophisticated AI work he's doing now. Building from the raw API first, before reaching for libraries like LangChain or the Vercel AI SDK, builds intuition for what those libraries are actually doing under the hood.
