export const authoringGuide = `<div class="runbook">
<h3>STRATEGY CODE / CONTRACT v1</h3>
<p>One version contains Python signal code and a TOML policy file. Saving never imports code, starts a worker or changes a running strategy. Drafts stay on the protected server; unsaved edits stay in this pane's memory.</p>
<h4>1 / PYTHON</h4>
<p>Declare API_VERSION = "1" and create_strategy(). Return an object with on_bar(context). Read only completed context.history bars up to context.as_of. Return TargetDecision(weights, reason), or None to keep current positions without a new order. Weights are signed notional / NAV; omitted instruments target zero. An empty weights dict requests liquidation, subject to engine risk and liquidity.</p>
<p>Context exposes as_of, history, positions, instruments, equity and halted. Use a fresh instance per test. No broker calls, credentials, network/file I/O, import side effects, future bars or unseeded randomness. Python is trusted code, not a sandbox.</p>
<pre>from krx_system.strategy.runtime import TargetDecision
API_VERSION = "1"

class Strategy:
    def on_bar(self, context):
        # Implement signal, sizing and exit policy here.
        # None requests no new orders; this scaffold does not trade.
        return None

def create_strategy():
    return Strategy()</pre>
<h4>2 / CAPITAL & RISK — TOML</h4>
<p>[strategy]: name, initial_equity (KRW), gross_target (ratio), rebalance_every (bars), expression, top_n and portfolio. Expression/top_n/portfolio are legacy manifest requirements; Python supplies target weights. [[instruments]] declares symbol, kind, multiplier, tick_size, lot_size and margin_rate using verified source specifications.</p>
<p>[risk]: max_gross, max_symbol, max_order, max_drawdown, max_daily_loss and max_margin. All are ratios, not percentage points. Strategy-specific sizing and exit rules belong in Python; declared engine/account limits remain mandatory. A halt currently blocks all orders, including liquidation.</p>
<h4>3 / EXECUTION — TOML</h4>
<p>[execution]: fee_bps, sell_tax_bps, spread_bps, impact_bps and participation (ratio). Current bar engine attempts next eligible bar-open IOC fills with volume/cost assumptions; unfilled quantity expires. A signal is not a fill. Check context.positions on the next callback. Last positions are marked, not automatically closed.</p>
<h4>4 / AUTOMATED OPERATION — REQUIRED EXTENSIONS</h4>
<p>A complete deployment contract must additionally specify order type/limit/TTL, amend/cancel rules, market sessions, stale-data limits, partial-fill/UNKNOWN handling, reconciliation, restart checkpoints, kill/flatten behavior, pending exposure and hedge limits. Bar API v1 does not implement these callbacks or live policies. Document them as requirements; do not insert invented config keys and assume they work. Live dispatch remains disconnected.</p>
<h4>5 / REVIEW & TEST</h4>
<p>Test future-data invariance, missing/stale data, fees, partial liquidity, risk breaches and restart assumptions. Save a version, then review/register its exact source and manifest hashes on the server before historical execution. Editing code or policy invalidates the execution review. The agent and web should use the same version identity. Never put account secrets in source.</p>
</div>`;
