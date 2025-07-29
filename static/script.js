// static/script.js

document.addEventListener('DOMContentLoaded', () => {
    const modeInputs = document.getElementsByName('mode');
    const citySection = document.getElementById('city-section');
    const currentLocationSection = document.getElementById('current-location-section');
    const manualSection = document.getElementById('manual-section');
    const weatherSection = document.getElementById('weather-section');
    const resultDiv = document.getElementById('result');

    // Function to hide all sections
    const hideAllSections = () => {
        citySection.style.display = 'none';
        currentLocationSection.style.display = 'none';
        manualSection.style.display = 'none';
        weatherSection.style.display = 'none';
        resultDiv.innerHTML = '';
        resultDiv.classList.remove('no-rain');
    };

    // Event listener for mode selection
    modeInputs.forEach(input => {
        input.addEventListener('change', () => {
            hideAllSections();
            if (input.value === 'city') {
                citySection.style.display = 'block';
            } else if (input.value === 'current') {
                currentLocationSection.style.display = 'block';
            } else if (input.value === 'manual') {
                manualSection.style.display = 'block';
            }
        });
    });

    // Initial display based on default selected mode
    const defaultMode = document.querySelector('input[name="mode"]:checked').value;
    if (defaultMode === 'city') {
        citySection.style.display = 'block';
    } else if (defaultMode === 'current') {
        currentLocationSection.style.display = 'block';
    } else if (defaultMode === 'manual') {
        manualSection.style.display = 'block';
    }

    // Event listener for Get Weather button (City Mode)
    document.getElementById('get-weather-city-btn').addEventListener('click', async () => {
        const city = document.getElementById('city').value.trim();
        if (!city) {
            alert("Please enter a city name.");
            return;
        }

        weatherSection.style.display = 'none';
        resultDiv.innerHTML = "<i class='fas fa-spinner fa-spin'></i> Fetching weather data...";

        try {
            const response = await fetch(`/get_weather?city=${encodeURIComponent(city)}`);
            const weatherData = await response.json();
            if (weatherData.error) {
                resultDiv.innerHTML = `<i class='fas fa-exclamation-triangle'></i> Error: ${weatherData.error}`;
                return;
            }

            // Populate the weather form with fetched data
            document.getElementById('pressure').value = weatherData.pressure;
            document.getElementById('dewpoint').value = weatherData.dewpoint.toFixed(2);
            document.getElementById('humidity').value = weatherData.humidity;
            document.getElementById('cloud').value = weatherData.cloud;
            document.getElementById('sunshine').value = weatherData.sunshine.toFixed(2);
            document.getElementById('winddirection').value = weatherData.winddirection;
            document.getElementById('windspeed').value = weatherData.windspeed;

            weatherSection.style.display = 'block';
            resultDiv.innerHTML = "<i class='fas fa-check-circle'></i> Weather data fetched. You can now predict.";
        } catch (error) {
            resultDiv.innerHTML = `<i class='fas fa-exclamation-triangle'></i> Error: ${error.message}`;
        }
    });

    // Event listener for Use Current Location button
    document.getElementById('get-weather-current-btn').addEventListener('click', () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        weatherSection.style.display = 'none';
        resultDiv.innerHTML = "<i class='fas fa-spinner fa-spin'></i> Fetching weather data...";

        navigator.geolocation.getCurrentPosition(async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            try {
                const response = await fetch(`/get_weather_coords?lat=${latitude}&lon=${longitude}`);
                const weatherData = await response.json();
                if (weatherData.error) {
                    resultDiv.innerHTML = `<i class='fas fa-exclamation-triangle'></i> Error: ${weatherData.error}`;
                    return;
                }

                // Populate the weather form with fetched data
                document.getElementById('pressure').value = weatherData.pressure;
                document.getElementById('dewpoint').value = weatherData.dewpoint.toFixed(2);
                document.getElementById('humidity').value = weatherData.humidity;
                document.getElementById('cloud').value = weatherData.cloud;
                document.getElementById('sunshine').value = weatherData.sunshine.toFixed(2);
                document.getElementById('winddirection').value = weatherData.winddirection;
                document.getElementById('windspeed').value = weatherData.windspeed;

                weatherSection.style.display = 'block';
                resultDiv.innerHTML = "<i class='fas fa-check-circle'></i> Weather data fetched. You can now predict.";
            } catch (error) {
                resultDiv.innerHTML = `<i class='fas fa-exclamation-triangle'></i> Error: ${error.message}`;
            }
        }, (error) => {
            resultDiv.innerHTML = `<i class='fas fa-exclamation-triangle'></i> Error: ${error.message}`;
        });
    });

    // Event listener for Predict button (City and Current Location Modes)
    document.getElementById('predict-btn').addEventListener('click', async () => {
        const formData = {
            pressure: parseFloat(document.getElementById('pressure').value),
            dewpoint: parseFloat(document.getElementById('dewpoint').value),
            humidity: parseInt(document.getElementById('humidity').value),
            cloud: parseInt(document.getElementById('cloud').value),
            sunshine: parseFloat(document.getElementById('sunshine').value),
            winddirection: parseFloat(document.getElementById('winddirection').value),
            windspeed: parseFloat(document.getElementById('windspeed').value)
        };

        resultDiv.innerHTML = "<i class='fas fa-spinner fa-spin'></i> Processing prediction...";

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            if (result.error) {
                resultDiv.innerHTML = `<i class='fas fa-exclamation-triangle'></i> Error: ${result.error}`;
            } else {
                // Change color based on prediction
                if (result.prediction === "Rainfall") {
                    resultDiv.style.color = "#ff6347"; // Tomato color for Rainfall
                    resultDiv.classList.remove('no-rain');
                    resultDiv.innerHTML = `<i class='fas fa-umbrella'></i> Result: ${result.prediction}`;
                } else {
                    resultDiv.style.color = "#28a745"; // Green color for No Rainfall
                    resultDiv.classList.add('no-rain');
                    resultDiv.innerHTML = `<i class='fas fa-sun'></i> Result: ${result.prediction}`;
                }
            }
        } catch (error) {
            resultDiv.innerHTML = `<i class='fas fa-exclamation-triangle'></i> Error: ${error.message}`;
        }
    });

    // Event listener for Predict button (Manual Mode)
    document.getElementById('predict-manual-btn').addEventListener('click', async () => {
        const formData = {
            pressure: parseFloat(document.getElementById('pressure_manual').value),
            dewpoint: parseFloat(document.getElementById('dewpoint_manual').value),
            humidity: parseInt(document.getElementById('humidity_manual').value),
            cloud: parseInt(document.getElementById('cloud_manual').value),
            sunshine: parseFloat(document.getElementById('sunshine_manual').value),
            winddirection: parseFloat(document.getElementById('winddirection_manual').value),
            windspeed: parseFloat(document.getElementById('windspeed_manual').value)
        };

        resultDiv.innerHTML = "<i class='fas fa-spinner fa-spin'></i> Processing prediction...";

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            if (result.error) {
                resultDiv.innerHTML = `<i class='fas fa-exclamation-triangle'></i> Error: ${result.error}`;
            } else {
                // Change color based on prediction
                if (result.prediction === "Rainfall") {
                    resultDiv.style.color = "#ff6347"; // Tomato color for Rainfall
                    resultDiv.classList.remove('no-rain');
                    resultDiv.innerHTML = `<i class='fas fa-umbrella'></i> Result: ${result.prediction}`;
                } else {
                    resultDiv.style.color = "#28a745"; // Green color for No Rainfall
                    resultDiv.classList.add('no-rain');
                    resultDiv.innerHTML = `<i class='fas fa-sun'></i> Result: ${result.prediction}`;
                }
            }
        } catch (error) {
            resultDiv.innerHTML = `<i class='fas fa-exclamation-triangle'></i> Error: ${error.message}`;
        }
    });
});
