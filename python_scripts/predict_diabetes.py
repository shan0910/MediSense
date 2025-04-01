import sys
import json
import pickle
import os
import joblib
import numpy as np  # Ensures proper data shape handling

def load_model():
    model_path = os.path.join(os.path.dirname(__file__), 'diabetes.pkl')
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file '{model_path}' not found.")
    with open(model_path, 'rb') as file:
        model = pickle.load(file)
    return model

def validate_input(input_data):
    required_fields = [
        'pregnancies', 'glucose', 'bloodPressure', 
        'skinThickness', 'insulin', 'bmi', 
        'diabetesPedigreeFunction', 'age'
    ]
    
    for field in required_fields:
        if field not in input_data:
            raise ValueError(f"Missing required field: {field}")
    
    try:
        features = [float(input_data[field]) for field in required_fields]
    except ValueError:
        raise ValueError("All input values must be numeric.")
    
    return np.array(features).reshape(1, -1)  # Ensures correct input shape

def predict(input_data, model):
    try:
        features = validate_input(input_data)
        result = model.predict(features)
        probability = model.predict_proba(features)[0].max()
        return {
            'predictionResult': 'Positive' if result[0] == 1 else 'Negative',
            'probability': round(probability, 2)
        }
    except Exception as e:
        return {'error': str(e)}

if __name__ == '__main__':
    input_json = sys.argv[1] if len(sys.argv) > 1 else '{}'
    
    try:
        input_data = json.loads(input_json)
    except json.JSONDecodeError:
        print(json.dumps({'error': 'Invalid JSON input.'}))
        sys.exit(1)

    try:
        model = load_model()
        result = predict(input_data, model)
        print(json.dumps(result))
    except (FileNotFoundError, ValueError) as error:
        print(json.dumps({'error': str(error)}))
    except Exception as e:
        print(json.dumps({'error': str(e)}))
