const sequelize = require('../config/dbPostrgres');

const {Entity, Field} = require('./Meta');
const Dynamic = require('./Dynamic');
const Usuario = require('./Usuario');
const Rol = require('./Rol');
const Modulo = require('./Modulo');
const Permiso = require('./Permiso');
const RolPermiso = require('./RolPermiso');
const Sesion = require('./Sesion');
const Storage = require('./Storages');
//const Archivos = require('./Archivos');
const File = require('./File');
const Folder = require('./Folder');

const Slider = require('./Sliders');
const ConvocatoriasBienes = require('./ConvocatoriasBienes');
const EventosCursos = require('./EventoCurso');
const MenusLaterales = require('./MenusLaterales');
const MenusPrincipales = require('./MenuPrincipal');

const FileVersion = require('./FileVersion');



Entity.hasMany(Field,{as: 'fields', foreignKey: 'fk_entity_id',  onDelete: 'CASCADE'});
Field.belongsTo(Entity, {
    foreignKey: 'fk_entity_id'
});

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

/* Archivos.belongsTo(Storage, {foreignKey:'fk_storage_id', as:'storage'});
Storage.hasMany(Archivos, {foreignKey:'fk_storage_id', as:'archivos'}); */


Folder.hasMany(Folder, {as: 'subfolders', foreignKey: 'parent_id', onDelete: 'CASCADE'});
Folder.belongsTo(Folder, {as: 'parent', foreignKey: 'parent_id'});

Folder.hasMany(File, { as: 'files', foreignKey: 'folder_id', onDelete: 'CASCADE' });
File.belongsTo(Folder, { as: 'folder', foreignKey: 'folder_id' });

Storage.hasMany(Folder,{foreignKey:'fk_storage_id', as:'folders', onDelete:'CASCADE'});
Folder.belongsTo(Storage,{foreignKey:'fk_storage_id', as:'storage'});

Storage.hasMany(File,{foreignKey:'fk_storage_id',as:'files',onDelete:'CASCADE'});
File.belongsTo(Storage,{foreignKey:'fk_storage_id', as:'storage'});


// Relaciones
File.hasMany(FileVersion, { as: 'versions', foreignKey: 'fk_file_id', onDelete: 'CASCADE' });
FileVersion.belongsTo(File, { as: 'file', foreignKey: 'fk_file_id' });
FileVersion.belongsTo(Usuario, { as: 'usuario', foreignKey: 'fk_usuario_id' });

module.exports = {
    sequelize,
    Usuario,
    Rol,
    Modulo,
    Permiso,
    RolPermiso,
    Sesion,
    Storage,
    //Archivos,
    File,
    Folder,
    Slider,
    ConvocatoriasBienes,
    EventosCursos,
    MenusLaterales,
    MenusPrincipales,
    Dynamic,
    Entity,
    Field,
    FileVersion
}