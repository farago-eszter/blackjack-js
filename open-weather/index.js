searchButtonElement = document.getElementById("searchButton");
cityInputElement = document.getElementById("cityInput");
cityElement = document.getElementById("city");
iconElement = document.getElementById("icon");
mainElement = document.getElementById("main");
descriptionElement = document.getElementById("description");
const key = "4077d67278fe00503be7e616bd1884ed";
const unit = "metric";

searchButtonElement.onclick = () => {
  $.get(
    `https://api.openweathermap.org/data/2.5/weather?q=${cityInputElement.value}&units=${unit}&appid=${key}`,
    function (data) {
      cityInputElement.value = "";
      cityElement.textContent = `${data.name}: ${data.main.temp}°C`;
      iconElement.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
      mainElement.textContent = data.weather[0].main;
      descriptionElement.textContent = data.weather[0].description;
    },
  );
};
