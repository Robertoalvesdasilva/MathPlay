import os
from datetime import datetime, timedelta, timezone
import sqlite3
import jwt
from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATABASE = 'mathplay.db'
SECRET_KEY = os.environ.get("SECRET_KEY", "chave-secreta-de-seguranca-123")
JWT_ALG = 'HS256'
JWT_EXPIRE_MINUTES = 120

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    db = get_db()
    c = db.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL)''')
    c.execute('''CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        username TEXT NOT NULL,
        score INTEGER NOT NULL,
        difficulty TEXT NOT NULL,
        modality TEXT NOT NULL,
        last_updated TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id))''')
    db.commit()
    db.close()

# Middleware de Proteção
def jwt_required(fn):
    def wrapper(*args, **kwargs):
        auth = request.headers.get('Authorization', '')
        if not auth.startswith('Bearer '):
            return jsonify({'message': 'Token ausente'}), 401
        token = auth.split(' ')[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALG])
            request.jwt_payload = payload
            return fn(*args, **kwargs)
        except:
            return jsonify({'message': 'Token inválido'}), 401
    wrapper.__name__ = fn.__name__
    return wrapper

@app.route('/register', methods=['POST'])
def register_user():
    data = request.get_json(force=True)
    username, password = data.get('username', '').strip(), data.get('password', '').strip()
    if not username or not password: return jsonify({'message': 'Erro nos dados'}), 400
    db = get_db(); c = db.cursor()
    try:
        c.execute('INSERT INTO users (username, password_hash, created_at) VALUES (?,?,?)',
                  (username, generate_password_hash(password), datetime.now().isoformat()))
        db.commit(); return jsonify({'message': 'Criado!'}), 201
    except: return jsonify({'message': 'Usuário já existe'}), 409
    finally: db.close()

@app.route('/login', methods=['POST'])
def login_user():
    data = request.get_json(force=True)
    db = get_db(); c = db.cursor()
    c.execute('SELECT id, username, password_hash FROM users WHERE username = ?', (data.get('username'),))
    user = c.fetchone(); db.close()
    if user and check_password_hash(user['password_hash'], data.get('password')):
        now = datetime.now(tz=timezone.utc)
        token = jwt.encode({'sub': str(user['id']), 'username': user['username'], 'exp': int((now + timedelta(minutes=JWT_EXPIRE_MINUTES)).timestamp())}, SECRET_KEY, algorithm=JWT_ALG)
        return jsonify({'access_token': token, 'username': user['username']}), 200
    return jsonify({'message': 'Erro'}), 401

# --- ROTA QUE ESTAVA FALTANDO ---
@app.route('/me', methods=['GET'])
@jwt_required
def get_me():
    p = request.jwt_payload
    db = get_db(); c = db.cursor()
    c.execute('SELECT MAX(score) as best FROM scores WHERE user_id = ?', (p['sub'],))
    row = c.fetchone(); db.close()
    return jsonify({
        'username': p['username'],
        'best_score': row['best'] if row['best'] else 0
    }), 200

@app.route('/leaderboard', methods=['GET'])
def leaderboard():
    db = get_db(); c = db.cursor()
    c.execute('SELECT username, MAX(score) as best FROM scores GROUP BY username ORDER BY best DESC LIMIT 10')
    rows = c.fetchall(); db.close()
    return jsonify([{'username': r['username'], 'score': r['best']} for r in rows]), 200

@app.route('/submit_score', methods=['POST'])
@jwt_required
def save_score():
    data, p = request.get_json(force=True), request.jwt_payload
    db = get_db(); c = db.cursor()
    c.execute('INSERT INTO scores (user_id, username, score, difficulty, modality, last_updated) VALUES (?,?,?,?,?,?)',
              (p['sub'], p['username'], data['score'], data['difficulty'], data['modality'], datetime.now().isoformat()))
    db.commit(); db.close()
    return jsonify({'message': 'Salvo!'}), 201

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))