function refresh(scheduleUpdate = true) {
    let data = null;
    try {
        data = JSON.parse(javaBridge.getData());
    } catch (err) {
        logln(err);
        return;
    }

    if (scheduleUpdate) {
        setTimeout(() => dispatchFetch(), getRefreshCooldown());
    }

    if (data == null) {
        logln('Could not fetch data from server.');
        return;
    }

    mount(data);
}

function getRefreshCooldown() {
    let cooldown = 6000;
    try {
        cooldown = javaBridge.getRefreshCooldown();
    } catch (ignored) {}

    if (!cooldown) cooldown = 6000;
    else if (cooldown < 1000) cooldown = 1000;

    return cooldown;
}

function dispatchFetch() {
    try {
        javaBridge.fetch();
    } catch (err) {
        logln(err);
    }
}

function mount({
    cellVoltage,
    totalVoltage,
    temperature,
    temperatureUnit,
    totalCharge,
    reserveVoltage,
    starterVoltage,
    buttons
}) {
    document.querySelector('#cell1 .voltage').innerHTML = unit(cellVoltage[1], 'V');
    document.querySelector('#cell2 .voltage').innerHTML = unit(cellVoltage[2], 'V');
    document.querySelector('#cell3 .voltage').innerHTML = unit(cellVoltage[3], 'V');
    document.querySelector('#cell4 .voltage').innerHTML = unit(cellVoltage[4], 'V');

    document.querySelector('#totalVoltage .voltage').innerHTML = unit(totalVoltage, 'V');
    document.querySelector('#temperature .temperature').innerHTML = unit(temperature, temperatureUnit || '');
    document.querySelector('#totalCharge .charge').innerHTML = unit(totalCharge, 'A');

    document.querySelector('#reserve .voltage').innerHTML = unit(reserveVoltage, 'V');
    document.querySelector('#starter .voltage').innerHTML = unit(starterVoltage, 'V');

    document.getElementById('btnLiFeYPo4').setAttribute('value', buttons['Relais0'] || 'AN');
    document.getElementById('btnAutomatik').setAttribute('value', buttons['Automatik'] || 'AN');
    document.getElementById('btnDisplayLight').setAttribute('value', buttons['Relais2'] || 'AN');
    document.getElementById('btnExternCharger').setAttribute('value', buttons['Relais1'] || 'AN');
}

function unit(value, unit) {
    if (!value) return 'n/a';

    return `${value} ${unit}`;
}

// initiate data fetch
dispatchFetch();