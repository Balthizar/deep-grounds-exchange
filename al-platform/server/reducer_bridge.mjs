// Bundles the EXISTING reducer case modules (unchanged, from src/) the same way
// harness/transitions.cjs does, and exposes one reducerCase(s, action) that
// routes exactly like reducerImpl — minus the client draft, which the DB draft
// replaces. This file is the proof that the port is the draft, not the reducer.
import { writeFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
const require = createRequire(import.meta.url);

export function loadReducerCases(root = ".") {
  const entry = resolve(root, "src/__srv.ts");
  writeFileSync(entry, `
    import { bastionActions } from "./bastion/actions";
    import { itemActions } from "./reducer/items";
    import { characterActions } from "./reducer/characters";
    import { orgActions } from "./reducer/org";
    import { socialActions } from "./reducer/social";
    import { playActions } from "./reducer/play";
    export const __srv = { bastionActions, itemActions, characterActions, orgActions, socialActions, playActions };
  `);
  let esb;
  try { esb = require("esbuild"); }
  catch {
    rmSync(entry, { force: true });
    throw new Error("reducer_bridge: esbuild is not installed. It is a declared devDependency of this project.\n" +
      "  fix: npm install    (or: npm ci)    in the project root, then re-run.\n" +
      "  Nothing is fetched at benchmark time — the local package is loaded via its JS API, never npx, never a cache, never the network.");
  }
  try {
    esb.buildSync({ entryPoints: [entry], bundle: true, format: "cjs",
      outfile: resolve(root, "server/_cases.cjs"), loader: { ".json": "json" }, jsx: "automatic", logLevel: "silent" });
  } catch (e) {
    rmSync(entry, { force: true });
    throw new Error("reducer_bridge: esbuild failed to bundle the reducer.\n" + String(e.message).split("\n").slice(0, 8).join("\n"));
  }
  rmSync(entry, { force: true });
  const { bastionActions, itemActions, characterActions, orgActions, socialActions, playActions } =
    require(resolve(root, "server/_cases.cjs")).__srv;
  const chain = [bastionActions, itemActions, playActions, characterActions, orgActions, socialActions];
  return function reducerCase(s, action) {
    const dropNotice = () => {};   // server notices go through indexed ops; the auto-clear predicate becomes a WHERE clause later
    for (const f of chain) { const h = f(s, action, dropNotice); if (h !== undefined) return h; }
    throw new Error("reducer: no case for " + JSON.stringify(action.type));
  };
}
