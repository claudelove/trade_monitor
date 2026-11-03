"""Explainable triage rules, deliberately not a probability or recommendation."""
import re

STRATEGIES = {
    'earnings': {'name': '실적 · 가이던스', 'terms': ['영업실적', '손익구조', '잠정실적', '실적전망'], 'thesis': '실적 서프라이즈 이후 정보 반영 지연을 검증', 'checks': ['컨센서스 대비 서프라이즈 수치', '일회성 손익·회계 변경', '업종·시장 대비 초과수익']},
    'buyback': {'name': '자사주 · 주주환원', 'terms': ['자기주식', '주식소각', '현금ㆍ현물배당', '기업가치제고'], 'thesis': '매입·소각의 규모와 실제 이행에 따른 재평가 검증', 'checks': ['시가총액 대비 매입 규모', '결정·취득·소각 구분', '재원·집행 기간·기존 보유분']},
    'merger': {'name': 'M&A · 공개매수', 'terms': ['공개매수', '합병', '주식교환', '영업양수', '타법인주식'], 'thesis': '거래 조건과 종결 위험을 반영한 이벤트 스프레드 연구', 'checks': ['공개매수가·현금/주식 교환비율', '승인·자금조달·일정', '실패 시 가격·헤지·대차 가능 여부']},
    'financing': {'name': '자본조달 · 희석', 'terms': ['유상증자', '전환사채', '신주인수권', '감자'], 'thesis': '희석과 자금 사용 목적, 리픽싱 조건을 함께 관찰', 'checks': ['완전희석 주식수·발행가', '리픽싱·전환 일정', '대차 수수료·공매도 가능 종목']},
    'governance': {'name': '지배구조 · 특수상황', 'terms': ['경영권', '주주총회', '최대주주', '분할', '회생', '상장폐지'], 'thesis': '지배구조 변화와 구조조정의 촉매·손실 비대칭 평가', 'checks': ['의결권·주주 구성', '법적 절차·주식매수청구권', '거래정지·유동성·상장 유지 위험']},
    'other': {'name': '기타 공시', 'terms': [], 'thesis': '추가 내용 검토 필요', 'checks': ['원문 확인·이벤트 분류 검토']},
}


def classify(title):
    normalize = lambda text: re.sub(r'[^0-9A-Za-z가-힣]', '', text)
    title = normalize(title)
    for key, spec in STRATEGIES.items():
        if any(normalize(term) in title for term in spec['terms']):
            return key
    return 'other'


def decorate(event):
    event = dict(event)
    event['strategy'] = classify(event['title'])
    event['correction'] = '정정' in event['title']
    event['stage'] = '정정 검토' if event['correction'] else ('결정' if '결정' in event['title'] else '공시 접수')
    event['priority'] = '검토 우선' if event['strategy'] != 'other' and not event['correction'] else '관찰'
    return event
