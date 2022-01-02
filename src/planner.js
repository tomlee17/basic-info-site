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

const alarmFunc = (function() {
    (function alarmTrigger() {
        const alarmButton = document.getElementById('setAlarm');
        alarmButton.addEventListener('click', setAlarm);
    })();

    let alarmTimer;
    const alarmStatus = document.getElementById('alarmStatus');

    function setAlarm() {
        const alarmInput = document.querySelector('#alarm>input');
        const alarmTime = new Date(alarmInput.value.replace('T', ' '));
        const timeDiff = alarmTime.getTime() - Date.now();
        if (!timeDiff) return alarmStatus.textContent = 'Please select a time.'
        if (timeDiff < 0) return alarmStatus.textContent = 'Please select a future time.'
        alarmTimer = setTimeout(playAlarm, timeDiff);
        alarmStatus.textContent = `Alarm set at ${alarmInput.value}`;
    }

    const alarmAudio = document.querySelector('audio');
    console.log(alarmAudio)

    function playAlarm() {
        let i = 1;
        alarmAudio.play();
        alarmAudio.addEventListener('ended', function() {
            i++;
            if (i <= 5) this.play();
        })
    }

    (function cancelAlarm() {
        const cancelButton = document.getElementById('cancelAlarm');
        cancelButton.addEventListener('click', function() {
            if (alarmTimer) clearTimeout(alarmTimer);
            alarmAudio.pause();
            alarmStatus.textContent = '';
        })
    })();
})();