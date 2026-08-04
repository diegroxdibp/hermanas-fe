#!/usr/bin/env node
// Cloudflare's edge caches the SPA shell (index.html). A fresh `wrangler
// deploy` uploads new content and the _headers no-store rule stops *future*
// caching, but neither evicts what's already cached — a stale shell keeps
// pointing the browser at the previous bundle (and its baked-in apiUrl)
// until something purges it. Staging moved off the shared workers.dev
// domain onto staging.careclinica.com specifically so this could use
// Cloudflare's real zone-wide Purge Cache API instead of the workaround
// below, which only evicts whichever edge PoP happens to answer each
// request and was confirmed to leave other PoPs stale.
//
// With CLOUDFLARE_CACHE_PURGE_API_TOKEN (Zone > Cache Purge > Edit on
// careclinica.com) and CLOUDFLARE_ZONE_ID set as real environment
// variables on this machine
// — this is a local deploy-time credential, not something a running service
// can hand back, so it belongs in the OS environment rather than in Fly or
// Worker secrets — this purges the whole zone instantly. Without them, it
// falls back to hitting every route with Cache-Control: no-cache, which
// only reliably fixes whichever PoP is closest to wherever this script
// runs.
//
// Routes for the fallback are read from the Pages enum instead of
// duplicated here, so they can't silently drift out of sync the way the
// deploy config itself did.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const STAGING_URLS = [
  'https://staging.careclinica.com',
  'https://care-staging.diegrox-rox.workers.dev',
];
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

async function purgeViaApi(token, zoneId) {
  console.log(`Purging Cloudflare zone ${zoneId} via API...`);
  const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ purge_everything: true }),
  });
  const body = await res.json();

  if (!res.ok || !body.success) {
    console.error('✗ Purge API call failed:', JSON.stringify(body.errors ?? body));
    return false;
  }
  console.log('✓ Zone cache purged.');
  return true;
}

async function revalidate(url) {
  try {
    const res = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } });
    console.log(`${res.ok ? '✓' : '✗'} ${url} (${res.status})`);
    return res.ok;
  } catch (err) {
    console.log(`✗ ${url} (${err.message})`);
    return false;
  }
}

async function purgeViaRevalidation() {
  console.warn(
    'CLOUDFLARE_CACHE_PURGE_API_TOKEN/CLOUDFLARE_ZONE_ID not set in the environment — ' +
      'falling back to per-route revalidation. This only fixes the edge PoP this script ' +
      'happens to hit, not the whole network.',
  );

  const routes = resolveRoutes();
  const urls = STAGING_URLS.flatMap((base) => routes.map((path) => `${base}${path}`));
  console.log(`Revalidating ${urls.length} URLs...`);

  const results = await Promise.all(urls.map(revalidate));
  const failed = results.filter((ok) => !ok).length;
  if (failed > 0) {
    console.warn(`${failed}/${urls.length} requests failed — check them manually.`);
  }
  return failed === 0;
}

const { CLOUDFLARE_CACHE_PURGE_API_TOKEN, CLOUDFLARE_ZONE_ID } = process.env;

const ok =
  CLOUDFLARE_CACHE_PURGE_API_TOKEN && CLOUDFLARE_ZONE_ID
    ? await purgeViaApi(CLOUDFLARE_CACHE_PURGE_API_TOKEN, CLOUDFLARE_ZONE_ID)
    : await purgeViaRevalidation();

if (!ok) process.exitCode = 1;
