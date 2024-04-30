from flask import Flask, jsonify, request
import torch
import numpy as np
import torch.nn as nn

# Define the EEGAutoencoderClassifier class to ensure compatibility when loading
class EEGAutoencoderClassifier(nn.Module):
    def __init__(self, num_classes):
        super(EEGAutoencoderClassifier, self).__init__()
        self.encoder = nn.Sequential(
            nn.Linear(50880, 256),  # Input is 64 channels * 795 time points
            nn.ReLU(),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU()
        )
        self.classifier = nn.Sequential(
            nn.Linear(64, num_classes),
            nn.LogSoftmax(dim=1)
        )

    def forward(self, x):
        x = x.view(x.size(0), -1)  # Flatten the input
        x = self.encoder(x)
        x = self.classifier(x)
        return x

app = Flask(__name__)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load the entire model
model = torch.load('model.pth', map_location=device)  # Ensure the model is loaded to the right device
model.eval()

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    try:
        # Convert JSON data to numpy array and ensure correct shape
        eeg_data = np.array(data['eeg_data']).astype(float)
        if eeg_data.shape != (64, 795):
            raise ValueError("Invalid data shape.")
        
        # Convert data to tensor and perform inference
        eeg_data = torch.tensor(eeg_data, dtype=torch.float32).unsqueeze(0).to(device)  # Add batch dimension
        with torch.no_grad():
            outputs = model(eeg_data)
            _, predicted = torch.max(outputs, 1)
        return jsonify({'prediction': predicted.item()})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
