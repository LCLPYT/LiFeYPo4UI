let currentTimeout = -1;

function refresh(scheduleUpdate = true) {
    let data = null;
    try {
        data = JSON.parse(javaBridge.getData());
    } catch (err) {
        logln(err);
        return;
    }

    if (scheduleUpdate) {
        if (currentTimeout !== -1) {
            clearTimeout(currentTimeout);
        }
        
        currentTimeout = setTimeout(() => {
            currentTimeout = -1;
            dispatchFetch();
        }, getRefreshCooldown());
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
    if (cellVoltage) {
        document.querySelector('#cell1 .voltage').innerHTML = unit(cellVoltage[1], 'V');
        document.querySelector('#cell2 .voltage').innerHTML = unit(cellVoltage[2], 'V');
        document.querySelector('#cell3 .voltage').innerHTML = unit(cellVoltage[3], 'V');
        document.querySelector('#cell4 .voltage').innerHTML = unit(cellVoltage[4], 'V');
    } else {
        document.querySelector('#cell1 .voltage').innerHTML = 'n/a';
        document.querySelector('#cell2 .voltage').innerHTML = 'n/a';
        document.querySelector('#cell3 .voltage').innerHTML = 'n/a';
        document.querySelector('#cell4 .voltage').innerHTML = 'n/a';
    }

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

    function setupButton(btn, name, consumer = null) {
        if (buttons && buttons[name]) {
            btn.setAttribute('value', buttons[name]);
            btn.removeAttribute('disabled');

            const state = btn.getAttribute('value') === 'AN';
            btn.innerHTML = btn.getAttribute(state ? 'data-text-on' : 'data-text-off');

            if (consumer) consumer(btn, buttons[name] === 'AN');
        } else {
            btn.setAttribute('disabled', '');
        }
    }

    setupButton(document.getElementById('btnLiFeYPo4'), 'Relais0');

    setupButton(document.getElementById('btnAutomatik'), 'Automatik');

    setupButton(document.getElementById('btnDisplayLight'), 'Relais2', (btn, enabled) => {
        btn.classList.add(enabled ? 'btn-success' : 'btn-danger');
        btn.classList.remove(enabled ? 'btn-danger' : 'btn-success');
    });

    setupButton(document.getElementById('btnExternCharger'), 'Relais1', (btn, enabled) => {
        btn.classList.add(enabled ? 'btn-success' : 'btn-danger');
        btn.classList.remove(enabled ? 'btn-danger' : 'btn-success');
    });
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

/**
 * 
 * @param {MouseEvent} event 
 */
function onClick(event) {
    event.preventDefault();

    const elem = event.target;
    if (elem.hasAttribute('disabled')) return;

    elem.setAttribute('disabled', '');

    try {
        javaBridge.buttonClicked(elem.name, elem.value);
    } catch(err) {
        logln(err);
        elem.removeAttribute('disabled');
    }
}

document.getElementById('btnLiFeYPo4').addEventListener('click', onClick);
document.getElementById('btnAutomatik').addEventListener('click', onClick);
document.getElementById('btnDisplayLight').addEventListener('click', onClick);
document.getElementById('btnExternCharger').addEventListener('click', onClick);

function postCallback(name, success) {
    const btn = document.querySelector(`button[name="${name}"]`);
    btn.removeAttribute('disabled');

    if (!success) return;

    const state = btn.getAttribute('value') === 'AN';
    btn.setAttribute('value', state ? 'AUS' : 'AN');

    // TODO maybe use same render code for buttons
    btn.innerHTML = btn.getAttribute(state ? 'data-text-off' : 'data-text-on');

    if (btn.classList.contains('btn-success')) {
        btn.classList.remove('btn-success');
        btn.classList.add('btn-danger');
    } else if (btn.classList.contains('btn-danger')) {
        btn.classList.remove('btn-danger');
        btn.classList.add('btn-success');
    }
}