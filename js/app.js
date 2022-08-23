function refresh() {
    let data = null;
    try {
        data = javaBridge.getData();
    } catch (err) {
        logln(err);
    }

    if (data == null) {
        logln('Could not fetch data from server.');
        return;
    }

    mount(data);
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
    document.querySelector('#cell1 .voltage').innerHTML = cellVoltage[1] || '?';
    document.querySelector('#cell2 .voltage').innerHTML = cellVoltage[2] || '?';
    document.querySelector('#cell3 .voltage').innerHTML = cellVoltage[3] || '?';
    document.querySelector('#cell4 .voltage').innerHTML = cellVoltage[4] || '?';

    document.querySelector('#totalVoltage .voltage').innerHTML = totalVoltage || '?';
    document.querySelector('#temperature .temperature').innerHTML = `${temperature || '?'} ${temperatureUnit || '?'}`;
    document.querySelector('#totalCharge .charge').innerHTML = totalCharge || '?';

    document.querySelector('#reserve .voltage').innerHTML = reserveVoltage || '?';
    document.querySelector('#starter .voltage').innerHTML = starterVoltage || '?';

    document.getElementById('btnLiFeYPo4').setAttribute('value', buttons['Relais0']);
    document.getElementById('btnAutomatik').setAttribute('value', buttons['Automatik']);
    document.getElementById('btnDisplayLight').setAttribute('value', buttons['Relais2']);
    document.getElementById('btnExternCharger').setAttribute('value', buttons['Relais1']);
}

// initiate data fetch
try {
    javaBridge.fetch();
} catch(err) {
    logln(err);
}