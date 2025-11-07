// backend/middleware/bruteForceProtectionMiddleware.js
import ExpressBrute from "express-brute";
import MongooseStore from "express-brute-mongoose";
import mongoose from "mongoose";

const bruteForceSchema = new mongoose.Schema({
    _id: String,
    data: {
        count: Number,
        lastRequest: Date,
        firstRequest: Date
    },
    expires: { type: Date, index: { expires: '1d' }}
});

const BruteForceModel = mongoose.model("bruteforce", bruteForceSchema);

const store = new MongooseStore(BruteForceModel);

const bruteForce = new ExpressBrute(store, {
    freeRetries: 10,
    minWait: 5 * 1000,
    maxWait: 1 * 60 * 1000, 
    failCallback: function (req, res, next, nextValidRequestDate) {
        res.status(429).json({
            message: 'Too many failed attempts. Please try again later.',
            nextValidRequestDate
        });
    }
});

export default bruteForce;