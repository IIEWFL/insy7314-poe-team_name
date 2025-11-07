import CustomerProfile from "../models/CustomerProfile.js";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const generateToken = (customerProfile) => {
    return jwt.sign(
        {id: customerProfile._id, accountNumber: customerProfile.accountNumber}, JWT_SECRET,
        { expiresIn: '7d'}
    )
}

export const signupCustomerProfile = async ({fullName, idNumber, accountNumber, password, email}) => {
    //check if idNumber, accountNumber, email exists in the database
    const existingCustomerProfile = await CustomerProfile.findOne({ $or: [{idNumber}, {accountNumber}, {email}] });
    if(existingCustomerProfile){
        throw new Error('Details are already in use');
    }

    //create new user
    const customerProfile = new CustomerProfile({ fullName, idNumber, accountNumber, password, email });
    await customerProfile.save();

    //Generate jwt token
    const token = generateToken(customerProfile)
    return { customerProfile: {id: customerProfile._id, fullName: customerProfile.fullName, idNumber: customerProfile.idNumber, accountNumber: customerProfile.accountNumber, password: customerProfile.password, email: customerProfile.email}, token}
};

export const loginCustomerProfile = async ({fullName, accountNumber, password}) => {
    const customerProfile = await CustomerProfile.findOne({accountNumber});
    if (!customerProfile) {
        throw new Error('Invalid account number or password')
    }
    const isMatch = await customerProfile.comparePassword(password);
    if (!isMatch){
        throw new Error('Invalid account number or password')
    }
    const token = generateToken(customerProfile);
    return { customerProfile: {id: customerProfile._id, fullName: customerProfile.fullName, idNumber: customerProfile.idNumber, accountNumber: customerProfile.accountNumber, password: customerProfile.password, email: customerProfile.email}, token};
}