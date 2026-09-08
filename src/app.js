require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const nonceMiddleware = require('./middlewares/nonce');
const {manejadorNotFound, manejadorErrores} = require('./middlewares/errorHandler');

const routerPrincipal = require('./routes');


const app = express();

/*
 Helmet agrega automaticamente cabeceras HTTP que mitigan ataques comunes (XSS, sniffing, clickjacking, etc)
*/
app.use(nonceMiddleware);
app.use(
    helmet({
        contentSecurityPolicy:{
            directives:{
                defaultSrc:["'self'"],
                styleSrc:["'self'",'https://cdn.jsdelivr.net', 'https://cdn.datatables.net/2.3.7/css/dataTables.dataTables.css'],
                scriptSrc:[
                    "'self'",
                    (req, res) => `'nonce-${res.locals.nonce}'`,
                    'https://cdn.jsdelivr.net',
                    'https://code.jquery.com/jquery-4.0.0.min.js',
                    'https://cdn.datatables.net/2.3.7/js/dataTables.js',
                ],
                fontSrc:["'self'",'https://cdn.jsdelivr.net', 'data:'],
                imgSrc:["'self'",'data:'],
                connectSrc:["'self'"],
                objectSrc:["'none'"],
                frameAncestors:["'none'"], //refuerza la protección anti-clickjacking
            },
        },
        //Se fuerza a HTTPS en producción mediante HSTS
        hsts: process.env.NODE_ENV === 'production',
    })
);

/*
    Solo permite los origenes indicados en el .env,
    credentials: true es necesario porque usamos cookies httpOnly.
*/

const origenesPermitidos = (process.env.CORS_ORIGIN || '').split(',').map((o) => o.trim());
app.use(
    cors({
        origin:origenesPermitidos,
        credentials: true,
    })
);


app.use(express.json({limit:'1mb'}));
app.use(express.urlencoded({extended: true, limit:'1mb'}));
app.use(cookieParser());

//Se oculta la cabecera "X-Powered-By" para no revelar la tecnologia usada

app.disable('x-powered-by');

//Motor de plantillas EJS

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Archivos estaticos

app.use(express.static(path.join(__dirname,'public')));

//Rutas publicas

app.use('/',routerPrincipal);

app.use(manejadorNotFound);
app.use(manejadorErrores);

module.exports = app;