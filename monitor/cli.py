import argparse
import datetime as dt
import json
import re
from zoneinfo import ZoneInfo
from monitor.providers.live import collect
from monitor.store import save_live

if __name__ == '__main__':
    p = argparse.ArgumentParser(description='Collect DART, news and pykrx EOD data')
    today = dt.datetime.now(ZoneInfo('Asia/Seoul')).date()
    p.add_argument('--start', default=(today-dt.timedelta(days=30)).isoformat())
    p.add_argument('--end', default=today.isoformat())
    p.add_argument('--query', default='한국 기업 자사주 공개매수 실적')
    p.add_argument('--tickers', default='005930,000660,035420,005380,105560,069500')
    args = p.parse_args()
    a,b = dt.date.fromisoformat(args.start), dt.date.fromisoformat(args.end)
    tickers = args.tickers.split(',')
    if not 1 <= len(args.query) <= 150 or not 0 <= (b-a).days <= 120 or len(tickers)>12 or any(not re.fullmatch(r'[0-9A-Z]{6}', t) for t in tickers):
        p.error('날짜 범위 0~120일, 최대 12종목, 영문 대문자·숫자 6자리 코드 필요')
    data = collect(args.start, args.end, tickers, args.query)
    save_live(data)
    print(json.dumps({'sources':data['sources'], 'events':len(data['events']), 'tickers':len(data['prices']), 'news':len(data['news'])},ensure_ascii=False))
