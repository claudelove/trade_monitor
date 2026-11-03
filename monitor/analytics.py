"""Conservative daily-bar event study and single-position strategy simulator."""
import datetime as dt
import math


def eligible_date(event):
    available = dt.datetime.fromisoformat(event.get('available_at', event['date'] + 'T23:59:59+09:00'))
    if available.tzinfo is None:
        available = available.replace(tzinfo=dt.timezone(dt.timedelta(hours=9)))
    # Date-only disclosures are first actionable on a strictly later session.
    return available.astimezone(dt.timezone(dt.timedelta(hours=9))).date().isoformat()


def study(event, prices, benchmark):
    rows = sorted(prices.get(event['ticker'], []), key=lambda x: x['date'])
    index = next((i for i, r in enumerate(rows) if r['date'] > eligible_date(event) and r['open'] > 0 and r['volume'] > 0), None)
    if index is None:
        return {'available': False, 'reason': '이벤트 이후 거래 가능한 일봉 없음'}
    base = rows[index]
    bm = {r['date']: r for r in prices.get(benchmark, [])}
    horizons = []
    for hold in (1, 3, 5, 10, 20):
        j = index + hold - 1
        if j >= len(rows):
            horizons.append({'days': hold, 'return': None, 'excess': None})
            continue
        end = rows[j]
        ret = end['close'] / base['open'] - 1
        a, b = bm.get(base['date']), bm.get(end['date'])
        excess = ret - (b['close'] / a['open'] - 1) if a and b and a['open'] > 0 else None
        horizons.append({'days': hold, 'return': ret, 'excess': excess})
    return {'available': True, 'entry_date': base['date'], 'entry_price': base['open'], 'horizons': horizons}


def backtest(snapshot, strategy='buyback', holding=5, cost_bps=20, min_value=0, start=None, end=None):
    if not 1 <= holding <= 60 or not 0 <= cost_bps <= 500 or min_value < 0:
        raise ValueError('invalid parameters')
    prices = snapshot['prices']
    candidates = sorted((e for e in snapshot['events'] if e['strategy'] == strategy and not e.get('correction') and e.get('ticker') and (not start or e['date'] >= start) and (not end or e['date'] <= end)), key=lambda e: (eligible_date(e), e['id']))
    trades, skipped, busy_until, proposals = [], [], '', []
    # One fully funded position at a time. No simultaneous-event return multiplication.
    for event in candidates:
        rows = sorted(prices.get(event['ticker'], []), key=lambda r: r['date'])
        i = next((i for i, r in enumerate(rows) if r['date'] > eligible_date(event) and r['open'] > 0 and r['volume'] > 0), None)
        reason = None
        if i is None or i + holding > len(rows):
            reason = '미완료 / 가격 없음'
        elif i == 0 or rows[i-1]['value'] < min_value:
            reason = '진입 전 거래대금 미달 / 관측 없음'
        elif any(r['volume'] <= 0 or r['close'] <= 0 for r in rows[i:i+holding]):
            reason = '거래정지 / 유효하지 않은 봉'
        if reason:
            skipped.append({'id': event['id'], 'reason': reason})
            continue
        a, b = rows[i], rows[i + holding - 1]
        proposals.append((a['date'], event['id'], event, a, b))
    for _, _, event, a, b in sorted(proposals, key=lambda p:(p[0],p[1])):
        if a['date'] <= busy_until:
            skipped.append({'id': event['id'], 'reason': '기존 포지션과 중복'})
            continue
        gross = b['close'] / a['open'] - 1
        # cost_bps is per side, all-in fees/tax/slippage assumption.
        net = b['close'] * (1 - cost_bps / 10000) / (a['open'] * (1 + cost_bps / 10000)) - 1
        trades.append({'event_id': event['id'], 'company': event['company'], 'ticker': event['ticker'], 'entry_date': a['date'], 'exit_date': b['date'], 'entry_price': a['open'], 'exit_price': b['close'], 'gross': gross, 'net': net})
        busy_until = b['date']
    # Mark to market each available session, including costs at entry and exit.
    dates = sorted({r['date'] for t in trades for r in prices[t['ticker']] if trades[0]['entry_date'] <= r['date'] <= trades[-1]['exit_date']}) if trades else []
    equity, cash, active, curve = 1.0, 1.0, None, []
    entries = {t['entry_date']: t for t in trades}
    price_maps = {ticker: {r['date']: r for r in rows} for ticker, rows in prices.items()}
    for date in dates:
        if date in entries:
            active = entries[date]
            shares = cash / (active['entry_price'] * (1 + cost_bps / 10000))
        if active:
            bar = price_maps[active['ticker']].get(date)
            if bar:
                equity = shares * bar['close']
            if date == active['exit_date']:
                cash = equity * (1 - cost_bps / 10000)
                equity, active = cash, None
        else:
            equity = cash
        curve.append({'date': date, 'equity': equity})
    peak, mdd = 1.0, 0.0
    for row in curve:
        peak = max(peak, row['equity'])
        mdd = min(mdd, row['equity'] / peak - 1)
    return {'mode': snapshot['mode'], 'trades': trades, 'skipped': skipped, 'curve': curve, 'total_return': equity - 1, 'max_drawdown': mdd, 'win_rate': sum(t['net'] > 0 for t in trades) / len(trades) if trades else None, 'count': len(trades), 'assumptions': ['공시일 다음 거래 가능일 시가 진입', f'{holding}개 종목 거래일 보유 후 종가 청산', '현금 100% 단일 포지션 · 중복 신호 제외', f'매수·매도 각각 {cost_bps}bp 비용', '롱온리 · 손절/공매도/레버리지 미구현', '일봉 종가 평가 MDD · 장중 손실 미포함', '선택 종목·공시 표본 기준 · 생존편향 통제 안 됨', '수정주가 기준 · 배당 현금흐름 별도 반영 안 됨', '거래대금 미제공 시 종가×거래량 추정치로 진입 전일 필터']}
