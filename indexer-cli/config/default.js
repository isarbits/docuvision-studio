require('dotenv').config();

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
    app: 'search',
    host: process.env.HOST || 'http://localhost:8100/v1',
    elastic: {
        index: 'docuvision',
    }
};
