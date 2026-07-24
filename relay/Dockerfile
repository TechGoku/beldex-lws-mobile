# Beldex LWS relay — Docker / self-host
# --------------------------------------
# WHY THIS EXISTS
# Some ISPs (observed on Reliance Jio, India) block the entire `*.beldex.io`
# domain at two layers:
#   1. DNS hijack — `lwsapi.beldex.io` resolves to an ISP-owned IP.
#   2. TLS SNI deep-packet inspection — connecting to the *real* Cloudflare IP
#      still gets an immediate RST because the ClientHello carries the blocked
#      hostname. Every port behaves the same (443, 8443, 2053, 2083, ...).
# Neither a different DNS resolver nor an alternate port defeats that, and
# tunnels (ngrok/serveo/trycloudflare) do not help — they only expose a machine
# that is itself behind the ISP.
#
# The fix is to run this container on a host OUTSIDE the blocking ISP (any VPS:
# Hetzner, DigitalOcean, Oracle, Linode, Contabo — all verified reachable) and
# point the wallet at it. It forwards a strict allowlist of LWS POST endpoints
# to https://lwsapi.beldex.io. Behaviour is identical to relay/cloudflare-worker.js.
#
# BUILD — context MUST be the repository root (COPY path is relay/node-server.js):
#   docker build -f relay/Dockerfile -t beldex-lws-relay .
#
# RUN:
#   docker run -d --name beldex-lws-relay --restart unless-stopped \
#     -p 8080:8080 beldex-lws-relay
#   curl http://localhost:8080/health
#   -> {"relay":"beldex-lws","upstream":"https://lwsapi.beldex.io"}
#
# Put a TLS terminator (Caddy/nginx/Traefik) in front of it on a domain the ISP
# does not block, then in the wallet: Settings -> Server / Node & Proxy ->
# LWS API URL -> paste https://your-relay.example.com and Save & Apply.
#
# PRIVACY NOTE
# The relay sees the same data the LWS already sees (address + view key) plus the
# client IP. Run it on a host YOU control; it never logs request bodies.

FROM node:20-alpine

# tini reaps zombies and forwards SIGTERM so `docker stop` is instant and clean.
RUN apk add --no-cache tini

ENV NODE_ENV=production \
    PORT=8080

WORKDIR /app

# Dependency-free single file: no npm install, no lockfile, nothing to audit.
COPY --chown=node:node relay/node-server.js ./relay/node-server.js

USER node

EXPOSE 8080

# Uses the same /health endpoint the wallet's "Test Connection" probes.
# busybox wget ships with alpine — no extra package needed.
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null "http://127.0.0.1:${PORT:-8080}/health" || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "relay/node-server.js"]
