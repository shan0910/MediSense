import sys
import json
import pickle
import os
import numpy as np  # Ensures proper data shape handling

def load_model():
    """Load the trained kidney disease prediction model."""
    model_path = os.path.join(os.path.dirname(__file__), 'kidney.pkl')
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file '{model_path}' not found.")
    with open(model_path, 'rb') as file:
        model = pickle.load(file)
    return model

def convert_categorical(value):
    """Convert categorical values to numerical form for model compatibility."""
    mapping = {
        "normal": 1, "abnormal": 0,
        "present": 1, "notpresent": 0,
        "good": 1, "poor": 0,
        "yes": 1, "no": 0
    }
    return mapping.get(value.lower(), value)  # Convert known categories, else keep original

def validate_input(input_data):
    """Validate and preprocess input data before feeding into the model."""
    required_fields = [
        'age', 'bp', 'sg', 'al', 'su', 
        'rbc', 'pc', 'pcc', 'ba', 'bgr', 
        'bu', 'sc', 'sod', 'pot', 'hemo', 
        'pcv', 'wc', 'rc', 'htn', 'dm', 
        'cad', 'appet', 'pe', 'ane'
    ]

    # Ensure all required fields exist
    missing_fields = [field for field in required_fields if field not in input_data]
    if missing_fields:
        raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")

    processed_features = []
    for field in required_fields:
        value = input_data[field]
        try:
            # Convert numeric fields to float
            if field in ['age', 'bp', 'sg', 'al', 'su', 'bgr', 'bu', 'sc', 'sod', 'pot', 'hemo', 'pcv', 'wc', 'rc']:
                processed_features.append(float(value))
            else:
                processed_features.append(convert_categorical(value))  # Convert categorical values
        except ValueError:
            raise ValueError(f"Invalid value for {field}: Expected a number but got '{value}'")

    return np.array(processed_features).reshape(1, -1)  # Ensures correct input shape

def predict(input_data, model):
    """Make a prediction using the trained model."""
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
