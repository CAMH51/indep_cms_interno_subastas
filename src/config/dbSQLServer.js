const sqlServer = require('mssql');
   

const dbConfig = {
    server: process.env.SQL_SERVER_HOST,
    database: process.env.SQL_SERVER_DB,
    user: process.env.SQL_SERVER_USER,
    password: process.env.SQL_SERVER_PASS,
    port: parseInt(process.env.SQL_SERVER_PORT) || 1433,
    options: {
        encrypt: false, // Para Azure SQL Database
        trustServerCertificate: true, // Para desarrollo local
        enableArithAbort: true,
        requestTimeout: 30000,
        connectionTimeout: 30000,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};


let poolPromise;

// Función para conectar a la base de datos
const connectDB = async () => {
    try {
        if (!poolPromise) {
            poolPromise = sqlServer.connect(dbConfig);
        }
        
        const pool = await poolPromise;
        console.log('✅ Conectado exitosamente a SQL Server');
        return pool;
    } catch (error) {
        console.error('❌ Error conectando a SQL Server:', error.message);
        //throw error;
    }
};

const getPool = async () => {
    if (!poolPromise) {
        await connectDB();
    }
    return poolPromise;
};

// Función para cerrar la conexión
const closeDB = async () => {
    try {
        if (poolPromise) {
            const pool = await poolPromise;
            await pool.close();
            poolPromise = null;
            console.log('🔒 Conexión a SQL Server cerrada');
        }
    } catch (error) {
        console.error('❌ Error cerrando la conexión:', error.message);
    }
};


module.exports = {
    connectDB,
    getPool,
    closeDB,
    sqlServer
};

