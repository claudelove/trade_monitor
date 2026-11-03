"""Isolate third-party calls so a stalled pykrx request can be terminated."""
import contextlib
import io
import json
import sys
from monitor.providers.live import _krx_prices

if __name__ == '__main__':
    with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
        result = _krx_prices(sys.argv[3].split(','), sys.argv[1], sys.argv[2])
    print(json.dumps(result, allow_nan=False))
