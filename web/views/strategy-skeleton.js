// Public authoring templates, written against bar API v1. No private strategy source.
export const defaultSource = String.raw`from dataclasses import dataclass
from math import isfinite
from typing import Mapping

from krx_system.strategy.runtime import StrategyContext, TargetDecision

API_VERSION = "1"


@dataclass(frozen=True)
class Parameters:
    warmup_bars: int = 1
    max_symbol_weight: float = 0.05
    max_gross_weight: float = 0.10


class Strategy:
    def __init__(self, parameters: Parameters = Parameters()):
        self.parameters = parameters

    def on_bar(self, context: StrategyContext) -> TargetDecision | None:
        # Called after a completed bar; execution is on a later eligible bar.
        # context is a read-only snapshot of THIS strategy's book.
        if context.halted or not isfinite(context.equity) or context.equity <= 0:
            return None
        if any(len(context.history.get(symbol, ())) < self.parameters.warmup_bars
               for symbol in context.instruments):
            return None  # Warmup: retain positions, submit no new target.

        weights = self.decide_targets(context)
        if weights is None:
            return None  # Hold is different from {} (target flat).
        weights = self.apply_exit_rules(context, weights)
        self.check_strategy_risk(context, weights)
        return TargetDecision(
            weights=dict(weights),
            reason=self.decision_reason(context, weights)[:1000],
        )

    def decide_targets(self, context: StrategyContext) -> Mapping[str, float] | None:
        # Implement entry/hold logic using available history only.
        # Return signed NOTIONAL / NAV weights, not quantity or margin weights.
        # Every omitted instrument targets zero. Check actual context.positions:
        # an earlier signal may have been rejected or only partly filled.
        raise NotImplementedError("Implement entry and target allocation")

    def apply_exit_rules(self, context: StrategyContext,
                         weights: Mapping[str, float]) -> Mapping[str, float]:
        # Implement time/price/signal exits as required by YOUR specification.
        # {} requests flat; engine halt/liquidity can still block liquidation.
        raise NotImplementedError("Implement exit policy, including no-exit if intentional")

    def check_strategy_risk(self, context: StrategyContext,
                            weights: Mapping[str, float]) -> None:
        # Local checks supplement mandatory engine/account risk; never bypass it.
        for symbol, weight in weights.items():
            if symbol not in context.instruments:
                raise ValueError(f"Unregistered instrument: {symbol}")
            if type(weight) not in (int, float) or not isfinite(weight):
                raise ValueError("Target weights must be finite numbers")
            if abs(weight) > self.parameters.max_symbol_weight:
                raise ValueError("Strategy symbol limit exceeded")
            if weight < 0 and context.instruments[symbol].kind != "future":
                raise ValueError("Bar API v1 permits short targets only for futures")
        if sum(abs(weight) for weight in weights.values()) > self.parameters.max_gross_weight:
            raise ValueError("Strategy gross limit exceeded")

    def decision_reason(self, context: StrategyContext,
                        weights: Mapping[str, float]) -> str:
        return f"{type(self).__name__}; as_of={context.as_of.isoformat()}; targets={dict(weights)}"


def create_strategy() -> Strategy:
    # A fresh instance per independent run. Bar v1 has no restart checkpoint,
    # event/fill/timer callbacks or live limit/TTL/cancel transport.
    return Strategy()
`;
export const defaultManifest = String.raw`# SYNTHETIC demo instrument specifications, not verified live KRX master data.
# Replace universe, capital, limits and dated cost assumptions for actual research.
[strategy]
name = "new_strategy"
initial_equity = 100000000
portfolio = "long_only"
gross_target = 0.10
rebalance_every = 1
# Required by legacy manifest schema; Python supplies the actual targets.
expression = "close"
top_n = 2

[[instruments]]
symbol = "DEMO_A"
kind = "equity"
multiplier = 1
tick_size = 10
lot_size = 1
margin_rate = 1.0

[[instruments]]
symbol = "DEMO_B"
kind = "equity"
multiplier = 1
tick_size = 10
lot_size = 1
margin_rate = 1.0

[[instruments]]
symbol = "DEMO_C"
kind = "equity"
multiplier = 1
tick_size = 10
lot_size = 1
margin_rate = 1.0

[risk]
# All limits are ratios of book equity, not percentages or margin amounts.
max_gross = 0.10
max_symbol = 0.05
max_order = 0.05
max_drawdown = 0.10
max_daily_loss = 0.02
max_margin = 0.10
# Halt blocks ALL orders; it is not an emergency liquidation mechanism.

[execution]
# Next eligible bar-open IOC simulation. Unfilled remainder expires.
# Full-bar participation is a scenario assumption, not opening-auction liquidity.
fee_bps = 1.0
sell_tax_bps = 0.0
spread_bps = 2.0
impact_bps = 10.0
participation = 0.01
# No funding/borrow/dividends/corporate-action model or live order transport.
`;
export const referenceSource = String.raw`from math import isfinite
from krx_system.strategy.runtime import StrategyContext, TargetDecision

API_VERSION = "1"
LOOKBACK = 20
TOP_N = 2
GROSS_TARGET = 0.10
MAX_SYMBOL = 0.05


class ReferenceMomentum:
    """Runnable OHLCV example for the SYNTHETIC demo dataset, not a trade recommendation.

    Rank positive trailing returns, break ties by symbol, equal-weight up to two
    instruments. Missing/warmup/untradable data -> hold; no positives -> flat.
    Recompute the complete target each bar. Engine owns actual fills and risk.
    """
    def on_bar(self, context: StrategyContext) -> TargetDecision | None:
        if context.halted:
            return None
        ranked = []
        for symbol in sorted(context.instruments):
            history = context.history.get(symbol, ())
            if len(history) < LOOKBACK + 1:
                return None
            first, last = history[-LOOKBACK - 1], history[-1]
            if not last.tradable or not all(isfinite(v) and v > 0 for v in (first.close, last.close)):
                return None
            score = last.close / first.close - 1.0
            if score > 0:
                ranked.append((symbol, score))
        selected = sorted(ranked, key=lambda item: (-item[1], item[0]))[:TOP_N]
        # Do not increase concentration when fewer candidates are available.
        weight = min(MAX_SYMBOL, GROSS_TARGET / TOP_N)
        targets = {symbol: weight for symbol, _ in selected}
        return TargetDecision(targets, f"REFERENCE ONLY / positive {LOOKBACK}-bar return; selected={list(targets)}")


def create_strategy() -> ReferenceMomentum:
    return ReferenceMomentum()
`;
export const strategyTemplates = {
 contract:{label:'Contract skeleton — implement hooks',source:defaultSource,manifest:defaultManifest},
 reference:{label:'Runnable OHLCV reference — synthetic data',source:referenceSource,manifest:defaultManifest.replace('name = "new_strategy"','name = "reference_momentum"')}
};
