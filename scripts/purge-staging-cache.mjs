#!/usr/bin/env node
// Cloudflare's edge caches the SPA shell (index.html) per pathname. A fresh
// `wrangler deploy` uploads new content and the _headers no-store rule stops
// *future* caching, but neither evicts what a path already has cached — a
// stale shell there keeps pointing the browser at the previous bundle (and
// its baked-in apiUrl) until something revalidates that exact path. A
// request with Cache-Control: no-cache forces Cloudflare to revalidate
// against the Worker instead of serving the cached copy, which is what
// actually evicts the stale entry. Confirmed manually after the deploy that
// shipped this script: /, /auth/signup and others stayed on the previous
// bundle until each was hit with this header, one at a time.
//
// Routes are read from the Pages enum instead of duplicated here, so this
// can't silently drift out of sync the way the deploy config itself did.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const STAGING_URL = process.env.STAGING_URL ?? 'https://care-staging.diegrox-rox.workers.dev';
const ENUM_PATH = fileURLToPath(new URL('../src/app/shared/enums/pages.enum.ts', import.meta.url));

function resolveRoutes() {
  const source = readFileSync(ENUM_PATH, 'utf8');
  const resolved = new Map();
  const routes = new Set(['']); // home

  for (const line of source.split('\n')) {
    const match = line.match(/^\s*(\w+)\s*=\s*(.+?),?\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;

    let value;
    if (rawValue.startsWith("'")) {
      value = rawValue.slice(1, -1);
    } else if (rawValue.startsWith('`')) {
      value = rawValue
        .slice(1, -1)
        .replace(/\$\{Pages\.(\w+)\}/g, (_, ref) => resolved.get(ref) ?? '');
    } else {
      continue;
    }

    resolved.set(key, value);
    if (!value.includes(':')) routes.add(value); // skip dynamic segments, e.g. bio/:name
  }

  return [...routes].map((route) => `/${route}`);
}

async function revalidate(path) {
  const url = `${STAGING_URL}${path}`;
  try {
    const res = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } });
    console.log(`${res.ok ? '✓' : '✗'} ${path} (${res.status})`);
    return res.ok;
  } catch (err) {
    console.log(`✗ ${path} (${err.message})`);
    return false;
  }
}

const routes = resolveRoutes();
console.log(`Purging edge cache for ${routes.length} routes on ${STAGING_URL}...`);

const results = await Promise.all(routes.map(revalidate));
const failed = results.filter((ok) => !ok).length;

if (failed > 0) {
  console.warn(`${failed}/${routes.length} routes failed to revalidate — check them manually.`);
}
