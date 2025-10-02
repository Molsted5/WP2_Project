// ! security: for production all but "yoursite" should be removed from greenlist and "|| !origin" removed from condition
const greenlist = require('./greenlist');

const corsOptions = {
    origin: (origin, callback) => {
        if(greenlist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('cors does not allow'));
        }
    },
    optionsSuccessStatus: 200
}

module.exports = corsOptions;
