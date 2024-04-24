from flask import Flask, jsonify, request
import torch

app = Flask(__name__)

# Load the model (ensure it is globally available)
model = torch.load('model.pth')
model.eval()

@app.route('/predict', methods=['POST'])
def predict():
    # Assume JSON input with a list of features
    data = request.get_json()
    inputs = torch.FloatTensor(data['features'])
    with torch.no_grad():
        outputs = model(inputs)
        _, predicted = torch.max(outputs.data, 1)
    return jsonify({'prediction': predicted.item()})

if __name__ == '__main__':
    app.run(debug=True)
