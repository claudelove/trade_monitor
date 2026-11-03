FROM python:3.12-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 MPLCONFIGDIR=/tmp/matplotlib MONITOR_DB=/app/data/monitor.db
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && useradd --create-home --uid 10001 monitor
COPY monitor ./monitor
COPY web ./web
RUN mkdir /app/data && chown -R monitor:monitor /app
USER monitor
EXPOSE 8000
CMD ["uvicorn", "monitor.app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", "--no-access-log"]
