const mysql = require("mysql")
require("dotenv").config()

const db = mysql.createPool({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.db,
    connectionLimit: 10,
    multipleStatements: true
})

const excQuery = async (query) => {
    return new Promise(async (resolve) => {
        db.query(query,(err,res)=>{
            resolve(res)
        })
    })
}

module.exports = {excQuery}