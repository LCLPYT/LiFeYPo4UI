const output = document.getElementById('log');

function logln(...str) {
    const d = new Date();
    const time = `[${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}] `;
    output.innerHTML += time + str.map(x => toLogString(x)).join(' ') + '\n';
}

function toLogString(x) {
    if (x === undefined) return 'undefined';
    else if (x === null) return 'null';
    else if (Array.isArray(x)) {
        return '[' + x.map(y => toLogString(y)).join(', ') + ']';
    } else if (typeof x === 'object') {
        const prefix = x.constructor?.name ? x.constructor.name + ' ' : '';

        if (x instanceof Error) return prefix + `"${x.message}"`;

        return prefix + JSON.stringify(x);
    }  else if (typeof x === 'function') {
        return `function ${x.name}()`;
    } else {
        return `${x}`;
    }
}

logln('Console boot completed.');