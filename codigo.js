const TARIFA_AUTOMOVIL = 125;
const TARIFA_MOTO = 95;
const DESCUENTO_PICO_Y_PLACA = 0.25; // 25%
const MULTIPLO_AJUSTE = 50;

const DENOMINACIONES = [50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100, 50];

const formulario = document.getElementById('formulario');
const resultado = document.getElementById('resultado');
const tipoVehiculo = document.getElementById('tipoVehiculo');
const placa = document.getElementById('placa');
const fechaIngreso = document.getElementById('fechaIngreso');
const fechaSalida = document.getElementById('fechaSalida');
const errorPlaca = document.getElementById('errorPlaca');
const errorIngreso = document.getElementById('errorIngreso');
const errorSalida = document.getElementById('errorSalida');
const tiempoMin = document.getElementById('tiempoMin');
const tiempoHoras = document.getElementById('tiempoHoras');
const valorBase = document.getElementById('valorBase');
const descuentoInfo = document.getElementById('descuentoInfo');
const valorDescuento = document.getElementById('valorDescuento');
const valorFinal = document.getElementById('valorFinal');
const dineroRecibido = document.getElementById('dineroRecibido');
const calcularCambio = document.getElementById('calcularCambio');
const errorPago = document.getElementById('errorPago');
const cambioInfo = document.getElementById('cambioInfo');
const desgloseCambio = document.getElementById('desgloseCambio');
const guardarRegistro = document.getElementById('guardarRegistro');

let datosCalculados = {};

function validarPlaca(placaTexto) {
    // Formato colombiano: 3 letras + 3 números o 2 números + 1 letra
    const regexPlaca = /^[A-Za-z]{3}[0-9]{2,3}$|^[A-Za-z]{3}[0-9][A-Za-z]$/;
    return regexPlaca.test(placaTexto.trim());
}

function validarHorario(fecha) {
    const hora = fecha.getHours();
    const minutos = fecha.getMinutes();
    const horaTotal = hora * 60 + minutos;
    const apertura = 5 * 60; // 5:00 AM
    const cierre = 24 * 60; // 12:00 PM (medianoche)
    return horaTotal >= apertura && horaTotal < cierre;
}

function validarFechas(ingreso, salida) {
    const ingresoObj = new Date(ingreso);
    const salidaObj = new Date(salida);

    if (salidaObj <= ingresoObj) return 'La fecha de salida debe ser posterior a la de ingreso';
    if (!validarHorario(ingresoObj)) return 'El ingreso debe ser entre las 5:00 AM y 12:00 PM';
    if (!validarHorario(salidaObj)) return 'La salida debe ser entre las 5:00 AM y 12:00 PM';
    return null;
}

function tienePicoYPlaca(placa, fecha) {
    
    const dia = fecha.getDay();
    const ultimoCaracter = placa.trim().slice(-1);
    const esNumero = !isNaN(ultimoCaracter);
    const ultimoDigito = esNumero ? parseInt(ultimoCaracter) : null;

   
    const reglas = {
        1: [1, 2], 
        2: [3, 4], 
        3: [5, 6],
        4: [7, 8], 
        5: [9, 0]  
    };

    if (dia >= 1 && dia <= 5 && ultimoDigito !== null) {
        return reglas[dia].includes(ultimoDigito);
    }
    return false;
}


function calcularTiempoMinutos(ingreso, salida) {
    const ingresoObj = new Date(ingreso);
    const salidaObj = new Date(salida);
    return Math.round((salidaObj - ingresoObj) / 60000); 
}

function ajustarMultiplo50(valor) {
   return Math.floor(valor / MULTIPLO_AJUSTE) * MULTIPLO_AJUSTE;
}

function calcularDesgloseCambio(monto) {
    let resto = monto;
    let desglose = [];

    for (let denominacion of DENOMINACIONES) {
        if (resto >= denominacion) {
            const cantidad = Math.floor(resto / denominacion);
            resto = resto % denominacion;
            desglose.push(`${cantidad} ${denominacion >= 1000 ? 'billete(s)' : 'moneda(s)'} de $${denominacion}`);
        }
    }
    return desglose.join(', ');
}


formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    let valido = true;

    
    errorPlaca.textContent = '';
    errorIngreso.textContent = '';
    errorSalida.textContent = '';

   
    if (!validarPlaca(placa.value)) {
        errorPlaca.textContent = 'Placa inválida. Formato: 3 letras + 2 o 3 números o letra';
        valido = false;
    }

    
    const errorFecha = validarFechas(fechaIngreso.value, fechaSalida.value);
    if (errorFecha) {
        if (errorFecha.includes('ingreso')) errorIngreso.textContent = errorFecha;
        else errorSalida.textContent = errorFecha;
        valido = false;
    }

    if (!valido) return;

   
    const minutos = calcularTiempoMinutos(fechaIngreso.value, fechaSalida.value);
    const horas = (minutos / 60).toFixed(2);
    let tarifa = tipoVehiculo.value === 'automovil' ? TARIFA_AUTOMOVIL : TARIFA_MOTO;
    let valorBaseCalc = minutos * tarifa;
    let descuento = 0;

    
    if (tipoVehiculo.value === 'automovil') {
        const fechaIngresoObj = new Date(fechaIngreso.value);
        if (tienePicoYPlaca(placa.value, fechaIngresoObj)) {
            descuento = valorBaseCalc * DESCUENTO_PICO_Y_PLACA;
            descuentoInfo.classList.remove('oculto');
            valorDescuento.textContent = descuento.toFixed(0);
        } else {
            descuentoInfo.classList.add('oculto');
        }
    } else {
        descuentoInfo.classList.add('oculto');
    }

    const valorSinAjuste = valorBaseCalc - descuento;
    const valorFinalCalc = ajustarMultiplo50(valorSinAjuste);

    
    datosCalculados = {
        fecha: new Date().toISOString().split('T')[0],
        tipoVehiculo: tipoVehiculo.value,
        placa: placa.value.toUpperCase(),
        tiempoHoras: parseFloat(horas),
        valorPagar: valorFinalCalc
    };

    
    tiempoMin.textContent = minutos;
    tiempoHoras.textContent = horas;
    valorBase.textContent = valorBaseCalc.toFixed(0);
    valorFinal.textContent = valorFinalCalc;
    resultado.classList.remove('oculto');
    cambioInfo.classList.add('oculto');
    guardarRegistro.classList.add('oculto');
    dineroRecibido.value = '';
    errorPago.textContent = '';
});

calcularCambio.addEventListener('click', () => {
    const valorPagar = datosCalculados.valorPagar;
    const recibido = parseInt(dineroRecibido.value);

    if (isNaN(recibido) || recibido < valorPagar) {
        errorPago.textContent = `El dinero recibido debe ser al menos $${valorPagar}`;
        cambioInfo.classList.add('oculto');
        guardarRegistro.classList.add('oculto');
        return;
    }

    errorPago.textContent = '';
    const cambio = recibido - valorPagar;
    const desglose = calcularDesgloseCambio(cambio);

    desgloseCambio.textContent = cambio === 0 ? 'No hay cambio' : desglose;
    cambioInfo.classList.remove('oculto');
    guardarRegistro.classList.remove('oculto');
});

guardarRegistro.addEventListener('click', () => {
    
    const registroJSON = JSON.stringify(datosCalculados, null, 2);
    const blob = new Blob([registroJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registro_parqueadero_${datosCalculados.fecha}_${datosCalculados.placa}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert('✅ Registro guardado correctamente');
});
