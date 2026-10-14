require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const nonceMiddleware = require('./middlewares/nonce');
const {manejadorNotFound, manejadorErrores} = require('./middlewares/errorHandler');
const activeStorage = require('./middlewares/activeStorage');

const routerPrincipal = require('./routes');
const routerApi = require('./routes/api');


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
                styleSrc:[
                    "'self'",
                    (req, res) => `'nonce-${res.locals.nonce}'`,
                    'https://cdn.jsdelivr.net', 
                    'https://cdn.datatables.net/2.3.7/css/dataTables.dataTables.css'
                ],
                scriptSrc:[
                    "'self'",
                    (req, res) => `'nonce-${res.locals.nonce}'`,
                    'https://cdn.jsdelivr.net',
                    'https://code.jquery.com/jquery-4.0.0.min.js',
                    'https://cdn.datatables.net/2.3.7/js/dataTables.js',
                    'https://unpkg.com/'
                ],
                fontSrc:["'self'",'https://cdn.jsdelivr.net', 'data:'],
                imgSrc:["'self'",'data:'],
                connectSrc:[
                    "'self'",
                    process.env.CTRL_ACCESS_TOKEN,
                    process.env.CTRL_ACCESS_USERINFO,
                    process.env.CTRL_ACCESS_ROLES,
                    process.env.API_MFA,
                ].filter(Boolean),
                frameSrc:["'self'"],
                objectSrc:["'self'"],
                frameAncestors:["'self'"], //refuerza la protección anti-clickjacking
                upgradeInsecureRequests: null, // Evita que el navegador fuerce URLs http:// a https://
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
app.use(express.static(path.join(__dirname,'public')));

app.use(activeStorage);

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

// Defaults para vistas EJS
app.use((req, res, next) => {
    res.locals.puede = res.locals.puede || (() => false);
    res.locals.permisos = res.locals.permisos || [];
    res.locals.usuarioActual = res.locals.usuarioActual || null;
    res.locals.menus = res.locals.menus || [];
    res.locals.rolNombre = res.locals.rolNombre || null;
    next();
});

//Rutas publicas

app.use('/',routerPrincipal);
app.use('/api/v1',routerApi);
app.use('/api',routerApi);

app.use(manejadorNotFound);
app.use(manejadorErrores);

module.exports = app;