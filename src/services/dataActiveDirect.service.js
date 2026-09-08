const {getPool,sqlServer} = require('../config/dbSQLServer');

async function queryDataActiveDirectory(correo){
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('correo',sqlServer.VarChar,correo)
            .query(`SELECT em.MeNomEmp + ' ' + em.MeNomAP + ' ' + em.MeNomAM Nombre, UR.CvDsc AreaDesc, p.PtDsc1 PuestoDesc, 
                    ISNULL(em.correo, ad.mail) Correo, ISNULL(em.ext,ad.telephonenumber) Ext
                    FROM Empleado em 
                    inner join [dbo].[Unidad_Responsable] UR on
                    ur.ClkUR = em.MeUnSub
                    INNER JOIN Puesto p on
                    p.ClkPt =  em.MePuesto
                    AND ClkPtVer = (SELECT MAX(ClkPtVer) FROM Puesto)
                    INNER JOIN ACTIVEDIRECTORY ad on
                    ad.userW = REPLACE(em.Correo,'@indep.gob.mx','')
                    WHERE em.MeIndMe in (10,20)
                    AND correo = @correo
                    `);   
        
        return result.recordset;
    } catch (error) {
        console.error(error.message);
    }
}

module.exports ={
    queryDataActiveDirectory
}