import datetime as dt
import email.utils
import os
import urllib.parse
import urllib.request
import json
import xml.etree.ElementTree as ET
import contextlib
import io
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor, TimeoutError
from monitor.strategies import decorate


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'CatalystMonitor/0.1'}), timeout=20) as r:
        return r.read(8_000_000)


def dart(start, end):
    key = os.environ.get('DART_API_KEY')
    if not key:
        raise RuntimeError('DART_KEY_MISSING')
    events, total = [], 0
    for page in range(1, 6):
        params = urllib.parse.urlencode({'crtfc_key': key, 'bgn_de': start.replace('-', ''), 'end_de': end.replace('-', ''), 'page_count': 100, 'page_no': page, 'corp_cls': 'Y'})
        body = json.loads(get('https://opendart.fss.or.kr/api/list.json?' + params))
        if body.get('status') == '013':
            break
        if body.get('status') != '000':
            raise RuntimeError('DART_API_' + str(body.get('status', 'UNKNOWN')))
        total = int(body.get('total_count', 0))
        for row in body.get('list', []):
            date = dt.datetime.strptime(row['rcept_dt'], '%Y%m%d').date().isoformat()
            events.append(decorate({'id': row['rcept_no'], 'ticker': row.get('stock_code', ''), 'company': row['corp_name'], 'title': row['report_nm'], 'date': date, 'available_at': date + 'T23:59:59+09:00', 'time_precision': 'date', 'url': 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=' + row['rcept_no'], 'source': 'DART', 'observed_at': dt.datetime.now(dt.timezone.utc).isoformat()}))
        if page >= int(body.get('total_page', 1)):
            break
    return events, {'name': 'DART', 'state': 'ok', 'detail': f'유가증권시장 {len(events)} / {total}건 · 최대 500건', 'truncated': total > len(events)}


def news(query):
    url = 'https://news.google.com/rss/search?' + urllib.parse.urlencode({'q': query, 'hl': 'ko', 'gl': 'KR', 'ceid': 'KR:ko'})
    root = ET.fromstring(get(url))
    result = []
    for item in root.findall('./channel/item')[:30]:
        date = email.utils.parsedate_to_datetime(item.findtext('pubDate')).isoformat()
        result.append({'title': item.findtext('title'), 'url': item.findtext('link'), 'published_at': date, 'publisher': item.findtext('source', ''), 'source': 'Google News RSS', 'query': query, 'match': '검색어 기반 후보 · 공시와 인과관계 미확인'})
    return result


def _krx_prices(tickers, start, end):
    # pykrx is an end-of-day adapter; no claim of real-time prices.
    os.environ.setdefault('MPLCONFIGDIR', '/tmp/catalyst-matplotlib')
    with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
        from pykrx import stock
    prices = {}
    for ticker in tickers:
        frame = stock.get_market_ohlcv_by_date(start.replace('-', ''), end.replace('-', ''), ticker, adjusted=True)
        if frame.empty:
            continue
        prices[ticker] = [{'date': idx.date().isoformat(), 'open': float(row['시가']), 'high': float(row['고가']), 'low': float(row['저가']), 'close': float(row['종가']), 'volume': int(row['거래량']), 'value': float(row.get('거래대금', row['종가'] * row['거래량'])), 'value_estimated': '거래대금' not in frame.columns, 'source': 'pykrx / NAVER', 'adjusted': True} for idx, row in frame.iterrows() if row['종가'] > 0]
    return prices


def krx_prices(tickers, start, end):
    process = subprocess.run([sys.executable, '-m', 'monitor.providers.price_worker', start, end, ','.join(tickers)], capture_output=True, text=True, timeout=80, check=True)
    return json.loads(process.stdout)


def collect(start, end, tickers, query):
    result = {'mode': 'live', 'as_of': dt.datetime.now(dt.timezone.utc).isoformat(), 'events': [], 'prices': {}, 'news': [], 'sources': [], 'window': {'start': start, 'end': end}}
    # Run independent providers separately; failure in one must not hide the others.
    pool = ThreadPoolExecutor(max_workers=3)
    jobs = {'DART': pool.submit(dart, start, end), '뉴스 RSS': pool.submit(news, query), 'pykrx': pool.submit(krx_prices, tickers, start, end)}
    for name, future in jobs.items():
        try:
            value = future.result(timeout=110)
            if name == 'DART':
                result['events'], status = value
            elif name == '뉴스 RSS':
                result['news'] = value
                status = {'name': name, 'state': 'ok' if value else 'empty', 'detail': f'{len(value)}건 · 검색 후보'}
            else:
                result['prices'] = value
                status = {'name': name, 'state': 'ok' if value else 'blocked', 'detail': f'{len(value)}/{len(tickers)}종목 수정 일봉 · pykrx NAVER 경로 · 실시간 아님' if value else '일봉 수신 없음 · 접속 확인 필요'}
            result['sources'].append(status)
            status['collected_at'] = result['as_of']
        except Exception as exc:
            # Raw exceptions may contain a URL including a key. Only safe type/code is retained.
            code = str(exc) if isinstance(exc, RuntimeError) and str(exc).startswith('DART_') else type(exc).__name__
            result['sources'].append({'name': name, 'state': 'blocked', 'detail': code})
    pool.shutdown(wait=False, cancel_futures=True)
    return result
