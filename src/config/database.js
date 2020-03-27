const Sequelize = require('sequelize')

const database = process.env.DB_NAME
const username = process.env.DB_USERNAME
const password = process.env.DB_PASS

const sequelize = new Sequelize(database, username, password, {
  host: process.env.DATABASE_URL,
  dialect: process.env.DB_DIALECT,
  port: process.env.DB_PORT,
  dialectOptions: { timezone: process.env.DB_TIMEZONE }
})

module.exports = { sequelize, Sequelize }
