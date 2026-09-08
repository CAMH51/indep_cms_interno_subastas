require('dotenv').config();
const app = require('./app');
const {sequelize} = require('./models');
const {connectDB} = require('./config/dbSQLServer');

const PORT = process.env.PORT || 3000;

async function iniciar(){
    try {
        await sequelize.authenticate();
        console.log('Conexion a la base de datos establecida correctamente.');
        
        await sequelize.sync({alter: true});
        console.log('Modelos sincronizados con la base de datos.')
        
        app.listen(PORT,async() =>{
            //await connectDB();
            console.log(`Servidor escuchando en http://localhost:${PORT}`)
        });
    } catch (error) {
        console.error('No fue posible iniciar la aplicación:', error);
        process.exit(1)
    }
}


iniciar();