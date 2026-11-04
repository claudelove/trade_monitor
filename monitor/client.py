"""Small agent/runtime client. Sends observations; never loads or runs strategy code."""
import base64
import json
import urllib.error
import urllib.parse
import urllib.request
from monitor.integration import Bundle

class MonitorClient:
    def __init__(self,base_url,username=None,password=None,timeout=15):
        parsed=urllib.parse.urlsplit(base_url)
        if parsed.scheme not in ('https','http') or parsed.username or parsed.password or not parsed.hostname:
            raise ValueError('Use a backend HTTP(S) URL without embedded credentials')
        if parsed.scheme=='http' and parsed.hostname not in ('127.0.0.1','localhost','::1'):
            raise ValueError('Use HTTPS for a remote backend')
        if (username is None)!=(password is None):
            raise ValueError('Provide both username and password')
        self.base_url=base_url.rstrip('/')
        self.headers={'Content-Type':'application/json'}
        if username is not None and password is not None:
            self.headers['Authorization']='Basic '+base64.b64encode((username+':'+password).encode()).decode()
        self.timeout=timeout
    def _request(self,path,payload=None):
        data=json.dumps(payload,ensure_ascii=False,allow_nan=False).encode() if payload is not None else None
        request=urllib.request.Request(self.base_url+path,data=data,headers=self.headers)
        try:
            with urllib.request.urlopen(request,timeout=self.timeout) as response:return json.load(response)
        except urllib.error.HTTPError as exc:raise RuntimeError('monitor_http_'+str(exc.code)) from None
        except urllib.error.URLError:raise RuntimeError('monitor_connection_failed') from None
    def state(self):return self._request('/api/runtime/state')
    def contract(self):return self._request('/api/runtime/contract')
    def publish(self,bundle):
        bundle=Bundle.model_validate(bundle)
        return self._request('/api/runtime/bundles',bundle.model_dump(mode='json'))
