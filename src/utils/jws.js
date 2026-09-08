const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '10m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '8h';

function generarAccessToken(payload){
    return jwt.sign(payload, ACCESS_SECRET, {expiresIn:ACCESS_EXPIRES_IN});
}

function generarRefreshToken(payload){
    return jwt.sign(payload, REFRESH_SECRET, {expiresIn: REFRESH_EXPIRES_IN});
}

function verificarAccessToken(token){
    return jwt.verify(token,ACCESS_SECRET);
}

function verificarRefreshToken(token){
    return jwt.verify(token,REFRESH_SECRET);
}


function decodificarSinVerificar(token){
    return jwt.decode(token);
}

function duracionAMilisegundos(cadena){
    const match = /^(\d+)([smhd])$/.exec(cadena);
    if(!match) return 10 * 60 * 1000;
    const valor = parseInt(match[1],10);
    const unidad = match[2];
    const factores = {s: 1000, m: 60000, h: 3600000, d: 86400000};
    return valor * factores[unidad];
}

module.exports = {
    generarAccessToken,
    generarRefreshToken,
    verificarAccessToken,
    verificarRefreshToken,
    decodificarSinVerificar,
    duracionAMilisegundos,
    ACCESS_EXPIRES_IN,
    REFRESH_EXPIRES_IN
}