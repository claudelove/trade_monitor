# syntax=docker/dockerfile:1
FROM python:3.12-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 MPLCONFIGDIR=/tmp/matplotlib MONITOR_DB=/app/data/monitor.db
COPY requirements.txt requirements.lock ./
RUN --mount=type=secret,id=proxy_ca \
    if [ -f /run/secrets/proxy_ca ]; then \
      PIP_CERT=/run/secrets/proxy_ca pip install --no-cache-dir -r requirements.txt; \
    else pip install --no-cache-dir -r requirements.txt; fi \
    && useradd --create-home --uid 10001 monitor
COPY monitor ./monitor
COPY web ./web
COPY fixtures ./fixtures
COPY scripts/container-entrypoint.sh /usr/local/bin/catalyst-entrypoint
RUN mkdir /app/data && chown -R monitor:monitor /app
RUN chmod 755 /usr/local/bin/catalyst-entrypoint
ENV MONITOR_BOOTSTRAP=/app/fixtures/bootstrap-live.json
EXPOSE 8000
ENTRYPOINT ["/usr/local/bin/catalyst-entrypoint"]
CMD ["python", "-m", "monitor.server"]
