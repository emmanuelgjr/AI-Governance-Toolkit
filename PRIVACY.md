# Privacy

This toolkit is privacy-by-design because AI governance leads enter sensitive
system information here.

## What is stored where

- **Your entries** — AI system inventory, AIIA responses, risk register —
  live in your browser's `localStorage` for this origin.
- **Nothing** is transmitted to any backend. There is no backend. The entire
  site is a static asset bundle served from GitHub Pages.
- **Optional anonymous analytics** via Plausible covers page-views only — no
  content, no fingerprinting, no cross-site tracking. You can block it without
  affecting site behavior.

## What this means in practice

- Clearing your browser data clears the toolkit's data. Back up first if
  needed (export to JSON via the `/data` page).
- Your data does not move between devices unless you export it as JSON and
  import it elsewhere.
- If you share the device, anyone using it can see what you've entered —
  treat the toolkit's data with the same care as any local file.

## Why this design

Traditional SaaS governance tools require uploading your AI inventory and risk
register to a vendor environment. That creates a fresh data-protection question
that defeats much of the point: now you have to assess the vendor before you
can run the assessment. Privacy-by-design eliminates the question.

## Export and import

The toolkit offers JSON export of all your entries and import to restore on
another browser. Export your data periodically as a backup.

## Caveat

If the underlying browser, OS, or device has been compromised, the toolkit's
data is at risk regardless of this design. Standard endpoint security still
matters.

## Reporting concerns

Email security@aigovernancetoolkit.dev.
