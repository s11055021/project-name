from flask import Flask, request, jsonify
from flask_cors import CORS
from http.client import HTTPSConnection
from urllib.parse import urlencode
import json

app = Flask(__name__)
CORS(app)

def tàuphahjī(漢羅, **tshamsoo):
    conn = HTTPSConnection("hokbu.ithuan.tw")
    tshamsoo = urlencode({'taibun': 漢羅, **tshamsoo})
    headers = {
        "Content-type": "application/x-www-form-urlencoded",
        "Accept": "text/plain"
    }
    conn.request("POST", "/tau", tshamsoo, headers)
    responseStr = conn.getresponse().read().decode('utf-8')
    conn.close()
    return json.loads(responseStr)

@app.route('/convert', methods=['POST'])
def convert():
    data = request.json
    text = data['text']
    # 使用tàuphahjī函數進行轉換
    try:
        result = tàuphahjī(text)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
