const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true';

const opcionesAccessCookie = {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'lax',
    path:'/'
};

const opcionesRefreshCookie = {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'lax',
    path: '/',
}

module.exports =  { opcionesAccessCookie, opcionesRefreshCookie};