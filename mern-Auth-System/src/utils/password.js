const bcrypt = require("bcrypt");

const SALT_Rounds = 12;

const hashPassword = async (password) => {
    return bcrypt.hash(password, SALT_Rounds);
};

const comparePassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
}

module.exports = {
    hashPassword,
    comparePassword
}