from flask import Flask, render_template, request, jsonify, g
import numpy as np
import sqlite3

app = Flask(__name__)
DATABASE = 'saw_data.db'

FIXED_TITLE = "SPK Pemilihan Smartphone Untuk Fotografi"
FIXED_CRITERIA = [
    {"name": "Daya_Baterai", "type": "benefit"},
    {"name": "Harga", "type": "cost"},
    {"name": "Angle_Axis", "type": "benefit"},
    {"name": "Penyimpanan", "type": "benefit"},
    {"name": "Resolusi", "type": "benefit"},
    {"name": "Skor_DXO", "type": "benefit"},
]

FIXED_ALTERNATIVES = [
    "Samsung S23 Ultra",
    "Samsung S24 Ultra",
    "Google Pixel 9 Pro",
    "Google Pixel 8 Pro",
    "Xiaomi 13",
    "Xiaomi 14",
    "Xiaomi 15",
    "iPhone 15 Pro",
    "iPhone 16 Pro",
]

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

def init_db():
    db = get_db()
    cursor = db.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS criteria (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            type TEXT NOT NULL
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS alternatives (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        )
    ''')
    db.commit()

    for crit in FIXED_CRITERIA:
        cursor.execute('SELECT id FROM criteria WHERE name = ?', (crit['name'],))
        if cursor.fetchone() is None:
            cursor.execute('INSERT INTO criteria (name, type) VALUES (?, ?)', (crit['name'], crit['type']))
    for alt in FIXED_ALTERNATIVES:
        cursor.execute('SELECT id FROM alternatives WHERE name = ?', (alt,))
        if cursor.fetchone() is None:
            cursor.execute('INSERT INTO alternatives (name) VALUES (?)', (alt,))
    db.commit()

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.before_request
def setup():
    init_db()

@app.route('/')
def index():
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT name, type FROM criteria ORDER BY id')
    criteria = [{"name": row[0], "type": row[1]} for row in cursor.fetchall()]
    cursor.execute('SELECT name FROM alternatives ORDER BY id')
    alternatives = [row[0] for row in cursor.fetchall()]
    return render_template('index.html', title=FIXED_TITLE, criteria=criteria, alternatives=alternatives)

@app.route('/googled7cbc6eee26b6f85.html')
def google():
    return render_template('googled7cbc6eee26b6f85.html')

@app.route('/calculate_saw', methods=['POST'])
def calculate_saw():
    data = request.json
    
    criteria = data['criteria']
    alternatives = data['alternatives']
    weights_input = data['weights']
    
    weights = [float(w) for w in weights_input]

    criteria_map = {crit['name']: i for i, crit in enumerate(criteria)}
    
    alternative_values = np.zeros((len(alternatives), len(criteria)))

    for i, alt in enumerate(alternatives):
        for crit_name, value in alt['values'].items():
            col_index = criteria_map[crit_name]
            alternative_values[i, col_index] = float(value)

    normalized_matrix = np.zeros_like(alternative_values, dtype=float)
    for j in range(len(criteria)):
        crit_type = criteria[j]['type']
        if crit_type == 'benefit':
            normalized_matrix[:, j] = alternative_values[:, j] / np.max(alternative_values[:, j])
        else:
            normalized_matrix[:, j] = np.min(alternative_values[:, j]) / alternative_values[:, j]

    weighted_normalized_matrix = normalized_matrix * np.array(weights)

    final_scores = np.sum(weighted_normalized_matrix, axis=1)

    results = []
    for i, alt in enumerate(alternatives):
        results.append({
            'name': alt['name'],
            'score': final_scores[i]
        })
    
    results = sorted(results, key=lambda x: x['score'], reverse=True)

    normalized_matrix_list = normalized_matrix.tolist()
    weighted_normalized_matrix_list = weighted_normalized_matrix.tolist()

    return jsonify({
        'normalized_matrix': normalized_matrix_list,
        'weighted_normalized_matrix': weighted_normalized_matrix_list,
        'final_scores': results,
        'criteria_names': [c['name'] for c in criteria],
        'alternative_names': [a['name'] for a in alternatives]
    })

if __name__ == '__main__':
    app.run(debug=True)
