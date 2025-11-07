import {signupCustomerProfile, loginCustomerProfile} from '../services/customerProfileService.js';

const signup = async (req, res) => {
    try {
        const { fullName, idNumber, accountNumber, password, email } = req.body;
        const result = await signupCustomerProfile ({ fullName, idNumber, accountNumber, password, email })
        res.status(201).json({'new user sign up': result})
    }
    catch (err) {
        res.status(400).json({ error: err.message})
    }
};

const login = async (req, res) => {
    try {
        const { fullName, accountNumber, password } = req.body;
        const result = await loginCustomerProfile({fullName, accountNumber, password});
        res.status(200).json(result);
    }
    catch (err) {
        res.status(400).json({error: err.message});
    }
};

export default {
    signup,
    login,
}