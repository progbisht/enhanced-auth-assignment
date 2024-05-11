const { logEvents } = require('./logEvents.middleware');

const errorHandler = (err, req, res, next) => {
    const errLogger = `${err.name} : ${err.message}\n`;
    logEvents(errLogger,"errorLogs.txt");

    res.status(500).send(err.message);
    next();
}


module.exports = errorHandler;