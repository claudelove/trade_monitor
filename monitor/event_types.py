"""Document labels, not trading strategies or risk/execution policies."""
import re
EVENT_TYPES = {
    'earnings': {'name':'실적 공시','terms':['영업실적','손익구조','잠정실적','실적전망']},
    'buyback': {'name':'자기주식·주주환원 공시','terms':['자기주식','주식소각','현금ㆍ현물배당','기업가치제고']},
    'merger': {'name':'합병·지분거래 공시','terms':['공개매수','합병','주식교환','영업양수','타법인주식']},
    'financing': {'name':'자본변동 공시','terms':['유상증자','전환사채','신주인수권','감자']},
    'governance': {'name':'지배구조·특수상황 공시','terms':['경영권','주주총회','최대주주','분할','회생','상장폐지']},
    'other': {'name':'기타 공시','terms':[]},
}
def classify(title):
    normalize=lambda text:re.sub(r'[^0-9A-Za-z가-힣]','',text)
    title=normalize(title)
    return next((key for key,spec in EVENT_TYPES.items() if any(normalize(term) in title for term in spec['terms'])),'other')
def decorate(event):
    event=dict(event)
    event['event_type']=classify(event['title'])
    event['strategy']=event['event_type'] # Legacy dataset key, never a runtime strategy ID.
    event['correction']='정정' in event['title']
    event['stage']='정정 검토' if event['correction'] else ('결정' if '결정' in event['title'] else '공시 접수')
    event['priority']='검토 우선' if event['event_type']!='other' and not event['correction'] else '관찰'
    return event
