// CONFIGURACIÓN DE PLATAFORMAS (Límites de PIN y especificaciones de entrada)
const configPlataformas = {
    'Netflix Premium': { requiereCorreo: false, usaPin: true, digitosPin: 4 },
    'Disney+': { requiereCorreo: false, usaPin: true, digitosPin: 4 },
    'Max': { requiereCorreo: false, usaPin: true, digitosPin: 4 },
    'Crunchyroll+': { requiereCorreo: false, usaPin: false },
    'Prime Video': { requiereCorreo: false, usaPin: true, digitosPin: 5 },
    'Paramount+': { requiereCorreo: false, usaPin: true, digitosPin: 4 },
    'Vix Premium': { requiereCorreo: false, usaPin: true, digitosPin: 4 },
    'Canva Pro': { requiereCorreo: true, usaPin: false },
    'Spotify Premium': { requiereCorreo: true, usaPin: false },
    'YouTube Premium': { requiereCorreo: true, usaPin: false },
    'IPTV': { requiereCorreo: false, usaPin: false },
    'Apple TV+': { requiereCorreo: false, usaPin: false },
    'ChatGPT Plus': { requiereCorreo: false, usaPin: false },
    'CapCut Pro': { requiereCorreo: true, usaPin: false }
};

let compraActual = { plataforma: '', precio: '', datoPrincipal: '', pin: '' };

// 1. ABRIR EL MODAL ADAPTATIVO
function abrirPedido(nombrePlataforma, precioPlataforma) {
    compraActual.plataforma = nombrePlataforma;
    compraActual.precio = precioPlataforma;
    const config = configPlataformas[nombrePlataforma];

    document.getElementById('modal-plataforma-nombre').innerText = nombrePlataforma;
    document.getElementById('yape-precio').innerText = precioPlataforma;
    
    // Validar si pide Correo o Perfil
    const labelDato = document.getElementById('label-dato-principal');
    const inputDato = document.getElementById('perfil-nombre');
    if(config.requiereCorreo) {
        labelDato.innerHTML = '<i class="fas fa-envelope"></i> Correo Electrónico para Activación:';
        inputDato.placeholder = 'Ej. tu-correo@gmail.com';
    } else {
        labelDato.innerHTML = '<i class="fas fa-user-tag"></i> Nombre para el Perfil:';
        inputDato.placeholder = 'Ej. Carlos Retro';
    }
    inputDato.value = '';

    // Validar el PIN y su cantidad de dígitos correspondientes
    const cajaPin = document.getElementById('caja-pin-completa');
    const inputPin = document.getElementById('perfil-pin');
    if(config.usaPin) {
        cajaPin.classList.remove('hidden');
        inputPin.maxLength = config.digitosPin;
        inputPin.placeholder = `Ej. ${config.digitosPin === 5 ? '12345' : '1998'}`;
        inputPin.setAttribute('required', 'true');
    } else {
        cajaPin.classList.add('hidden');
        inputPin.removeAttribute('required');
    }
    inputPin.value = '';

    document.getElementById('pantalla-encuesta').classList.remove('hidden');
    document.getElementById('pantalla-pago').classList.add('hidden');
    document.getElementById('modal-pedido').classList.add('active');
}

function cerrarModal() { 
    document.getElementById('modal-pedido').classList.remove('active'); 
}

function generarPinRandom() {
    const digitos = configPlataformas[compraActual.plataforma].digitosPin;
    let pin = '';
    for(let i=0; i<digitos; i++) { 
        pin += Math.floor(Math.random() * 10); 
    }
    document.getElementById('perfil-pin').value = pin;
}

function procederAPago(event) {
    event.preventDefault();
    compraActual.datoPrincipal = document.getElementById('perfil-nombre').value;
    compraActual.pin = document.getElementById('perfil-pin').value;
    document.getElementById('pantalla-encuesta').classList.add('hidden');
    document.getElementById('pantalla-pago').classList.remove('hidden');
}

// ENVÍO DE DATOS CON TU NÚMERO DE ASISTENCIA Y VENTA
function enviarPedidoWhatsApp() {
    // Tu número de soporte y cobro guardado de manera interna
    const miNumeroWhatsApp = "51916982923"; 
    const config = configPlataformas[compraActual.plataforma];
    
    let textoDato = config.requiereCorreo ? `📧 *Correo registrado:* ${compraActual.datoPrincipal}` : `👤 *Perfil solicitado:* ${compraActual.datoPrincipal}`;
    let textoPin = config.usaPin ? `🔑 *PIN elegido:* ${compraActual.pin}\n` : '';

    // Mensaje formateado que te llegará para que solo verifiques la captura que te adjuntarán
    const mensaje = `🔥🍿 *NUEVA ORDEN - STREAMING HOME HUB* 🍿🔥\n\n` +
                    `📺 *Plataforma:* ${compraActual.plataforma}\n` +
                    `💰 *Monto Yapeado:* ${compraActual.precio}\n\n` +
                    `${textoDato}\n${textoPin}\n` +
                    `📸 _Adjunto mi captura del comprobante de Yape a continuación._`;

    // Redirección directa hacia tu chat
    window.open(`https://wa.me/${miNumeroWhatsApp}?text=${encodeURIComponent(mensaje)}`, '_blank');
    cerrarModal();
}

window.onclick = function(event) {
    if (event.target == document.getElementById('modal-pedido')) cerrarModal();
}