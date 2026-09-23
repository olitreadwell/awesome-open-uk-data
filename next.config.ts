import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  allowedDevOrigins: ['127.0.0.1'],
  // `next dev` upserts an agent-rules block into the tracked AGENTS.md
  // whenever its bytes differ from the installed version. The e2e suite
  // starts that server, so leaving this on dirties the tree after every
  // check run and the grow loop reads a dirty tree as locked. The block's
  // pointer to the bundled docs is kept by hand in AGENTS.md.
  agentRules: false,
  // better-sqlite3 is a native module; keep it external so the standalone
  // build traces it (with its .node binary) instead of trying to bundle it.
  serverExternalPackages: ['better-sqlite3', 'pg'],
};

export default nextConfig;
