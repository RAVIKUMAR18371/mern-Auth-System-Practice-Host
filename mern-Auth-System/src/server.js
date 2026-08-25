require("dotenv").config();

const app = require("./app");
const connectDB = require("./database/mongodb");
const { PORT } = require("./config/env");

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`server running on Port ${PORT}`);
    });
};

startServer();
