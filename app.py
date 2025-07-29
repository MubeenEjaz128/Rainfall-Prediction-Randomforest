import webbrowser
from threading import Timer
from flask import Flask, request, jsonify, render_template, url_for
import pickle
import pandas as pd
import requests
import os
from dotenv import load_dotenv

app = Flask(__name__)

# Load environment variables
load_dotenv()

# Load the trained model and feature names
with open("rainfall_prediction_model.pkl", "rb") as file:
    model_data = pickle.load(file)

model = model_data["model"]
feature_names = model_data["features"]  # Changed from "feature_names" to "features"

# Load API key from environment variable
WEATHER_API_KEY = os.getenv('WEATHER_API_KEY')  # Ensure this is set

@app.route('/')
def index():
    return render_template('index.html')  # Ensure index.html exists in templates folder

@app.route('/get_weather', methods=['GET'])
def get_weather():
    city = request.args.get('city')
    if not city:
        return jsonify({"error": "City parameter is missing"}), 400

    weather_url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric"

    try:
        response = requests.get(weather_url)
        data = response.json()

        if data.get('cod') != 200:
            return jsonify({"error": data.get('message', 'Error fetching weather data')}), 400

        # Extract required fields
        pressure = data['main']['pressure']
        temperature = data['main']['temp']
        humidity = data['main']['humidity']
        cloud = data['clouds']['all']
        winddirection = data['wind']['deg']
        windspeed = data['wind']['speed']

        # Calculate dew point using an approximation formula
        dewpoint = temperature - ((100 - humidity) / 5.0)

        # Estimate sunshine as 24 - (cloud coverage percentage / 100 * 24)
        sunshine = 24 - (cloud / 100 * 24)
        # Ensure sunshine is within 0-24
        sunshine = max(0, min(sunshine, 24))

        weather_data = {
            "pressure": pressure,
            "dewpoint": round(dewpoint, 2),
            "humidity": humidity,
            "cloud": cloud,
            "sunshine": round(sunshine, 2),
            "winddirection": winddirection,
            "windspeed": windspeed
        }

        return jsonify(weather_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_weather_coords', methods=['GET'])
def get_weather_coords():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    if not lat or not lon:
        return jsonify({"error": "Latitude and Longitude parameters are missing"}), 400

    weather_url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={WEATHER_API_KEY}&units=metric"

    try:
        response = requests.get(weather_url)
        data = response.json()

        if data.get('cod') != 200:
            return jsonify({"error": data.get('message', 'Error fetching weather data')}), 400

        # Extract required fields
        pressure = data['main']['pressure']
        temperature = data['main']['temp']
        humidity = data['main']['humidity']
        cloud = data['clouds']['all']
        winddirection = data['wind']['deg']
        windspeed = data['wind']['speed']

        # Calculate dew point using an approximation formula
        dewpoint = temperature - ((100 - humidity) / 5.0)

        # Estimate sunshine as 24 - (cloud coverage percentage / 100 * 24)
        sunshine = 24 - (cloud / 100 * 24)
        # Ensure sunshine is within 0-24
        sunshine = max(0, min(sunshine, 24))

        weather_data = {
            "pressure": pressure,
            "dewpoint": round(dewpoint, 2),
            "humidity": humidity,
            "cloud": cloud,
            "sunshine": round(sunshine, 2),
            "winddirection": winddirection,
            "windspeed": windspeed
        }

        return jsonify(weather_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    try:
        # Validate input values
        missing_features = [feature for feature in feature_names if data.get(feature) is None]
        
        if missing_features:
            return jsonify({"error": f"Missing input values for: {', '.join(missing_features)}"}), 400
        
        # Extract input values in the same order as model feature names
        input_data = [data.get(feature) for feature in feature_names]
        input_df = pd.DataFrame([input_data], columns=feature_names)

        # Prediction
        prediction = model.predict(input_df)[0]
        result = "Rainfall" if prediction == 1 else "No Rainfall"
        return jsonify({"prediction": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Function to open the browser automatically
def open_browser():
    webbrowser.open_new("http://127.0.0.1:5000/")

if __name__ == "__main__":
    # Automatically open the browser and run the app
    Timer(0, open_browser).start()
    app.run(debug=False)  # Set debug=True for debugging