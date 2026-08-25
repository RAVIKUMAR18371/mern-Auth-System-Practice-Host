const dotenv = require("dotenv");

dotenv.config();

const env = {
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGO_URI,
};

module.exports = env;
