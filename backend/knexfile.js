require('dotenv').config();

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: '../database/timetable.db'
    },
    useNullAsDefault: true,
    migrations: {
      directory: '../database/migrations'
    },
    seeds: {
      directory: '../database/seeds'
    }
  },

  test: {
    client: 'sqlite3',
    connection: {
      filename: '../database/timetable_test.db'
    },
    useNullAsDefault: true,
    migrations: {
      directory: '../database/migrations'
    }
  },

  production: {
    client: 'sqlite3',
    connection: {
      filename: process.env.DB_FILENAME || '../database/timetable.db'
    },
    useNullAsDefault: true,
    migrations: {
      directory: '../database/migrations'
    },
    seeds: {
      directory: '../database/seeds'
    }
  }
};
