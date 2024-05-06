document.addEventListener("DOMContentLoaded", function () {
  // Select necessary DOM elements
  const input = document.querySelector("input"); // Input field for city search
  const dropdownMenu = document.getElementById("dropdownMenu"); // Dropdown menu for recent searches
  const search = document.querySelector(".Search-Btn"); // Search button
  const locationBtn = document.querySelector(".location"); // Button for using geolocation
  const locationErrorMsg = document.querySelector(".location-error"); // Error message for geolocation
  const locationLoadingMsg = document.querySelector(".location-loading"); // Loading message for geolocation
  const cityDisplay = document.querySelector(".city"); // Element to display city name
  const dateDisplay = document.querySelector(".date"); // Element to display date
  const tempDisplay = document.querySelector(".temp"); // Element to display temperature
  const humidityDisplay = document.querySelector(".Humidity"); // Element to display humidity
  const windDisplay = document.querySelector(".wind"); // Element to display wind speed
  const weatherIconContainer = document.querySelector(".imgDiv"); // Container for weather icon
  const historyCard = document.querySelector(".history-Card"); // Container for historical weather data

  // API URL and key
  const URL = "https://api.openweathermap.org/data/2.5/forecast";
  const apiKey = "a8c6b2f664b4087779819f55c5a61081";
  const units = "metric";

  // Function to fetch weather data for a city
  const getWeather = async (cityName) => {
    try {
      const response = await fetch(`${URL}?q=${cityName}&appid=${apiKey}&units=${units}`);
      const data = await response.json();

      // Update UI with current weather information
      updateCurrentWeatherUI(data);

      // Update weather icon based on temperature
      updateWeatherIcon(data.list[0].main.temp);
      
      // Save city to recent searches
      saveToRecentSearches(cityName);
      
      let fiveDayList = [data.list[8],data.list[16],data.list[24], data.list[32], data.list[38], data.list[39] ];
      showHistoryData(fiveDayList);
      // Show history data in UI
    

    } catch (error) {
      console.error("Error fetching weather data:", error);
      cityDisplay.innerHTML = "Server Error";
    }
  };

  // Function to fetch weather data based on geolocation
 // Function to fetch weather data based on geolocation
const getWeatherByGeoLocation = async () => {
  try {
    locationLoadingMsg.style.display = "block";
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  
    const response = await fetch(`${URL}?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${apiKey}&units=${units}`);
    const data = await response.json();
  
    // Update UI with current weather information
    updateCurrentWeatherUI(data);
  
    // Update weather icon based on temperature
    updateWeatherIcon(data.list[0].main.temp);
    
    // Show history data in UI
    let fiveDayList = [data.list[8],data.list[16],data.list[24], data.list[32], data.list[38], data.list[39] ];
    showHistoryData(fiveDayList);
    
    // Hide loading message
    locationLoadingMsg.style.display = "none";
  } catch (error) {
    console.error("Error fetching weather data by geolocation:", error);
    locationErrorMsg.style.display = "block";
    // Hide loading message on error
    locationLoadingMsg.style.display = "none";
  }
};


  // Function to update UI with current weather information
  const updateCurrentWeatherUI = (data) => {
    cityDisplay.innerHTML = data.city.name;
    dateDisplay.innerHTML = new Date(data.list[0].dt * 1000).toLocaleDateString();
    tempDisplay.innerHTML = Math.round(data.list[0].main.temp) + "&deg;C";
    humidityDisplay.innerHTML = data.list[0].main.humidity + "%";
    windDisplay.innerHTML = data.list[0].wind.speed + "m/s";
    input.value = ""
  };


  // Function to update weather icon based on temperature
  const updateWeatherIcon = (temp) => {
    let img = document.createElement("img");
    img.setAttribute("src", switchImg(temp));
    img.setAttribute("class", "weather-icon");
    weatherIconContainer.innerHTML = "";
    weatherIconContainer.appendChild(img);
  };

  // Function to switch weather icon based on temperature
  const switchImg = (temp) => {
    if (temp > 20) {
      return "./images/summer.png";
    } else if (temp > 10) {
      return "./images/cloud.png";
    } else {
      return "./images/cold.png";
    }
  };

  // Function to save city to recent searches
  const saveToRecentSearches = (cityName) => {
    let recentSearches = JSON.parse(localStorage.getItem("Cities")) || [];
    recentSearches = recentSearches.filter((city) => city !== cityName); // Remove duplicates
    recentSearches.unshift(cityName); // Add to the beginning
    recentSearches = recentSearches.slice(0, 5); // Keep only the latest 5 searches
    localStorage.setItem("Cities", JSON.stringify(recentSearches));
    renderRecentSearches(recentSearches);
  };

  // Function to display history data in UI
const showHistoryData = (weatherData) => {
  historyCard.innerHTML = weatherData
    .map((data) => {
      return `
        <div class="grid gap-4 H-Card rounded overflow-hidden  shadow-lg ">
          <div class="px-6 py-4">
            <div class="font-bold text-xl mb-2 text-sm ">${new Date(data.dt * 1000).toLocaleDateString()}</div>
          </div>
          <img
            class=" w-24"
            src=${switchImg(data.main.temp)}
            alt="Weather Icon"
          />
          <div class="px-6 pt-4 pb-2 text-sm">
            <div class="col">Temp ${data.main.temp} &deg;C</div>
            <div class="col">Wind ${data.wind.speed} m/s</div>
            <div class="col">Humidity ${data.main.humidity}%</div>
          </div>
        </div>
      `;
    })
    .join(" ");
};


  // Function to render recent searches in dropdown menu
  const renderRecentSearches = (recentSearches) => {
    dropdownMenu.innerHTML = "";
    recentSearches.forEach((city) => {
      const option = document.createElement("div");
      option.textContent = city;
      option.classList.add("dropdown-item");
      option.addEventListener("click", () => {
        input.value = city;
        dropdownMenu.classList.remove("show");
        getWeather(city);
      });
      dropdownMenu.appendChild(option);
    });
  };

  // Event listener for input field focus
  input.addEventListener("focus", () => {
    dropdownMenu.classList.add("show");
    renderRecentSearches(JSON.parse(localStorage.getItem("Cities")) || []);
  });

  // Event listener for input field blur
  input.addEventListener("blur", () => {
    setTimeout(() => {
      dropdownMenu.classList.remove("show");
    }, 400);
  });


  // Event listener for search button click
  search.addEventListener("click", () => {
    const cityName = input.value.trim();
    if (cityName !== "") {
      getWeather(cityName);
      input.value = "";
    }
  });

  // Event listener for location button click
  locationBtn.addEventListener("click", () => {
    locationErrorMsg.style.display = "none";
    getWeatherByGeoLocation();
  });

  // Initial call to fetch weather data for default city
  getWeather("Delhi");
});
