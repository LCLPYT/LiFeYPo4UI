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

    try {
        mount(data);
    } catch(err) {
        logln(err);
    }
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

    /** @type HTMLElement|undefined */
    const chargeDisplay = document.querySelector('#totalCharge .charge');
    if (totalCharge) {
        let prefix = '';
        if (totalCharge >= 0) {
            prefix = totalCharge <= 10E-9 ? '\u00B1' : '+';
            chargeDisplay?.classList.remove('text-danger');
            chargeDisplay?.classList.add('text-success');
        } else {
            chargeDisplay?.classList.add('text-danger');
            chargeDisplay?.classList.remove('text-success');
        }
        chargeDisplay.innerHTML = `${prefix}${totalCharge} A`;
    } else {
        chargeDisplay?.classList.remove('text-danger');
        chargeDisplay.innerHTML = 'n/a';
    }

    document.querySelector('#reserve .voltage').innerHTML = unit(reserveVoltage, 'V');
    document.querySelector('#starter .voltage').innerHTML = unit(starterVoltage, 'V');

    document.getElementById('btnLiFeYPo4').setAttribute('value', buttons['Relais0'] || 'AN');
    document.getElementById('btnAutomatik').setAttribute('value', buttons['Automatik'] || 'AN');
    document.getElementById('btnDisplayLight').setAttribute('value', buttons['Relais2'] || 'AN');
    document.getElementById('btnExternCharger').setAttribute('value', buttons['Relais1'] || 'AN');
}

/**
 * @param {number} value 
 * @param {string} unit 
 * @returns {string}
 */
function unit(value, unit, decimals = 2) {
    if (value === undefined || value === null) return 'n/a';

    return `${value.toFixed(decimals)} ${unit}`;
}

// initiate data fetch
dispatchFetch();