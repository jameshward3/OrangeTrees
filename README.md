# Orange Tree Inventory

A living municipal urban-forestry GIS for the **City of Orange Township, NJ (07050)**. Single self-contained `index.html` — no build step, no backend, no API keys. Deploys as a static page (GitHub Pages) exactly like the Street Paving Program app.

## What it does

- **Boundary + mask** — the authoritative Orange Township boundary (shared with the Street Paving app) with everything outside greyed out; the map stays tight to the city.
- **Basemaps** — Esri World Imagery (satellite), Streets, Topographic, Light Gray, and OpenStreetMap.
- **Detect from imagery** — reads the Esri satellite tiles in-browser, flags vegetation by Excess-Green (2G−R−B), groups pixels into canopy blobs, and plots a tree at each. Detections come in as *species Unknown · Needs Review* by design.
- **Editable inventory** — every tree carries a permanent `ORG-STR-######` ID (deletes archive, IDs never recycle), species/size/status/condition, canopy diameter & area, estimated DBH/height/maturity, ward, nearest street, and edit history. Add, move, edit, verify, archive.
- **Dashboard** — totals, estimated canopy %, species distribution, trees-by-street, rough carbon/stormwater proxies, and a collapsible inventory grouped by ward and street (tap to zoom + open).
- **Coverage heatmap** — canopy-coverage grid at 25/50/100/250 ft cells.
- **Exports** — GeoJSON and CSV of the current view.

## Data provenance

- **Boundary**: authoritative Orange Township polygon (Census/Esri-derived), embedded, identical to the Street Paving Program app.
- **Streets**: the real Orange street network (449 clipped segments, 197 named streets) lifted from the same app.
- **Trees**: on load, the app reads the shared [OrangeTreeDatabase](https://github.com/jameshward3/OrangeTreeDatabase) so the index reflects live field data. It shows seeded **sample** data instantly as a fallback while the database loads (or if it's unreachable).

## Live database

The shared source of truth is **OrangeTreeDatabase** (`https://orange-tree-database.vercel.app`, Vercel + Neon Postgres). **CanopyQuest** contributes field verifications, species IDs, and new trees; this app reads the same record.

- On load: `GET /v1/trees` → `{ trees: [...] }`, mapped into the map, inventory, dashboard, and exports. Status shows in **Layers ▸ Live database** and on the on-map badge.
- The hosted origin must be listed in the database's `ALLOWED_ORIGINS` (it already allows `https://jameshward3.github.io`). Other origins (e.g. a `jw4o.com` embed) are CORS-blocked until added, and the app falls back to sample data with a clear notice.
- **Read-only by default.** Editors can enable saving at runtime via **Connect write access**, which sends the `WRITE_TOKEN` as `Authorization: Bearer …` for `PUT`/`DELETE /v1/trees/:id`. The token is held in memory only, never written into the page (per the database's security model). Routine verifications/additions flow through CanopyQuest's findings workflow.

## Swap-in points (for production)

- **Detection backend** — replace the in-browser heuristic with server-side [DeepForest](https://github.com/weecology/DeepForest) over NAIP/high-res imagery, export GeoJSON, and load it in place of the seed. The UI already reads that schema. See the app's "How detection works" panel.
- **Wards** — `assignWard()` currently assigns by quadrant around the city centroid. Drop in the official voting-district GeoJSON and switch it to a point-in-polygon test.
- **Authoritative canopy/equity numbers** — [Tree Equity Score · Orange, NJ](https://www.treeequityscore.org/insights/place/orange-nj) and [i-Tree Landscape](https://landscape.itreetools.org).

## Deploy

1. Put `index.html` at the repo root.
2. Settings → Pages → Deploy from branch → `main` / `root`.
3. Live at `https://<user>.github.io/<repo>/`.

Detection needs to read imagery pixels, which requires CORS-enabled tiles — Esri's are, so it works on any https host (including GitHub Pages).
