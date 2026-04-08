import os
from datetime import datetime, timedelta, timezone
import psycopg2
from psycopg2.extras import RealDictCursor
import jwt
from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Pega a URL do banco do Render. Se não achar, tenta uma local (opcional)
DATABASE_URL = os.environ.get("DATABASE_URL")
SECRET_KEY = os.environ.get("SECRET_KEY", "chave-secreta-de-seguranca-123")
JWT_ALG = 'HS256'
JWT_EXPIRE_MINUTES = 120

def get_db():
    # Conecta ao PostgreSQL usando a URL do Render
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    # No PostgreSQL usamos SERIAL para autoincremento
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS scores (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        username TEXT NOT NULL,
        score INTEGER NOT NULL,
        difficulty TEXT NOT NULL,
        modality TEXT NOT NULL,
        last_updated TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id))''')
    conn.commit()
    c.close()
    conn.close()

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
    
    conn = get_db(); c = conn.cursor()
    try:
        # No PostgreSQL usamos %s em vez de ?
        c.execute('INSERT INTO users (username, password_hash, created_at) VALUES (%s,%s,%s)',
                  (username, generate_password_hash(password), datetime.now().isoformat()))
        conn.commit()
        return jsonify({'message': 'Criado!'}), 201
    except Exception as e:
        print(e)
        return jsonify({'message': 'Usuário já existe'}), 409
    finally:
        c.close(); conn.close()

@app.route('/login', methods=['POST'])
def login_user():
    data = request.get_json(force=True)
    conn = get_db(); c = conn.cursor()
    c.execute('SELECT id, username, password_hash FROM users WHERE username = %s', (data.get('username'),))
    user = c.fetchone()
    c.close(); conn.close()
    
    if user and check_password_hash(user['password_hash'], data.get('password')):
        now = datetime.now(tz=timezone.utc)
        token = jwt.encode({
            'sub': str(user['id']), 
            'username': user['username'], 
            'exp': int((now + timedelta(minutes=JWT_EXPIRE_MINUTES)).timestamp())
        }, SECRET_KEY, algorithm=JWT_ALG)
        return jsonify({'access_token': token, 'username': user['username']}), 200
    return jsonify({'message': 'Erro no login'}), 401

@app.route('/me', methods=['GET'])
@jwt_required
def get_me():
    p = request.jwt_payload
    conn = get_db(); c = conn.cursor()
    c.execute('SELECT MAX(score) as best FROM scores WHERE user_id = %s', (p['sub'],))
    row = c.fetchone()
    c.close(); conn.close()
    return jsonify({
        'username': p['username'],
        'best_score': row['best'] if row['best'] else 0
    }), 200

@app.route('/leaderboard', methods=['GET'])
def leaderboard():
    conn = get_db(); c = conn.cursor()
    c.execute('SELECT username, MAX(score) as best FROM scores GROUP BY username ORDER BY best DESC LIMIT 10')
    rows = c.fetchall()
    c.close(); conn.close()
    return jsonify([{'username': r['username'], 'score': r['best']} for r in rows]), 200

@app.route('/submit_score', methods=['POST'])
@jwt_required
def save_score():
    data, p = request.get_json(force=True), request.jwt_payload
    conn = get_db(); c = conn.cursor()
    c.execute('INSERT INTO scores (user_id, username, score, difficulty, modality, last_updated) VALUES (%s,%s,%s,%s,%s,%s)',
              (p['sub'], p['username'], data['score'], data['difficulty'], data['modality'], datetime.now().isoformat()))
    conn.commit()
    c.close(); conn.close()
    return jsonify({'message': 'Salvo!'}), 201

if __name__ == '__main__':
    # Inicializa o banco se necessário
    if DATABASE_URL:
        init_db()
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))