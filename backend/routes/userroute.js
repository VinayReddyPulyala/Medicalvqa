const User = require("../models/UserModel");
const express = require("express");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { parse } = require('cookie');
const multer = require('multer');

// Multer configuration
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

dotenv.config();

const router = express.Router();

const createToken = (id) => {
    let token = jwt.sign({ id }, process.env.tokensignature);
    return token;
}

let handleerror = (err) => {
    let error = { email: "", password: "" };
    if (err.code == 11000) {
        error.email = "User Already Exists";
        return error;
    }
    if (err.message.includes("users validation failed")) {
        Object.values(err.errors).forEach(({ properties }) => {
            error[properties.path] = properties.message;
        });
    }
    return error;
}

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {

            let verify = await bcrypt.compare(password, user.password);
            if (verify) {
                res.cookie("jwt", createToken(user._id), {
                    withCredentials: true,
                    httpOnly: false,
                    expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                })
                res.status(200).json({ credentials: true });
            }
            else {
                res.json({ "error": "Invalid Password" });
            }
        }
        else {
            res.json({ "error": "User Not Found" });
        }
    } catch (err) {
        res.status(500).json({ "message": err });
    }
})

const users = {};

router.post('/sendotp', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.json({ error: 'Email is required.' });
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        },
    });

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expireTime = Date.now() + 3 * 60 * 1000;

    users[email] = { otp, expireTime };

    const mailOptions = {
        from: 'vinayreddyd24unof@gmail.com',
        to: email,
        subject: 'OTP VERIFICATION',
        text: `Your OTP is ${otp}. It will expire in 3 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ error: 'Failed to send OTP.' });
        }

        res.json({ success: true, message: 'OTP sent successfully.' });
    });
});

router.post('/userverification', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.json({ error: 'Email and OTP are required.' });
        }

        const user = users[email];

        if (!user || user.otp !== parseInt(otp) || user.expireTime < Date.now()) {
            return res.json({ error: 'Invalid OTP.' });
        }
        delete users[email];

        res.json({ success: true, message: 'OTP verified successfully.' });
    }
    catch (err) {
        res.status(500).json({ "message": err });
    }
});

router.post("/register", async (req, res) => {
    let { email, password } = req.body;
    try {
        if (email.length == 0) {
            res.json({
                error: {
                    email: "email is required"
                }
            })
            return;
        }
        else if (password.length == 0) {
            res.json({
                error: {
                    password: "Password is required"
                }
            })
            return;
        }
        const salt = await bcrypt.genSalt();
        password = await bcrypt.hash(password, salt);
        let user = await User.create({ email, password });
        let token = createToken(user._id);
        res.cookie('jwt', token, {
            withCredentials: true,
            httpOnly: false,
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        })
        user.sessions.push([]);
        await user.save();
        res.status(200).json({ created: true });
    } catch (err) {
        console.log(err);
        let error = handleerror(err);
        res.json({ error, created: false });
    }
})

router.get("/", async (req, res) => {
    try {
        if (req.headers.cookie) {
            let token = parse(req.headers.cookie);
            if (token.jwt) {

                let { id } = jwt.verify(token.jwt, process.env.tokensignature);

                let user = await User.findById(id);
                if (user) {
                    res.json({ message: "cookie matched", "user": user.email, "sessions": user.sessions });
                    return;
                }
                else {
                    res.json({ error: "cookie mismatch" });
                    return;
                }
            }
            else {
                res.json({ error: "cookie Not Found" });
                return;
            }
        }
        else {
            res.json({ error: "No cookie Found" });
            return;
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
    }
})

router.get("/initlog", async (req, res) => {
    try {
        if (req.headers.cookie) {
            let token = parse(req.headers.cookie);
            if (token.jwt) {
                let { id } = jwt.verify(token.jwt, process.env.tokensignature);
                let user = await User.findById(id);
                if (user) {
                    res.status(200).json({ Success: "Success" });
                    return;
                }
                else {
                    res.json({ error: "cookie mismatch" });
                    return;
                }
            }
            else {
                res.json({ error: "cookie Not Found" });
                return;
            }
        }
        else {
            res.json({ error: "cookie Not Found" });
            return;
        }
    } catch (err) {
        res.status(500).json({ error: "Internal Servor error" });
        return;
    }
})

router.post("/logout", async (req, res) => {
    try {
        res.clearCookie('jwt');
        res.send("ok");
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post('/createSession', async (req, res) => {
    try {
        if (req.headers.cookie) {
            let token = parse(req.headers.cookie);
            if (token.jwt) {

                let { id } = jwt.verify(token.jwt, process.env.tokensignature);

                let user = await User.findById(id);
                if (user) {

                    user.sessions.push([]);

                    await user.save();

                    res.status(200).json({ message: 'New session created successfully', sessions: user.sessions });
                    return;
                }
                else {
                    res.json({ error: "cookie mismatch" });
                    return;
                }
            }
            else {
                res.json({ error: "cookie Not Found" });
                return;
            }
        }
        else {
            res.json({ error: "No cookie Found" });
            return;
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


router.post('/addSessionItem', upload.single('file'), async (req, res) => {
    try {
        if (req.headers.cookie) {
            let token = parse(req.headers.cookie);
            if (token.jwt) {
                const sessionIndex = req.body.sessionind; 
                let { id } = jwt.verify(token.jwt, process.env.tokensignature);

                let user = await User.findById(id);
                if (user) {
                    const session = user.sessions[sessionIndex];

                    
                    const newItem = {
                        image: Buffer.from(req.file.buffer),
                        question: req.body.question,
                        answer: req.body.answer
                    };

                    session.push(newItem);
                    await user.save();
                    res.status(200).json({ sessions: user.sessions });
                    return;
                } else {
                    res.json({ error: "cookie mismatch" });
                    return;
                }
            } else {
                res.json({ error: "cookie Not Found" });
                return;
            }
        } else {
            res.json({ error: "No cookie Found" });
            return;
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



module.exports = router;