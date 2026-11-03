"""Optional deployment access gate. Configure a password before Internet exposure."""
import base64
import os
import secrets
from starlette.responses import JSONResponse


class AccessGate:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        password = os.environ.get('MONITOR_PASSWORD')
        if scope['type'] != 'http' or scope.get('path') == '/healthz' or not password:
            return await self.app(scope, receive, send)
        authenticated = False
        header = dict(scope['headers']).get(b'authorization', b'')
        try:
            scheme, token = header.split(b' ', 1)
            user, supplied = base64.b64decode(token, validate=True).split(b':',1)
            authenticated = scheme.lower() == b'basic' and secrets.compare_digest(user, os.environ.get('MONITOR_USERNAME','research').encode()) and secrets.compare_digest(supplied, password.encode())
        except (ValueError, TypeError):
            pass
        if not authenticated:
            return await JSONResponse({'detail':'인증 필요'}, status_code=401, headers={'WWW-Authenticate':'Basic realm="Catalyst", charset="UTF-8"'})(scope, receive, send)
        await self.app(scope, receive, send)
