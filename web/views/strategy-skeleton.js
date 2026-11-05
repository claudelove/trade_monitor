// Editable starter, not a registered strategy or production policy.
export const defaultSource = `from krx_system.strategy.runtime import TargetDecision

API_VERSION = "1"


class Strategy:
    def on_bar(self, context):
        if context.halted:
            return None  # Engine halt blocks orders, including liquidation.

        signal = self.signal(context)
        if signal is None:
            return None  # No new orders; existing positions remain.

        weights = self.target_weights(context, signal)
        weights = self.exit_policy(context, weights)
        weights = self.risk_policy(context, weights)
        if weights is None:
            return None

        return TargetDecision(weights=weights, reason="REPLACE_WITH_DECISION_REASON")

    def signal(self, context):
        # TODO: use completed context.history bars up to context.as_of.
        return None

    def target_weights(self, context, signal):
        # TODO: {symbol: signed notional / equity}; not order quantities.
        # Omitted symbols target zero. None means no new order.
        return None

    def exit_policy(self, context, weights):
        # TODO: implement strategy exits using actual context.positions.
        # {} requests liquidation; risk/liquidity may still block it.
        return weights

    def risk_policy(self, context, weights):
        # TODO: strategy sizing/exposure rules. Engine/account caps still apply.
        return weights


def create_strategy():
    return Strategy()
`;
export const defaultManifest = `# STARTER VALUES ONLY: replace instrument, capital, costs and limits.
# This skeleton produces no signals. It does not enable live trading.
[strategy]
name = "new_strategy"
initial_equity = 100000000
portfolio = "long_only"
gross_target = 0.10
rebalance_every = 1
# Legacy bar-v1 manifest fields; Python supplies the actual target weights.
expression = "close"
top_n = 1

[[instruments]]
symbol = "REPLACE_ME"
kind = "equity"
multiplier = 1
tick_size = 1
lot_size = 1
margin_rate = 1.0
# Placeholder specifications above are not a verified KRX instrument master.

[risk]
# Ratios: 0.05 = 5%. Account-wide limits also apply.
max_gross = 0.10
max_symbol = 0.05
max_order = 0.05
max_drawdown = 0.10
max_daily_loss = 0.02
max_margin = 0.10

[execution]
# Bar-v1: next eligible bar-open IOC simulation; remainder expires.
# Replace costs with instrument/date-specific assumptions. bps = 1/10000.
fee_bps = 1.0
sell_tax_bps = 0.0
spread_bps = 2.0
impact_bps = 10.0
participation = 0.01
# Live order type/TTL/amend/cancel/fill/restart policies need a future runtime.
`;
