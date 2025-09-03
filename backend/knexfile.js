require('dotenv').config();

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: process.env.DB_FILENAME || './database/timetable.db'
    },
    migrations: {
      directory: '../database/migrations'
    },
    seeds: {
      directory: '../database/seeds'
    },
    useNullAsDefault: true
  },

  test: {
    client: 'sqlite3',
    connection: {
      filename: ':memory:'
    },
    migrations: {
      directory: '../database/migrations'
    },
    useNullAsDefault: true
  },

  production: {
    client: 'sqlite3',
    connection: {
      filename: process.env.DB_FILENAME || './database/timetable.db'
    },
    migrations: {
      directory: '../database/migrations'
    },
    seeds: {
      directory: '../database/seeds'
    },
    useNullAsDefault: true
  }
};
