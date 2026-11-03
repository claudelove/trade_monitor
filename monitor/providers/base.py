from typing import Protocol, TypedDict


class Bar(TypedDict):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int
    value: float
    source: str
    adjusted: bool
    value_estimated: bool


class DailyPriceProvider(Protocol):
    """Broker adapters should normalize daily OHLCV to this boundary.

    Real-time quotes require a separate timestamped quote schema, not fake bars.
    """
    def __call__(self, tickers: list[str], start: str, end: str) -> dict[str, list[Bar]]: ...
