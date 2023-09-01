const temp = document.getElementById("temp"),
  date = document.getElementById("date-time"),
  condition = document.getElementById("condition"),
  rain = document.getElementById("rain"),
  mainIcon = document.getElementById("icon"),
  currentLocation = document.getElementById("location"),
  uvIndex = document.querySelector(".uv-index"),
  uvText = document.querySelector(".uv-text"),
  windSpeed = document.querySelector(".wind-speed"),
  sunRise = document.querySelector(".sun-rise"),
  sunSet = document.querySelector(".sun-set"),
  humidity = document.querySelector(".humidity"),
  visibilty = document.querySelector(".visibilty"),
  humidityStatus = document.querySelector(".humidity-status"),
  airQuality = document.querySelector(".air-quality"),
  airQualityStatus = document.querySelector(".air-quality-status"),
  visibilityStatus = document.querySelector(".visibilty-status"),
  searchForm = document.querySelector("#search"),
  search = document.querySelector("#query"),
  celciusBtn = document.querySelector(".celcius"),
  fahrenheitBtn = document.querySelector(".fahrenheit"),
  tempUnit = document.querySelectorAll(".temp-unit"),
  hourlyBtn = document.querySelector(".hourly"),
  weekBtn = document.querySelector(".week"),
  weatherCards = document.querySelector("#weather-cards");

let currentCity = "Jablapur";
let currentUnit = "c";
let hourlyorWeek = "week";

// function to get date and time

function getDateTime() {
  let now = new Date(),
    hour = now.getHours(),
    minute = now.getMinutes();

  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  // 12 hours format
  hour = hour % 12;
  if (hour < 10) {
    hour = "0" + hour;
  }
  if (minute < 10) {
    minute = "0" + minute;
  }
  let dayString = days[now.getDay()];
  return `${dayString}, ${hour}:${minute}`;
}

//Updating date and time
date.innerText = getDateTime();
setInterval(() => {
  date.innerText = getDateTime();
}, 1000);

// function to get public ip address
function getPublicIp() {
  fetch("https://geolocation-db.com/json/", {
    method: "GET",
    headers: {},
  })
    .then((response) => response.json())
    .then((data) => {
      currentCity = data.city;
      getWeatherData(data.city, currentUnit, hourlyorWeek);
    })
    .catch((err) => {
      console.error(err);
    });
}

getPublicIp();

// function to get weather data
function getWeatherData(city, unit, hourlyorWeek) {
  fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=EJ6UBL2JEQGYB3AA4ENASN62J&contentType=json`,
    {
      method: "GET",
      headers: {},
    }
  )
    .then((response) => response.json())
    .then((data) => {
      let today = data.currentConditions;
      if (unit === "c") {
        temp.innerText = today.temp;
      } else {
        temp.innerText = celciusToFahrenheit(today.temp);
      }
      currentLocation.innerText = data.resolvedAddress;
      condition.innerText = today.conditions;
      rain.innerText = "Perc - " + today.precip + "%";
      uvIndex.innerText = today.uvindex;
      windSpeed.innerText = today.windspeed;
      measureUvIndex(today.uvindex);
      mainIcon.src = getIcon(today.icon);
      changeBackground(today.icon);
      humidity.innerText = today.humidity + "%";
      updateHumidityStatus(today.humidity);
      visibilty.innerText = today.visibility;
      updateVisibiltyStatus(today.visibility);
      airQuality.innerText = today.winddir;
      updateAirQualityStatus(today.winddir);
      if (hourlyorWeek === "hourly") {
        updateForecast(data.days[0].hours, unit, "day");
      } else {
        updateForecast(data.days, unit, "week");
      }
      sunRise.innerText = covertTimeTo12HourFormat(today.sunrise);
      sunSet.innerText = covertTimeTo12HourFormat(today.sunset);
    })
    .catch((err) => {
      alert("City not found in our database");
    });
}

//function to update Forecast

function updateForecast(data, unit, type) {
  weatherCards.innerHTML = "";
  let day = 0;
  let numCards = 0;
  if (type === "day") {
    numCards = 24;
  } else {
    numCards = 7;
  }
  for (let i = 0; i < numCards; i++) {
    let card = document.createElement("div");
    card.classList.add("card");
    let dayName = getHour(data[day].datetime);
    if (type === "week") {
      dayName = getDayName(data[day].datetime);
    }
    let dayTemp = data[day].temp;
    if (unit === "f") {
      dayTemp = celciusToFahrenheit(data[day].temp);
    }
    let iconCondition = data[day].icon;
    let iconSrc = getIcon(iconCondition);
    let tempUnit = "°C";
    if (unit === "f") {
      tempUnit = "°F";
    }
    card.innerHTML = `
                <h2 class="day-name">${dayName}</h2>
            <div class="card-icon">
              <img src="${iconSrc}" class="day-icon" alt="" />
            </div>
            <div class="day-temp">
              <h2 class="temp">${dayTemp}</h2>
              <span class="temp-unit">${tempUnit}</span>
            </div>
  `;
    weatherCards.appendChild(card);
    day++;
  }
}

// function to change weather icons
function getIcon(condition) {
  if (condition === "partly-cloudy-day") {
    return "https://i.ibb.co/PZQXH8V/27.png";
  } else if (condition === "partly-cloudy-night") {
    return "https://i.ibb.co/Kzkk59k/15.png";
  } else if (condition === "rain") {
    return "https://i.ibb.co/kBd2NTS/39.png";
  } else if (condition === "clear-day") {
    return "https://i.ibb.co/rb4rrJL/26.png";
  } else if (condition === "clear-night") {
    return "https://i.ibb.co/1nxNGHL/10.png";
  } else {
    return "https://i.ibb.co/rb4rrJL/26.png";
  }
}

// function to change background depending on weather conditions
function changeBackground(condition) {
  const body = document.querySelector("body");
  let bg = "";
  if (condition === "partly-cloudy-day") {
    bg = "https://i.ibb.co/qNv7NxZ/pc.webp";
  } else if (condition === "partly-cloudy-night") {
    bg = "https://i.ibb.co/RDfPqXz/pcn.jpg";
  } else if (condition === "rain") {
    bg = "https://i.ibb.co/h2p6Yhd/rain.webp";
  } else if (condition === "clear-day") {
    bg = "https://i.ibb.co/WGry01m/cd.jpg";
  } else if (condition === "clear-night") {
    bg = "https://i.ibb.co/kqtZ1Gx/cn.jpg";
  } else {
    bg = "https://i.ibb.co/qNv7NxZ/pc.webp";
  }
  body.style.backgroundImage = `linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ),url(${bg})`;
}

//get hours from hh:mm:ss
function getHour(time) {
  let hour = time.split(":")[0];
  let min = time.split(":")[1];
  if (hour > 12) {
    hour = hour - 12;
    return `${hour}:${min} PM`;
  } else {
    return `${hour}:${min} AM`;
  }
}

// convert time to 12 hour format
function covertTimeTo12HourFormat(time) {
  let hour = time.split(":")[0];
  let minute = time.split(":")[1];
  let ampm = hour >= 12 ? "pm" : "am";
  hour = hour % 12;
  hour = hour ? hour : 12; // the hour '0' should be '12'
  hour = hour < 10 ? "0" + hour : hour;
  minute = minute < 10 ? "0" + minute : minute;
  let strTime = hour + ":" + minute + " " + ampm;
  return strTime;
}

// function to get day name from date
function getDayName(date) {
  let day = new Date(date);
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[day.getDay()];
}

// function to get uv index status
function measureUvIndex(uvIndex) {
  if (uvIndex <= 2) {
    uvText.innerText = "Low";
  } else if (uvIndex <= 5) {
    uvText.innerText = "Moderate";
  } else if (uvIndex <= 7) {
    uvText.innerText = "High";
  } else if (uvIndex <= 10) {
    uvText.innerText = "Very High";
  } else {
    uvText.innerText = "Extreme";
  }
}

// function to get humidity status
function updateHumidityStatus(humidity) {
  if (humidity <= 30) {
    humidityStatus.innerText = "Low";
  } else if (humidity <= 60) {
    humidityStatus.innerText = "Moderate";
  } else {
    humidityStatus.innerText = "High";
  }
}

// function to get visibility status
function updateVisibiltyStatus(visibility) {
  if (visibility <= 0.03) {
    visibilityStatus.innerText = "Dense Fog";
  } else if (visibility <= 0.16) {
    visibilityStatus.innerText = "Moderate Fog";
  } else if (visibility <= 0.35) {
    visibilityStatus.innerText = "Light Fog";
  } else if (visibility <= 1.13) {
    visibilityStatus.innerText = "Very Light Fog";
  } else if (visibility <= 2.16) {
    visibilityStatus.innerText = "Light Mist";
  } else if (visibility <= 5.4) {
    visibilityStatus.innerText = "Very Light Mist";
  } else if (visibility <= 10.8) {
    visibilityStatus.innerText = "Clear Air";
  } else {
    visibilityStatus.innerText = "Very Clear Air";
  }
}

// function to get air quality status
function updateAirQualityStatus(airquality) {
  if (airquality <= 50) {
    airQualityStatus.innerText = "Good👌";
  } else if (airquality <= 100) {
    airQualityStatus.innerText = "Moderate😐";
  } else if (airquality <= 150) {
    airQualityStatus.innerText = "Unhealthy for Sensitive Groups😷";
  } else if (airquality <= 200) {
    airQualityStatus.innerText = "Unhealthy😷";
  } else if (airquality <= 250) {
    airQualityStatus.innerText = "Very Unhealthy😨";
  } else {
    airQualityStatus.innerText = "Hazardous😱";
  }
}

// function to handle search form
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let location = search.value;
  if (location) {
    currentCity = location;
    getWeatherData(location, currentUnit, hourlyorWeek);
  }
});

// function to conver celcius to fahrenheit
function celciusToFahrenheit(temp) {
  return ((temp * 9) / 5 + 32).toFixed(1);
}


var currentFocus;
search.addEventListener("input", function (e) {
  removeSuggestions();
  var a,
    b,
    i,
    val = this.value;
  if (!val) {
    return false;
  }
  currentFocus = -1;

  a = document.createElement("ul");
  a.setAttribute("id", "suggestions");

  this.parentNode.appendChild(a);

  for (i = 0; i < cities.length; i++) {
    /*check if the item starts with the same letters as the text field value:*/
    if (
      cities[i].name.substr(0, val.length).toUpperCase() == val.toUpperCase()
    ) {
      /*create a li element for each matching element:*/
      b = document.createElement("li");
      /*make the matching letters bold:*/
      b.innerHTML =
        "<strong>" + cities[i].name.substr(0, val.length) + "</strong>";
      b.innerHTML += cities[i].name.substr(val.length);
      /*insert a input field that will hold the current array item's value:*/
      b.innerHTML += "<input type='hidden' value='" + cities[i].name + "'>";
      /*execute a function when someone clicks on the item value (DIV element):*/
      b.addEventListener("click", function (e) {
        /*insert the value for the autocomplete text field:*/
        search.value = this.getElementsByTagName("input")[0].value;
        removeSuggestions();
      });

      a.appendChild(b);
    }
  }
});
/*execute a function presses a key on the keyboard:*/
search.addEventListener("keydown", function (e) {
  var x = document.getElementById("suggestions");
  if (x) x = x.getElementsByTagName("li");
  if (e.keyCode == 40) {
    /*If the arrow DOWN key
      is pressed,
      increase the currentFocus variable:*/
    currentFocus++;
    /*and and make the current item more visible:*/
    addActive(x);
  } else if (e.keyCode == 38) {
    /*If the arrow UP key
      is pressed,
      decrease the currentFocus variable:*/
    currentFocus--;
    /*and and make the current item more visible:*/
    addActive(x);
  }
  if (e.keyCode == 13) {
    /*If the ENTER key is pressed, prevent the form from being submitted,*/
    e.preventDefault();
    if (currentFocus > -1) {
      /*and simulate a click on the "active" item:*/
      if (x) x[currentFocus].click();
    }
  }
});
function addActive(x) {
  /*a function to classify an item as "active":*/
  if (!x) return false;
  /*start by removing the "active" class on all items:*/
  removeActive(x);
  if (currentFocus >= x.length) currentFocus = 0;
  if (currentFocus < 0) currentFocus = x.length - 1;
  /*add class "autocomplete-active":*/
  x[currentFocus].classList.add("active");
}
function removeActive(x) {
  /*a function to remove the "active" class from all autocomplete items:*/
  for (var i = 0; i < x.length; i++) {
    x[i].classList.remove("active");
  }
}

function removeSuggestions() {
  var x = document.getElementById("suggestions");
  if (x) x.parentNode.removeChild(x);
}

fahrenheitBtn.addEventListener("click", () => {
  changeUnit("f");
});
celciusBtn.addEventListener("click", () => {
  changeUnit("c");
});

// function to change unit


function changeUnit(unit) {
  if (currentUnit !== unit) {
    currentUnit = unit;
    tempUnit.forEach((elem) => {
      elem.innerText = `°${unit.toUpperCase()}`;
    });
    if (unit === "c") {
      celciusBtn.classList.add("active");
      fahrenheitBtn.classList.remove("active");
    } else {
      celciusBtn.classList.remove("active");
      fahrenheitBtn.classList.add("active");
    }
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
}

hourlyBtn.addEventListener("click", () => {
  changeTimeSpan("hourly");
});
weekBtn.addEventListener("click", () => {
  changeTimeSpan("week");
});

// function to change hourly to weekly or vice versa


function changeTimeSpan(unit) {
  if (hourlyorWeek !== unit) {
    hourlyorWeek = unit;
    if (unit === "hourly") {
      hourlyBtn.classList.add("active");
      weekBtn.classList.remove("active");
    } else {
      hourlyBtn.classList.remove("active");
      weekBtn.classList.add("active");
    }
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
}



// Cities add your own to get in search

cities = [
  {
    country: "IND",
    name: "Jablapur",
    lat: "23.185884",
    lng: "79.974380",
  },
  {
    country: "IND",
    name: "Rewa",
    lat: "24.530727",
    lng: "81.299110",
  },
  {
    country: "IND",
    name: "Mumbai",
    lat: "18.987807",
    lng: "72.836447",
  },
  {
      country: "IND",
      name: "Delhi",
      lat: "28.651952",
      lng: "77.231495",
    },

    {
      country: "IND",
      name: " Kolkata",
      lat: "22.562627",
      lng: "88.363044",
    },

    {
      country: "IND",
      name: "Chennai",
      lat: "13.084622",
      lng: "80.248357",
    },

    {
      country: "IND",
      name: "Bengalūru",
      lat: "12.977063",
      lng: "77.587106",
    },
    {
      country: "IND",
      name: "Hyderabad",
      lat: "17.384052",
      lng: "78.456355",
    },

    {
      country: "IND",
      name: "Ahmadābād",
      lat: "23.025793",
      lng: "72.587265",
    },

    {
      country: "IND",
      name: "Hāora",
      lat: "22.576882",
      lng: "88.318566",
    },
    {
      country: "IND",
      name: "Pune",
      lat: "18.513271",
      lng: "73.849852",
    },
    {
      country: "IND",
      name: "Sūrat",
      lat: "21.195944",
      lng: "72.830232",
    },
    {
      country: "IND",
      name: "Mardānpur",
      lat: "26.430066",
      lng: "80.267176",
    },
    {
      country: "IND",
      name: "Rāmpura",
      lat: "26.884682",
      lng: "75.789336",
    },
     {
      country: "IND",
      name: "Lucknow",
      lat: "26.839281",
      lng: "80.923133",
    },
    {
      country: "IND",
      name: "Nāra",
      lat: "21.203096",
      lng: "79.089284",
    },

     {
      country: "IND",
      name: "Patna",
      lat: "25.615379",
      lng: "85.101027",
    },

    {
      country: "IND",
      name: "Indore",
      lat: "22.717736",
      lng: "75.85859",
    },
    {
      country: "IND",
      name: "Vadodara",
      lat: "22.299405",
      lng: "73.208119",
    },
    {
      country: "IND",
      name: "Bhopal",
      lat: "23.254688",
      lng: "77.402892",
    },
    {
      country: "IND",
      name: "Coimbatore",
      lat: "11.005547",
      lng: "76.966122",
    },
    {
      country: "IND",
      name: "Ludhiāna",
      lat: "30.912042",
      lng: "75.853789",
    },
    {
      country: "IND",
      name: "Āgra",
      lat: "27.187935",
      lng: "78.003944",
    },

 {
      country: "IND",
      name: "Kalyān",
      lat: "19.243703",
      lng: "73.135537",
    },

    {
      country: "IND",
      name: "Vishākhapatnam",
      lat: "17.704052",
      lng: "83.297663",
    },  
    {
      country: "IND",
      name: "Kochi",
      lat: "9.947743",
      lng: "76.253802",
    },

    {
      country: "IND",
      name: "Nāsik",
      lat: "19.999963",
      lng: "73.776887",
    },

    {
      country: "IND",
      name: "Meerut",
      lat: "28.980018",
      lng: "77.706356",
    },
    {
      country: "IND",
      name: "Farīdābād",
      lat: "28.411236",
      lng: "77.313162",
    },

    {
      country: "IND",
      name: "Vārānasi",
      lat: "25.31774",
      lng: "83.005811",
    },

    {
      country: "IND",
      name: "Ghāziābād",
      lat: "28.665353",
      lng: "77.439148",
    },

    {
      country: "IND",
      name: "Āsansol",
      lat: "23.683333",
      lng: "86.983333",
    },
    {
      country: "IND",
      name: "Jamshedpur",
      lat: "22.802776",
      lng: "86.185448",
    },

    {
      country: "IND",
      name: "Madurai",
      lat: "9.917347",
      lng: "78.119622",
    },
    {
      country: "IND",
      name: "Jabalpur",
      lat: "23.174495",
      lng: "79.935903",
    },
    {
      country: "IND",
      name: "Rājkot",
      lat: "22.291606",
      lng: "70.793217",
    },
    {
      country: "IND",
      name: "Dhanbād",
      lat: "23.801988",
      lng: "86.443244",
    },

    {
      country: "IND",
      name: "Amritsar",
      lat: "31.622337",
      lng: "74.875335",
    },
    {
      country: "IND",
      name: "Warangal",
      lat: "17.978423",
      lng: "79.600209",
    },
    {
      country: "IND",
      name: "Allahābād",
      lat: "25.44478",
      lng: "81.843217",
    },

    {
      country: "IND",
      name: "Srīnagar",
      lat: "34.085652",
      lng: "74.805553",
    },
    {
      country: "IND",
      name: "Aurangābād",
      lat: "19.880943",
      lng: "75.346739",
    },
    {
      country: "IND",
      name: "Bhilai",
      lat: "21.209188",
      lng: "81.428497",
    },
    {
      country: "IND",
      name: "Solāpur",
      lat: "17.671523",
      lng: "75.910437",
    },
    {
      country: "IND",
      name: "Ranchi",
      lat: "23.347768",
      lng: "85.338564",
    },
    {
      country: "IND",
      name: "Jodhpur",
      lat: "26.26841",
      lng: "73.005943",
    },
    {
      country: "IND",
      name: "Guwāhāti",
      lat: "26.176076",
      lng: "91.762932",
    },

     {
      country: "IND",
      name: "Chandigarh",
      lat: "30.736292",
      lng: "76.788398",
    },
    {
      country: "IND",
      name: "Gwalior",
      lat: "26.229825",
      lng: "78.173369",
    },
    {
      country: "IND",
      name: "Thiruvananthapuram",
      lat: "8.485498",
      lng: "76.949238",
    },
    {
      country: "IND",
      name: "Tiruchchirāppalli",
      lat: "10.815499",
      lng: "78.696513",
    },

 {
      country: "IND",
      name: "Hubli",
      lat: "15.349955",
      lng: "75.138619",
    },
    {
      country: "IND",
      name: "Mysore",
      lat: "12.292664",
      lng: "76.638543",
    },

    {
      country: "IND",
      name: "Raipur",
      lat: "21.233333",
      lng: "81.633333",
    },
    {
      country: "IND",
      name: "Salem",
      lat: "11.651165",
      lng: "78.158672",
    },
    {
      country: "IND",
      name: "Bhubaneshwar",
      lat: "20.272411",
      lng: "85.833853",
    },
    {
      country: "IND",
      name: "Kota",
      lat: "25.182544",
      lng: "75.839065",
    },
    {
      country: "IND",
      name: "Jhānsi",
      lat: "25.458872",
      lng: "78.579943",
    },
    {
      country: "IND",
      name: "Bareilly",
      lat: "28.347023",
      lng: "79.421934",
    },
    {
      country: "IND",
      name: "Alīgarh",
      lat: "27.881453",
      lng: "78.07464",
    },
    {
      country: "IND",
      name: "Bhiwandi",
      lat: "19.300229",
      lng: "73.058813",
    },
    {
      country: "IND",
      name: "Jammu",
      lat: "32.735686",
      lng: "74.869112",
    },
    {
      country: "IND",
      name: "Morādābād",
      lat: "28.838931",
      lng: "78.776838",
    },
    {
      country: "IND",
      name: "Mangalore",
      lat: "12.865371",
      lng: "74.842432",
    },
    {
      country: "IND",
      name: "Kolhāpur",
      lat: "16.695633",
      lng: "74.231669",
    },
    {
      country: "IND",
      name: "Amrāvati",
      lat: "20.933272",
      lng: "77.75152",
    },
    {
      country: "IND",
      name: "Dehra Dūn",
      lat: "30.324427",
      lng: "78.033922",
    },
    {
      country: "IND",
      name: "Mālegaon Camp",
      lat: "20.569974",
      lng: "74.515415",
    },
    {
      country: "IND",
      name: "Nellore",
      lat: "14.449918",
      lng: "79.986967",
    },
    {
      country: "IND",
      name: "Gopālpur",
      lat: "26.735389",
      lng: "83.38064",
    },
    {
      country: "IND",
      name: "Shimoga",
      lat: "13.932424",
      lng: "75.572555",
    },
    {
      country: "IND",
      name: "Tiruppūr",
      lat: "11.104096",
      lng: "77.346402",
    },
    {
      country: "IND",
      name: "Raurkela",
      lat: "22.224964",
      lng: "84.864143",
    },
 {
      country: "IND",
      name: "Nānded",
      lat: "19.160227",
      lng: "77.314971",
    },
    {
      country: "IND",
      name: "Belgaum",
      lat: "15.862643",
      lng: "74.508534",
    },
    {
      country: "IND",
      name: "Sāngli",
      lat: "16.856777",
      lng: "74.569196",
    },
    {
      country: "IND",
      name: "Chānda",
      lat: "19.950758",
      lng: "79.295229",
    },
    {
      country: "IND",
      name: "Ajmer",
      lat: "26.452103",
      lng: "74.638667",
    },
    {
      country: "IND",
      name: "Cuttack",
      lat: "20.522922",
      lng: "85.78813",
    },
    {
      country: "IND",
      name: "Bīkaner",
      lat: "28.017623",
      lng: "73.314955",
    },
    {
      country: "IND",
      name: "Bhāvnagar",
      lat: "21.774455",
      lng: "72.152496",
    },
    {
      country: "IND",
      name: "Hisar",
      lat: "29.153938",
      lng: "75.722944",
    },
    {
      country: "IND",
      name: "Bilāspur",
      lat: "22.080046",
      lng: "82.155431",
    },
    {
      country: "IND",
      name: "Tirunelveli",
      lat: "8.725181",
      lng: "77.684519",
    },
    {
      country: "IND",
      name: "Guntūr",
      lat: "16.299737",
      lng: "80.457293",
    },
    {
      country: "IND",
      name: "Shiliguri",
      lat: "26.710035",
      lng: "88.428512",
    },
    {
      country: "IND",
      name: "Ujjain",
      lat: "23.182387",
      lng: "75.776433",
    },
    {
      country: "IND",
      name: "Davangere",
      lat: "14.469237",
      lng: "75.92375",
    },
    {
      country: "IND",
      name: "Akola",
      lat: "20.709569",
      lng: "76.998103",
    },
    {
      country: "IND",
      name: "Sahāranpur",
      lat: "29.967896",
      lng: "77.545221",
    },
    {
      country: "IND",
      name: "Gulbarga",
      lat: "17.335827",
      lng: "76.83757",
    },
    {
      country: "IND",
      name: "Bhātpāra",
      lat: "22.866431",
      lng: "88.401129",
    },
    {
      country: "IND",
      name: "Dhūlia",
      lat: "20.901299",
      lng: "74.777373",
    },
    {
      country: "IND",
      name: "Udaipur",
      lat: "24.57951",
      lng: "73.690508",
    },
    {
      country: "IND",
      name: "Bellary",
      lat: "15.142049",
      lng: "76.92398",
    },
    {
      country: "IND",
      name: "Tuticorin",
      lat: "8.805038",
      lng: "78.151884",
    },
    {
      country: "IND",
      name: "Kurnool",
      lat: "15.828865",
      lng: "78.036021",
    },
    {
      country: "IND",
      name: "Gaya",
      lat: "24.796858",
      lng: "85.003852",
    },
    {
      country: "IND",
      name: "Sīkar",
      lat: "27.614778",
      lng: "75.138671",
    },
    {
      country: "IND",
      name: "Tumkūr",
      lat: "13.341358",
      lng: "77.102203",
    },
    {
      country: "IND",
      name: "Kollam",
      lat: "8.881131",
      lng: "76.584694",
    },
    {
      country: "IND",
      name: "Ahmadnagar",
      lat: "19.094571",
      lng: "74.738432",
    },
    {
      country: "IND",
      name: "Bhīlwāra",
      lat: "25.347071",
      lng: "74.640812",
    },

 {
      country: "IND",
      name: "Nizāmābād",
      lat: "18.673151",
      lng: "78.10008",
    },
    {
      country: "IND",
      name: "Parbhani",
      lat: "19.268553",
      lng: "76.770807",
    },
    {
      country: "IND",
      name: "Shillong",
      lat: "25.573987",
      lng: "91.896807",
    },
    {
      country: "IND",
      name: "Lātūr",
      lat: "18.399487",
      lng: "76.584252",
    },
    {
      country: "IND",
      name: "Rājapālaiyam",
      lat: "9.451111",
      lng: "77.556121",
    },
    {
      country: "IND",
      name: "Bhāgalpur",
      lat: "25.244462",
      lng: "86.971832",
    },
    {
      country: "IND",
      name: "Muzaffarnagar",
      lat: "29.470914",
      lng: "77.703324",
    },
    {
      country: "IND",
      name: "Muzaffarpur",
      lat: "26.122593",
      lng: "85.390553",
    },
    {
      country: "IND",
      name: "Mathura",
      lat: "27.503501",
      lng: "77.672145",
    },
    {
      country: "IND",
      name: "Patiāla",
      lat: "30.336245",
      lng: "76.392199",
    },
    {
      country: "IND",
      name: "Saugor",
      lat: "23.838766",
      lng: "78.738738",
    },
    {
      country: "IND",
      name: "Brahmapur",
      lat: "19.311514",
      lng: "84.792903",
    },
    {
      country: "IND",
      name: "Shāhbāzpur",
      lat: "27.874116",
      lng: "79.879327",
    },
    {
      country: "IND",
      name: "New Delhi",
      lat: "28.6",
      lng: "77.2",
    },
    {
      country: "IND",
      name: "Rohtak",
      lat: "28.894473",
      lng: "76.589166",
    },
    {
      country: "IND",
      name: "Samlaipādar",
      lat: "21.478072",
      lng: "83.990505",
    },
    {
      country: "IND",
      name: "Ratlām",
      lat: "23.330331",
      lng: "75.040315",
    },
    {
      country: "IND",
      name: "Fīrozābād",
      lat: "27.150917",
      lng: "78.397808",
    }, 
    {
      country: "IND",
      name: "Rājahmundry",
      lat: "17.005171",
      lng: "81.777839",
    },

    {
      country: "IND",
      name: "Barddhamān",
      lat: "23.255716",
      lng: "87.856906",
    },
    {
      country: "IND",
      name: "Bīdar",
      lat: "17.913309",
      lng: "77.530105",
    },
    {
      country: "IND",
      name: "Bamanpurī",
      lat: "28.804495",
      lng: "79.040305",
    },
    {
      country: "IND",
      name: "Kākināda",
      lat: "16.960361",
      lng: "82.238086",
    },
    {
      country: "IND",
      name: "Pānīpat",
      lat: "29.387471",
      lng: "76.968246",
    },
    {
      country: "IND",
      name: "Khammam",
      lat: "17.247672",
      lng: "80.143682",
    },
    {
      country: "IND",
      name: "Bhuj",
      lat: "23.253972",
      lng: "69.669281",
    },
    {
      country: "IND",
      name: "Karīmnagar",
      lat: "18.436738",
      lng: "79.13222",
    },
     {
      country: "IND",
      name: "Tirupati",
      lat: "13.635505",
      lng: "79.419888",
    },
     {
      country: "IND",
      name: "Hospet",
      lat: "15.269537",
      lng: "76.387103",
    },
    {
      country: "IND",
      name: "Chikka Mandya",
      lat: "12.545602",
      lng: "76.895078",
    },
    {
      country: "IND",
      name: "Alwar",
      lat: "27.566291",
      lng: "76.610202",
    },
    {
      country: "IND",
      name: "Aizawl",
      lat: "23.736701",
      lng: "92.714596",
    },
    {
      country: "IND",
      name: "Bijāpur",
      lat: "16.827715",
      lng: "75.718988",
    },
     {
      country: "IND",
      name: "Imphal",
      lat: "24.808053",
      lng: "93.944203",
    },
     {
      country: "IND",
      name: "Tharati Etawah",
      lat: "26.758236",
      lng: "79.014875",
    },
    {
      country: "IND",
      name: "Rāichūr",
      lat: "16.205459",
      lng: "77.35567",
    },
    {
      country: "IND",
      name: "Pathānkot",
      lat: "32.274842",
      lng: "75.652865",
    },
    {
      country: "IND",
      name: "Chīrāla",
      lat: "15.823849",
      lng: "80.352187",
    },
    {
      country: "IND",
      name: "Sonīpat",
      lat: "28.994778",
      lng: "77.019375",
    },
    {
      country: "IND",
      name: "Mirzāpur",
      lat: "25.144902",
      lng: "82.565335",
    },
     {
      country: "IND",
      name: "Hāpur",
      lat: "28.729845",
      lng: "77.780681",
    },
    {
      country: "IND",
      name: "Porbandar",
      lat: "21.641346",
      lng: "69.600868",
    },
    {
      country: "IND",
      name: "Bharatpur",
      lat: "27.215251",
      lng: "77.492786",
    },
     {
      country: "IND",
      name: "Puducherry",
      lat: "11.933812",
      lng: "79.829792",
    },
    {
      country: "IND",
      name: "Karnāl",
      lat: "29.691971",
      lng: "76.984483",
    },
    {
      country: "IND",
      name: "Nāgercoil",
      lat: "8.177313",
      lng: "77.43437",
    },
    {
      country: "IND",
      name: "Thanjāvūr",
      lat: "10.785233",
      lng: "79.139093",
    },
    {
      country: "IND",
      name: "Pāli",
      lat: "25.775125",
      lng: "73.320611",
    },
    {
      country: "IND",
      name: "Agartala",
      lat: "23.836049",
      lng: "91.279386",
    },
    {
      country: "IND",
      name: "Ongole",
      lat: "15.503565",
      lng: "80.044541",
    },
     {
      country: "IND",
      name: "Puri",
      lat: "19.798254",
      lng: "85.824938",
    },
     {
      country: "IND",
      name: "Dindigul",
      lat: "10.362853",
      lng: "77.975827",
    },
     {
      country: "IND",
      name: "Haldia",
      lat: "22.025278",
      lng: "88.058333",
    },
    {
      country: "IND",
      name: "Bulandshahr",
      lat: "28.403922",
      lng: "77.857731",
    },
     {
      country: "IND",
      name: "Purnea",
      lat: "25.776703",
      lng: "87.473655",
    },
     {
      country: "IND",
      name: "Proddatūr",
      lat: "14.7502	",
      lng: "78.548129",
    },
     {
      country: "IND",
      name: "Gurgaon",
      lat: "28.460105",
      lng: "77.026352",
    },
    {
      country: "IND",
      name: "Khānāpur",
      lat: "21.273716",
      lng: "76.117376",
    },
    {
      country: "IND",
      name: "Machilīpatnam",
      lat: "16.187466",
      lng: "81.13888",
    },
    {
      country: "IND",
      name: "Bhiwāni",
      lat: "28.793044",
      lng: "76.13968",
    },
    {
      country: "IND",
      name: "Nandyāl",
      lat: "15.477994",
      lng: "78.483605",
    },
    {
      country: "IND",
      name: "Bhusāval",
      lat: "21.043649",
      lng: "75.785058",
    },
    {
      country: "IND",
      name: "Bharauri",
      lat: "27.598203",
      lng: "81.694709",
    },
    {
      country: "IND",
      name: "Tonk",
      lat: "26.168672",
      lng: "75.786111",
    },

    {
      country: "IND",
      name: "",
      lat: "",
      lng: "",
    },
     {
      country: "IND",
      name: "Sirsa",
      lat: "29.534893",
      lng: "75.028981",
    }, 
    {
      country: "IND",
      name: "Vizianagaram",
      lat: "18.11329",
      lng: "83.397743",
    },
    {
      country: "IND",
      name: "Vellore",
      lat: "12.905769",
      lng: "79.137104",
    },
    {
      country: "IND",
      name: "Alappuzha",
      lat: "9.494647",
      lng: "76.331108",
    },
    {
      country: "IND",
      name: "Shimla",
      lat: "31.104423",
      lng: "77.166623",
    },
    {
      country: "IND",
      name: "Hindupur",
      lat: "13.828065",
      lng: "77.491425",
    },
    {
      country: "IND",
      name: "Bāramūla",
      lat: "34.209004",
      lng: "74.342853",
    },
    {
      country: "IND",
      name: "Bakshpur",
      lat: "25.894283",
      lng: "80.792104",
    },
    {
      country: "IND",
      name: "Dibrugarh",
      lat: "27.479888",
      lng: "94.90837",
    },
     {
      country: "IND",
      name: "Saidāpur",
      lat: "27.598784",
      lng: "80.75089",
    },
    {
      country: "IND",
      name: "Navsāri",
      lat: "20.85",
      lng: "72.916667",
    },
    {
      country: "IND",
      name: "Budaun",
      lat: "28.038114",
      lng: "79.126677",
    },
    {
      country: "IND",
      name: "Cuddalore",
      lat: "11.746289",
      lng: "79.764362",
    },
    {
      country: "IND",
      name: "Harīpur",
      lat: "31.463218",
      lng: "75.986418",
    },
    {
      country: "IND",
      name: "Krishnāpuram",
      lat: "12.869617",
      lng: "79.719469",
    },
    {
      country: "IND",
      name: "Fyzābād",
      lat: "26.775486",
      lng: "82.150182",
    },
    {
      country: "IND",
      name: "Silchar	",
      lat: "24.827327",
      lng: "92.797868",
    },
    {
      country: "IND",
      name: "Ambāla",
      lat: "30.360993",
      lng: "76.797819",
    },
     {
      country: "IND",
      name: "Krishnanagar",
      lat: "23.405761",
      lng: "88.490733",
    },
      {
      country: "IND",
      name: "Kolār",
      lat: "13.137679",
      lng: "78.129989",
    },  
    
    {
      country: "IND",
      name: "Kumbakonam",
      lat: "10.959789",
      lng: "79.377472",
    },
      
    {
      country: "IND",
      name: "Tiruvannāmalai",
      lat: "12.230204",
      lng: "79.072954",
    },
      
    {
      country: "IND",
      name: "Pīlibhīt",
      lat: "28.631245",
      lng: "79.804362",
    },

    {
      country: "IND",
      name: "Abohar",
      lat: "30.144533",
      lng: "	74.19552",
    },
    {
      country: "IND",
      name: "Port Blair",
      lat: "11.666667",
      lng: "92.75",
    },
    {
      country: "IND",
      name: "Alīpur Duār",
      lat: "26.4835",
      lng: "89.522855",
    },

    {
      country: "IND",
      name: "Hatīsa",
      lat: "	27.592698",
      lng: "78.013843",
    },
     {
      country: "IND",
      name: "",
      lat: "",
      lng: "",
    },
    {
      country: "IND",
      name: "Vālpārai",
      lat: "10.325163",
      lng: "	76.955299",
    },
    {
      country: "IND",
      name: "Aurangābād",
      lat: "24.752037",
      lng: "84.374202",
    },
    {
      country: "IND",
      name: "Kohima",
      lat: "25.674673",
      lng: "94.110988",
    },
    {
      country: "IND",
      name: "Gangtok",
      lat: "27.325739",
      lng: "	88.612155",
    },
       {
      country: "IND",
      name: "Karūr",
      lat: "10.960277",
      lng: "78.076753",
    },
    {
      country: "IND",
      name: "Jorhāt",
      lat: "26.757509",
      lng: "94.203055",
    },
    {
      country: "IND",
      name: "Panaji",
      lat: "15.498289	",
      lng: "73.824541",
    },
    {
      country: "IND",
      name: "Saidpur",
      lat: "34.318174",
      lng: "74.457093",
    },
    {
      country: "IND",
      name: "Tezpur",
      lat: "26.633333",
      lng: "92.8",
    },
    {
      country: "IND",
      name: "Itanagar",
      lat: "27.102349",
      lng: "93.692047",
    },
    {
      country: "IND",
      name: "Daman",
      lat: "20.414315",
      lng: "	72.83236",
    },
    {
      country: "IND",
      name: "Silvassa",
      lat: "20.273855",
      lng: "72.996728",
    },
    {
      country: "IND",
      name: "Diu",
      lat: "20.715115",
      lng: "70.987952",
    },
    {
      country: "IND",
      name: "Dispur",
      lat: "26.135638",
      lng: "91.800688",
    },
    {
      country: "IND",
      name: "Kavaratti",
      lat: "10.566667",
      lng: "72.616667",
    },
    {
      country: "IND",
      name: "Calicut",
      lat: "11.248016",
      lng: "75.780402",
    },
    {
      country: "IND",
      name: "Kagaznāgār",
      lat: "19.331589",
      lng: "79.466051",
    },
    {
      country: "IND",
      name: "Jaipur",
      lat: "26.913312",
      lng: "75.787872",
    },
    {
      country: "IND",
      name: "Ghandinagar",
      lat: "23.216667",
      lng: "72.683333",
    },
    {
      country: "IND",
      name: "Panchkula",
      lat: "30.691512",
      lng: "76.853736",
    },
  ];																						



