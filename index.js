document.addEventListener("DOMContentLoaded", function () {
  // Select necessary DOM elements
  const input = document.querySelector("input"); // Input field for city search
  const dropdownMenu = document.getElementById("dropdownMenu"); // Dropdown menu for recent searches
  const search = document.querySelector(".Search-Btn"); // Search button

  // API URL and key
  const URL = "https://api.openweathermap.org/data/2.5/forecast?q=";
  const apiKey = "&appid=a8c6b2f664b4087779819f55c5a61081&units=metric";

  // Function to fetch weather data for a city
  const getWeather = async (cityName = "delhi") => {
    let weatherData = [];
    try {
      // Fetch weather data from API
      let response = await fetch(URL + cityName + apiKey);
      let data = await response.json();

      // Process weather data
      for (let i = 0; i < 5 * 8; i += 8) {
        weatherData.push(data.list[i]);
      }

      // Update UI with current weather information
      document.querySelector(".city").innerHTML = data.city.name;
      document.querySelector(".temp").innerHTML =
        Math.round(data.list[0].main.temp) + "&deg;C";
      document.querySelector(".Humidity").innerHTML =
        data.list[0].main.humidity + "%";
      document.querySelector(".wind").innerHTML =
        data.list[0].wind.speed + "km/h";

      // Update weather icon based on temperature
      let imgDiv = document.querySelector(".imgDiv");
      let img = document.createElement("img");
      img.setAttribute("src", switchImg(data.list[0].main.temp));
      img.setAttribute("class", "weather-icon");
      imgDiv.innerHTML = "";
      imgDiv.append(img);
    } catch (error) {
      // Handle errors when fetching weather data
      console.error("Error fetching weather data:", error);
      document.querySelector(".city").innerHTML = "Server Error";
    }

    // Show history data in UI
    showHistoryData(weatherData);
  };

  // Event listener for input field focus
  input.addEventListener("focus", () => {
    // Show dropdown menu
    dropdownMenu.classList.add("show");
    // Clear previous dropdown items
    dropdownMenu.innerHTML = "";

    // Retrieve recent searches from local storage
    const recentSearches = JSON.parse(localStorage.getItem("Cities")) ?? [];

    // Add recent searches to the dropdown menu

    recentSearches.forEach((city) => {
      const option = document.createElement("div");
      option.textContent = city;
      option.classList.add("dropdown-item");

      // const bbtn = document.querySelector(".Btn-new");
      // bbtn.addEventListener('click', ()=>{

      //   input.value = city
      // })

      option.addEventListener("click", (e) => {
        // Set the selected city in the input field
        input.value = city;
        // Hide the dropdown menu
        dropdownMenu.classList.remove("show");
      });
      dropdownMenu.appendChild(option);
    });
  });

  // Event listener for input field blur
  input.addEventListener("blur", () => {
    // Hide dropdown menu after a short delay
    setTimeout(() => {
      dropdownMenu.classList.remove("show");
    }, 400);
  });

  // Event listener for search button click
  search.addEventListener("click", () => {
    // Fetch weather data for the entered city
    getWeather(input.value);
    // Retrieve recent searches from local storage
    let searchCity = JSON.parse(localStorage.getItem("Cities")) ?? [];
    // Keep only the latest 5 searches in the array
    if (searchCity.length >= 5) {
      searchCity.pop();
    }
    const findCity = searchCity.filter((e) => e === input.value);
    if (findCity != input.value) {
      // Add the latest search to the beginning of the array
      searchCity.unshift(input.value);
      // Save the updated list of searches to local storage
      saveToLocalStorage(searchCity);
    }

    // Clear the input field
    input.value = "";
  });

  // Function to save data to local storage
  function saveToLocalStorage(data) {
    localStorage.setItem("Cities", JSON.stringify(data));
  }

  // Function to switch weather icon based on temperature
  function switchImg(temp) {
    if (temp > 20) {
      return "./images/summer.png";
    } else if (temp < 20 && temp > 10) {
      return "./images/cloud.png";
    } else if (temp < 20) {
      return "./images/cold.png";
    }
  }

  // Function to display history data in UI
  function showHistoryData(weatherData) {
    let div = document.createElement("div");
    div.innerHTML = weatherData
      .map((data) => {
        return `
          <div class="max-w-sm H-Card rounded overflow-hidden shadow-lg">
            <div class="px-6 py-4">
              <div class="font-bold text-xl mb-2 text-sm ">${data.dt_txt
                .toString()
                .split(" ")
                .shift()}</div>
            </div>
            <img
              class="w-full"
              src=${switchImg(data.main.temp)}
              alt="Sunset in the mountains"
            />
            <div class="px-6 pt-4 pb-2 text-sm">
              <div class="col">Temp ${data.main.temp} &deg;C</div>
              <div class="col">Wind ${data.wind.speed} M/S</div>
              <div class="col">Humidity ${data.main.humidity}</div>
            </div>
          </div>
        `;
      })
      .join(" ");
    document.querySelector(".history-Card").innerHTML = div.innerHTML;
  }

  // Initial call to fetch weather data for default city
  getWeather();
});
