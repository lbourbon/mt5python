#!/opt/homebrew/bin/python3.14
from flask import Flask, jsonify
from flask_cors import CORS
import json, random, re, string, websocket

app = Flask(__name__)
CORS(app)

def _rand(prefix):
    return prefix + ''.join(random.choices(string.ascii_lowercase, k=12))

def _msg(func, params):
    body = json.dumps({'m': func, 'p': params}, separators=(',', ':'))
    return f'~m~{len(body)}~m~{body}'

def _parse(raw):
    parts = re.split(r'~m~(\d+)~m~', raw)
    result = []
    i = 1
    while i + 1 <= len(parts) - 1:
        length = int(parts[i])
        result.append(parts[i + 1][:length])
        i += 2
    return result

def _extract_bars(msg):
    try:
        bars = msg['p'][1]['s1']['s']
        return [{'time': int(b['v'][0]), 'open': round(b['v'][1], 2),
                 'high': round(b['v'][2], 2), 'low': round(b['v'][3], 2),
                 'close': round(b['v'][4], 2)} for b in bars]
    except Exception:
        return []

def fetch_tv(symbol, exchange, interval='5', n_bars=200):
    ws = websocket.create_connection(
        'wss://data.tradingview.com/socket.io/websocket',
        headers={'Origin': 'https://www.tradingview.com'},
        timeout=15,
    )
    cs = _rand('cs_')
    sym = json.dumps({'symbol': f'{exchange}:{symbol}', 'adjustment': 'splits'})

    for func, params in [
        ('set_auth_token',       ['unauthorized_user_token']),
        ('chart_create_session', [cs, '']),
        ('resolve_symbol',       [cs, 'sym', f'={sym}']),
        ('create_series',        [cs, 's1', 's1', 'sym', interval, n_bars, '']),
    ]:
        ws.send(_msg(func, params))

    candles = {}
    completed = False

    while not completed:
        try:
            raw = ws.recv()
            for chunk in _parse(raw):
                if chunk.startswith('~h~'):
                    ws.send(f'~m~{len(chunk)}~m~{chunk}')
                    continue
                try:
                    msg = json.loads(chunk)
                    m = msg.get('m', '')
                    if m in ('timescale_update', 'du'):
                        for bar in _extract_bars(msg):
                            candles[bar['time']] = bar
                    elif m == 'series_completed':
                        completed = True
                except Exception:
                    pass
        except Exception:
            break

    ws.close()
    return sorted(candles.values(), key=lambda x: x['time'])

@app.route('/api/candles')
def candles():
    data = fetch_tv('WIN1!', 'BMFBOVESPA', '5', 200)
    return jsonify(data)

if __name__ == '__main__':
    app.run(port=5001)
