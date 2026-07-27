# BOOTSTRAP — paste this as the first message of a new chat

> Clone and verify:
> `https://github.com/<YOUR_USER>/deep-grounds-exchange`
> Run `tools/bootstrap.sh`, confirm the gate is green, then read `HANDOFF.md` and tell me the state.

That's it. No attachments. The container can reach github.com, api.github.com,
raw.githubusercontent.com and codeload.github.com.

## Why this exists
Chat attachments cap out (~20 files, and large PDFs can fail the attachment step even when the
bytes reach the container). Project knowledge rejects some file types. A repo has neither limit,
is version-controlled, and makes the handoff *the repo state* instead of a document to re-upload.

## Private repo
Claude cannot authenticate on its own. For a private repo you must paste a token, so:
- fine-grained, **read-only** (Contents: Read), **this repo only**, **short expiry**
- treat it as burned once pasted into a chat; **rotate it afterward**
- clone as `https://<TOKEN>@github.com/<USER>/deep-grounds-exchange.git`

## Copyright
`sources/` is gitignored. **Do not commit WotC PDFs to a public repo.** Keep sources in a private
repo, or upload them per-session as chat attachments (they cost one slot each and are cheap in
context because binaries are not inlined).
