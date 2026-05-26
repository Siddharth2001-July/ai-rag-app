# Project: Signing Demo at Nutrient

**Stack:** Next.js 14, TypeScript, Nutrient / PSPDFKit Web SDK 2024.3.0, Baseline UI (Nutrient's design system)
**Status:** Live, open-source, hosted under Nutrient's official GitHub org
**Live demo:** https://signing-demo-baseline-one.vercel.app/
**Repo:** https://github.com/PSPDFKit/signing-demo-lite

## What it is

A reference application demonstrating the most-requested customer use case at Nutrient: implementing a complete document signing workflow on top of Nutrient's Web SDK. Siddharth built it as the canonical example that developers can study, fork, and adapt when they need to ship signing functionality on top of the SDK.

The demo covers the full e-signing surface in one cohesive flow:

- **Multi-user signing workflows with role-based permissions** — an *Editor* places signing fields on the document; *Signers* can only fill the fields assigned to them.
- **Three electronic signature types:**
  - **Typed (Text)** — signers type their name as their signature
  - **Drawn** — signers draw their signature with a signature pad
  - **Image / uploaded** — signers upload a pre-saved signature image
- **Initials** as a smaller variant of signature fields, for documents that need page-by-page initialing
- **Cryptographic Digital Signatures (DS)** — the secure, audit-trail variant that produces a tamper-evident signed PDF via Nutrient's backend signing service
- **Per-user color coding** — each signer gets a unique color so the document author can see at a glance who is meant to sign where
- **Drag-and-drop field placement** — Editors literally drag a signature, initial, or DS widget onto the document at any position on any page

## Why it matters

Document signing is the #1 customer use case Nutrient gets asked about. Before this demo, the answer was "read the docs and build it yourself." After this demo, prospective customers and existing developers have a working, batteries-included reference to adapt — significantly shortening time-to-integrate. The repo lives under PSPDFKit's official GitHub organisation and is one of Nutrient's most-visited developer-relations resources.

## Interesting technical bits

- **Form-field-based architecture.** Each signing slot is a `PSPDFKit.Annotations.WidgetAnnotation` paired with a `PSPDFKit.FormFields.SignatureFormField`. Signatures end up as proper PDF form fields (not just annotations), which means signed PDFs are interoperable with Adobe Acrobat and other PDF tooling.
- **Permission enforcement via field `readOnly`.** Fields are conditionally read-only based on whether the current logged-in user matches the assigned signer ID. The SDK respects this automatically — no extra permission layer needed.
- **Self-contained audit metadata.** Each widget carries `customData` with the signer's ID, email, color, and field type — enough to reconstruct full audit data without an external database.
- **Pixel-accurate drag-and-drop placement.** Uses `instance.transformContentClientToPageSpace` to convert screen pixels to PDF page coordinates, correctly accounting for zoom and scroll.
- **Built-in code-aware AI assistant.** The demo ships with a chat sidebar where developers can ask questions like *"How do I set the signees?"* and get answers grounded in the demo's actual codebase — an AI-on-the-code learning UX that helps devs understand the implementation while exploring it.

## What this demonstrates about Siddharth

Building this required end-to-end mastery of every signing-adjacent corner of the SDK — form fields, widget annotations, custom rendering, drag-and-drop coordinate math, role-based permissions, and the server-side digital signing API. It's also the clearest answer to *"what does a Solutions Engineer at Nutrient actually do?"* — take a customer's real need ("we want to ship signing"), distill it into a clean reference implementation, and ship it as a public resource that scales beyond any single customer conversation.
