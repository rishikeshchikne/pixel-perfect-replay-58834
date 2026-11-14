<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- Artifact content, quiz and timeline live as typed data in `src/lib/` (not the database): it is curated, source-cited reference content that every user shares.
- Museum pages are top-level public routes in `src/routes/`, with navigation and footer shared by the root layout, so every page opens without a session.
- The museum does not import authentication clients or attach bearer tokens; leave integration-managed scaffolding untouched and inactive.
- Official homepage resources live as typed data in `src/lib/resources.ts`; artifact references and image credits derive from the curated artifact records to prevent mismatches.
- The Ghost Map 3D scene is lazy-loaded client-only (`src/components/museum/space/`), with pure coordinate maths and texture credits in `src/lib/space.ts`; devices without WebGL get the schematic fallback.
- The Ghost Map 3D scene sits inside `SceneErrorBoundary`, so a WebGL, texture or code-download failure swaps in the schematic map instead of crashing the whole page.
