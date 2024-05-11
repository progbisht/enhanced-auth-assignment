const { format } = require('date-fns');
const fs = require('fs');
const fsPromises = require('fs').promises;
const { v4:uuid } = require('uuid');
const path = require('path');


const logEvents = async (message, fileName) => {
    const timestamp = format(new Date(), "yyyyMMdd\tHH:mm:ss");
    const logMessage = `${timestamp}\t${uuid()}\t${message}`;

    try{
        if(!fs.existsSync(path.join(__dirname,'..','logs')) ){
            await fsPromises.mkdir(path.join(__dirname,'..','logs'));
        }
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', fileName), logMessage);
    }
    catch(err){
        console.log(err);
    }
        

}

const logger = (req,res,next) => {
    const reqLog = `${req.method}\t${req.headers.origin}\t${req.url}\n`;
    logEvents(reqLog,"reqLogs.txt");
    next();
}

module.exports = {logger, logEvents};