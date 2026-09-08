const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true';

const opcionesAccessCookie = {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'strict',
    path:'/'
};

const opcionesRefreshCookie = {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'strict',
    path: '/auth',
}

module.exports =  { opcionesAccessCookie, opcionesRefreshCookie};