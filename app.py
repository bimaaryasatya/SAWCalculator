from flask import Flask, render_template, request, jsonify
import numpy as np

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/googled7cbc6eee26b6f85.html')
def google():
    return render_template('googled7cbc6eee26b6f85.html')

@app.route('/calculate_saw', methods=['POST'])
def calculate_saw():
    data = request.json
    
    # Extract data from the request
    criteria = data['criteria']
    alternatives = data['alternatives']
    weights_input = data['weights']
    
    # Convert weights to a list of floats
    weights = [float(w) for w in weights_input]

    # Create a dictionary for criteria mapping (e.g., C1, C2, ...) for easier processing
    criteria_map = {crit['name']: i for i, crit in enumerate(criteria)}
    
    # Create a matrix for alternative values based on criteria
    # Initialize with zeros
    alternative_values = np.zeros((len(alternatives), len(criteria)))

    for i, alt in enumerate(alternatives):
        for crit_name, value in alt['values'].items():
            col_index = criteria_map[crit_name]
            alternative_values[i, col_index] = float(value)

    # --- SAW Calculation ---

    # 1. Normalization
    normalized_matrix = np.zeros_like(alternative_values, dtype=float)
    for j in range(len(criteria)):
        crit_type = criteria[j]['type']
        if crit_type == 'benefit':
            normalized_matrix[:, j] = alternative_values[:, j] / np.max(alternative_values[:, j])
        else:  # cost
            normalized_matrix[:, j] = np.min(alternative_values[:, j]) / alternative_values[:, j]

    # 2. Weighted Normalization
    weighted_normalized_matrix = normalized_matrix * np.array(weights)

    # 3. Final Score
    final_scores = np.sum(weighted_normalized_matrix, axis=1)

    # Prepare results for display
    results = []
    for i, alt in enumerate(alternatives):
        results.append({
            'name': alt['name'],
            'score': final_scores[i]
        })
    
    # Sort results by score in descending order
    results = sorted(results, key=lambda x: x['score'], reverse=True)

    # Convert numpy arrays to lists for JSON serialization
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
