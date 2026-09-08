const sequelize = require('../config/dbPostrgres');

const Usuario = require('./Usuario');
const Rol = require('./Rol');
const Modulo = require('./Modulo');
const Permiso = require('./Permiso');
const RolPermiso = require('./RolPermiso');
const Sesion = require('./Sesion');


// ----------Usuario <> Rol (1:N)------------------
// Un rol puede tener muchos usuarios; un usuario tiene un solo rol
Rol.hasMany(Usuario, {foreignKey:'fk_rol_id', as:'usuarios'});
Usuario.belongsTo(Rol, {foreignKey:'fk_rol_id', as:'rol'});

//------- Modulo <-> Permiso (1:N) ----------------
// Un módulo agrupa varios permisos (crear, leer, actualizar, eliminar).
Modulo.hasMany(Permiso, {foreignKey:'fk_modulo_id', as: 'permisos', onDelete: 'CASCADE'});
Permiso.belongsTo(Modulo, {foreignKey:'fk_modulo_id', as:'modulo'});

//------------- Rol <-> Permiso  (N:M) mediante RolPermiso --------------
Rol.belongsToMany(Permiso,{
    through:RolPermiso,
    foreignKey:'fk_rol_id',
    otherKey:'fk_permiso_id',
    as:'permisos'
});

Permiso.belongsToMany(Rol,{
    through:RolPermiso,
    foreignKey:'fk_permiso_id',
    otherKey:'fk_rol_id',
    as:'roles'
});

//-------- Usuario <-> Sesion (1:N) -----------------
//La regla de negocio solo deja una sesión activa a la vez.
Usuario.hasMany(Sesion, {foreignKey:'fk_usuario_id', as:'sesiones'});
Sesion.belongsTo(Usuario, {foreignKey:'fk_usuario_id', as: 'usuario'});


module.exports = {
    sequelize,
    Usuario,
    Rol,
    Modulo,
    Permiso,
    RolPermiso,
    Sesion
}