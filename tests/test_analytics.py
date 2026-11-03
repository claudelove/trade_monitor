import pytest
from monitor.analytics import backtest, study
from monitor.strategies import decorate
from monitor.strategies import classify


def bar(date, op=100, close=100, volume=100, value=10000):
    return {'date':date, 'open':op, 'close':close, 'volume':volume, 'value':value}


def event(id='one', date='2026-01-05', ticker='005930', title='자기주식취득결정'):
    return decorate({'id':id, 'date':date, 'available_at':date+'T23:59:59+09:00','ticker':ticker,'company':'기업','title':title})


def data(events, prices):
    return {'mode':'demo','events':events,'prices':prices}


def test_next_session_entry_and_both_sided_costs():
    s=data([event()], {'005930':[bar('2026-01-05',close=999),bar('2026-01-06',op=100,close=110)]})
    r=backtest(s, holding=1,cost_bps=20)
    assert r['trades'][0]['entry_date']=='2026-01-06'
    assert r['total_return']==pytest.approx(110*.998/(100*1.002)-1)


def test_insufficient_future_data_does_not_close_early():
    s=data([event()], {'005930':[bar('2026-01-05'),bar('2026-01-06')]})
    r=backtest(s,holding=5)
    assert r['count']==0
    assert r['skipped'][0]['reason']=='미완료 / 가격 없음'


def test_overlapping_events_do_not_compound_positions():
    rows=[bar(f'2026-01-{day:02}') for day in range(5,10)]
    s=data([event(),event('two','2026-01-06')],{'005930':rows})
    r=backtest(s,holding=3,cost_bps=0)
    assert r['count']==1
    assert r['skipped'][0]['reason']=='기존 포지션과 중복'


def test_mdd_uses_in_trade_daily_marks():
    rows=[bar('2026-01-05'),bar('2026-01-06',close=80),bar('2026-01-07',close=110)]
    r=backtest(data([event()],{'005930':rows}),holding=2,cost_bps=0)
    assert r['total_return']==pytest.approx(.1)
    assert r['max_drawdown']==pytest.approx(-.2)


def test_liquidity_uses_previous_bar_not_entry_day_volume():
    rows=[bar('2026-01-05',value=1),bar('2026-01-06',value=1000000)]
    r=backtest(data([event()],{'005930':rows}),holding=1,min_value=10)
    assert r['count']==0


def test_correction_is_excluded():
    rows=[bar('2026-01-05'),bar('2026-01-06')]
    r=backtest(data([event(title='[기재정정]자기주식취득결정')],{'005930':rows}),holding=1)
    assert r['count']==0


def test_benchmark_excess_uses_matching_entry_and_exit_dates():
    e=event()
    prices={'005930':[bar('2026-01-05'),bar('2026-01-06',close=110)],'069500':[bar('2026-01-06',op=100,close=105)]}
    r=study(e,prices,'069500')
    assert r['horizons'][0]['return']==pytest.approx(.1)
    assert r['horizons'][0]['excess']==pytest.approx(.05)
    assert r['horizons'][1]['return'] is None


def test_delayed_tradability_orders_by_actual_entry_date():
    rows_a=[bar('2026-01-05'),bar('2026-01-06',volume=0),bar('2026-01-07',volume=0),bar('2026-01-08')]
    rows_b=[bar('2026-01-06'),bar('2026-01-07')]
    r=backtest(data([event(ticker='AAAAAA'),event('two','2026-01-06','BBBBBB')],{'AAAAAA':rows_a,'BBBBBB':rows_b}),holding=1,cost_bps=0)
    assert [t['event_id'] for t in r['trades']]==['two','one']


def test_invalid_parameters_rejected():
    with pytest.raises(ValueError):
        backtest(data([],{}),holding=0)


def test_earnings_parentheses_and_delimiters_are_normalized():
    assert classify('연결재무제표기준영업(잠정)실적(공정공시)') == 'earnings'
    assert classify('현금ㆍ현물배당결정') == 'buyback'
