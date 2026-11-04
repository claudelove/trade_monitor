"""Deterministic synthetic fixtures. Never merged with live data."""
import datetime as dt
import random
from monitor.event_types import decorate

UNIVERSE = [('005930','삼성전자',73000),('000660','SK하이닉스',185000),('035420','NAVER',202000),('005380','현대차',240000),('105560','KB금융',85000),('068270','셀트리온',178000),('035720','카카오',42000),('069500','KODEX 200',35000)]


def generate():
    rng = random.Random(20261103)
    dates, date = [], dt.date(2026, 5, 4)
    while len(dates) < 132:
        if date.weekday() < 5:
            dates.append(date.isoformat())
        date += dt.timedelta(days=1)
    prices = {}
    for ticker, name, initial in UNIVERSE:
        rows, previous = [], initial
        for date in dates:
            op = previous * (1 + rng.gauss(0, .006))
            close = op * (1 + rng.gauss(.0008, .015))
            volume = rng.randint(300000, 3000000)
            rows.append({'date': date, 'open': round(op), 'high': round(max(op, close)*1.009), 'low': round(min(op,close)*.991), 'close': round(close), 'volume': volume, 'value': round(close*volume), 'source': 'synthetic', 'adjusted': True})
            previous = close
        prices[ticker] = rows
    titles = ['자기주식취득결정', '연결재무제표기준영업(잠정)실적', '유상증자결정', '주요사항보고서(회사합병결정)', '최대주주변경', '자기주식소각결정', '[기재정정]자기주식취득결정']
    events = []
    for i in range(49):
        ticker, name, _ = UNIVERSE[i % 7]
        date = dates[8 + i*2]
        events.append(decorate({'id': f'demo-{i}', 'ticker': ticker, 'company': name, 'title': titles[i % 7] + ' · 가상 예시', 'date': date, 'available_at': date+'T23:59:59+09:00', 'time_precision': 'date', 'url': None, 'source': 'SYNTHETIC'}))
    return {'mode': 'demo', 'as_of': dt.datetime.now(dt.timezone.utc).isoformat(), 'events': events, 'prices': prices, 'news': [], 'sources': [{'name':'데모 데이터','state':'demo','detail':'공시·가격 모두 합성 · 투자 판단용 실데이터 아님'}], 'window': {'start': dates[0], 'end': dates[-1]}}
