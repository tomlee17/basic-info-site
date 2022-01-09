'use strict';

const clockDisp = (function() {
    function showClock() {
        const clock = document.getElementById('clock');
        const currentDate = new Date().toLocaleDateString('en-GB');
        const currentTime = new Date().toLocaleTimeString('en-GB');
        clock.textContent = currentDate + '\n' + currentTime;
    }
    showClock();
    setInterval(showClock, 1000);
})();

const alarmDOM = (function() {
    return {
        alarmButton: document.getElementById('setAlarm'),
        alarmStatus: document.getElementById('alarmStatus'),
        alarmInput: document.querySelector('#alarm>input'),
        alarmAudio: document.querySelector('audio'),
        cancelButton: document.getElementById('cancelAlarm'),
        resumeButton: document.getElementById('resumeAlarm'),
    }
})();

const alarmFunc = (function() {
    let alarmFlag;
    let alarmTimer;

    alarmDOM.resumeButton.addEventListener('click', function resumeAlarm() {
        if (window.localStorage.getItem('alarm') && !alarmFlag) {
            alarmTimer = setTimeout(playAlarm, window.localStorage.getItem('alarm') - Date.now());
            alarmDOM.alarmStatus.textContent = window.localStorage.getItem('alarmText');
            alarmFlag = 1;
        }
    })

    alarmDOM.alarmButton.addEventListener('click', setAlarm);

    function setAlarm() {
        if (alarmTimer) clearTimeout(alarmTimer);
        const alarmTime = new Date(alarmDOM.alarmInput.value.replace('T', ' '));
        const timeDiff = alarmTime.getTime() - Date.now();
        if (!timeDiff) return alarmDOM.alarmStatus.textContent = 'Please select a time.'
        if (timeDiff < 0) return alarmDOM.alarmStatus.textContent = 'Please select a future time.'
        alarmTimer = setTimeout(playAlarm, timeDiff);
        alarmDOM.alarmStatus.textContent = `Alarm set at ${alarmDOM.alarmInput.value}`;
        window.localStorage.setItem('alarm', alarmTime.getTime());
        window.localStorage.setItem('alarmText', alarmDOM.alarmStatus.textContent);
        alarmFlag = 1;
    }

    let count;

    function playAlarm() {
        count = 1;
        alarmDOM.alarmAudio.play();
        alarmDOM.alarmStatus.textContent = '';
        alarmDOM.alarmAudio.muted = false;
        window.localStorage.clear();
    }

    alarmDOM.alarmAudio.addEventListener('ended', function loopAlarm() {
        count++;
        if (count <= 5) this.play();
    });

    alarmDOM.cancelButton.addEventListener('click', function cancelAlarm() {
        if (alarmTimer) clearTimeout(alarmTimer);
        alarmDOM.alarmAudio.pause();
        alarmDOM.alarmStatus.textContent = '';
        window.localStorage.clear();
    })
})();

const weathDOM = (function() {
    return {
        cityInput: document.getElementById('cityInput'),
        city: document.querySelector('.city'),
        icon: document.querySelector('.icon'),
        temp: document.querySelector('.temp'),
        feelsLike: document.querySelector('.feelsLike'),
        humid: document.querySelector('.humid'),
        button: document.querySelector('#cityInput+button'),
    }
})();

const currWeatherInfo = (function() {
    const key = '582cb38941f672dc1d32e2d498c2f0e3';

    let cityVal;
    async function getWeath(defCity) {
        try {
            cityVal = weathDOM.cityInput.value || defCity;
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityVal}&units=metric&appid=${key}`, { mode: 'cors' });
            if (!response.ok) throw Error;
            const weathData = await response.json();
            return weathData;
        } catch (err) {
            console.error(err);
            alert('404: City not found');
        }
    }

    async function displayWeath(defCity) {
        try {
            const weathData = await getWeath(defCity);
            //     console.log(weathData);
            const { main, name, weather } = weathData;
            weathDOM.city.textContent = `${name}`;
            weathDOM.icon.src = `http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
            weathDOM.icon.nextElementSibling.textContent = weather[0].description.charAt(0).toUpperCase() + weather[0].description.slice(1);
            weathDOM.temp.textContent = `Temperature: ${main.temp} \u00B0C`;
            weathDOM.feelsLike.textContent = `Feels like: ${main.feels_like} \u00B0C`;
            weathDOM.humid.textContent = `Humidity: ${main.humidity} %`;
        } catch (err) {
            console.error(err);
        }
    }

    displayWeath('Kuala Lumpur');
    weathDOM.button.addEventListener('click', displayWeath);
    weathDOM.cityInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') weathDOM.button.click();
    })

    return {
        getCityVal() {
            return cityVal;
        },
        key,
    }
})();

const forecastDOM = (() => {
    return {
        forecastCont: document.getElementById('forecastCont'),
    }
})();

const forecast = (() => {
    async function getForecast() {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${currWeatherInfo.getCityVal()}&units=metric&appid=${currWeatherInfo.key}`, { mode: 'cors' });
            const forecastData = await response.json();
            const { list } = forecastData;
            return list;
        } catch (err) {
            console.error(err);
        }
    }

    async function createCard(daysAfter) {
        const forecastCard = document.getElementById('weathCard').cloneNode(true);

        forecastCard.removeAttribute('id');
        forecastCard.classList.add('forecastCards');
        const forecastCardChild = [...forecastCard.children];
        //       console.log(forecastCardChild)

        const forecastData = await getForecast();
        const newDay = newDayData(daysAfter, forecastData);
        //     console.log(newDay)

        let i = 0;
        for (let x in newDay) {
            if (x !== 'weatherIcon') {
                //        console.log(x, i)
                while (true) {
                    if (forecastCardChild[i].tagName !== 'FIGURE') {
                        forecastCardChild[i].textContent = newDay[x];
                        //   console.log(i, forecastCardChild[i]);
                    }
                    if (x === 'weatherDesc') forecastCardChild[i].children[1].textContent = newDay[x];
                    i++;
                    break;
                }
            } else if (x === 'weatherIcon') {
                // console.log(newDay[x])
                forecastCardChild[i].children[0].src = newDay[x];
            }
        }
        forecastDOM.forecastCont.appendChild(forecastCard);
    }

    function genAllForecasts() {
        if (forecastDOM.forecastCont.children) forecastDOM.forecastCont.textContent = '';
        for (let card = 1; card <= 4; card++) {
            createCard(card);
        }
    };
    genAllForecasts();
    weathDOM.button.addEventListener('click', genAllForecasts);
})();

function newDayData(daysAfter, forecastData) {
    const _dateTime = `${new Date(Date.now() + 8.64e7*daysAfter).toLocaleDateString('sv-SE')} 12:00:00`;
    const _dayForecast = forecastData[forecastData.findIndex((timestamp) => timestamp.dt_txt === _dateTime)];
    const { dt_txt, main, weather } = _dayForecast;

    return {
        date: dt_txt.split(' ')[0],
        weatherIcon: `http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`,
        weatherDesc: weather[0].description.charAt(0).toUpperCase() + weather[0].description.slice(1),
        temp: 'Temp: ' + main.temp,
        feelsLike: 'Feels like: ' + main.feels_like,
        humid: 'Humidity: ' + main.humidity,
    }
}