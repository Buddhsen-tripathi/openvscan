# Scanner container: Node runtime + Trivy CLI. Stateless HTTP scan server.
FROM node:22-slim

# Trivy (and certs/curl for the installer + remote scans)
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates git \
  && curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh \
       | sh -s -- -b /usr/local/bin \
  && apt-get purge -y curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY server.mjs ./

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.mjs"]
