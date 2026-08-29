require("dotenv").config();

const app = require("./app");
const connectDB = require("./database/mongodb");

// Use PORT from environment (provided by Render) or fallback to config
const PORT = process.env.PORT || require("./config/env").PORT;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`server running on Port ${PORT}`);
    });
};

startServer();