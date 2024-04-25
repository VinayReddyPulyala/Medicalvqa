const mongoose = require("mongoose");
const express = require("express");
const dotenv = require("dotenv");
const userroute = require("./routes/userroute");
const cors = require("cors");
dotenv.config({ path: "../.env" });

const app = express();

app.use(express.json());

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

let mongooseconnect = async () => {
    try {
        await mongoose.connect(process.env.mongo, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Successfully connected to mongo");
    }
    catch (error) {
        console.log(error);
    }
}

app.listen(8800, async () => {
    await mongooseconnect();
    console.log("This is an API");
})

app.use("/", userroute);

app.get('/', (req, res) => {
    res.send("<strong>This is the API we use!!!<strong>");
});