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
        city: document.getElementById('city'),
        icon: document.querySelector('.icon'),
        temp: document.getElementById('temp'),
        feelsLike: document.getElementById('feelsLike'),
        humid: document.getElementById('humid'),
        button: document.querySelector('#cityInput+button'),
    }
})();

const weatherInfo = (function() {
    const key = '582cb38941f672dc1d32e2d498c2f0e3';

    async function getWeath(defCity) {
        const cityVal = weathDOM.cityInput.value || defCity;
        try {
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
            weathDOM.icon.nextElementSibling.textContent = `${weather[0].description.charAt(0).toUpperCase()+weather[0].description.slice(1)}`;
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
})();