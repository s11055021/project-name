from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/convert', methods=['POST'])
def convert():
    data = request.json
    text = data['text']
    # 這裡添加你的轉換邏輯
    result = {
        "漢字": text,
        "KIP": "example kip",
        "分詞": "example 分詞"
    }
    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
