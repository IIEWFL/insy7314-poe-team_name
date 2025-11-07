import EmployeeProfile from "../models/EmployeeProfile.js";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (employeeProfile) => {
    return jwt.sign(
        {
            id: employeeProfile._id, 
            employeeId: employeeProfile.employeeId,
            role: employeeProfile.role
        }, 
        JWT_SECRET,
        { expiresIn: '7d'}
    )
}

// Pre-register employee (called by admin/system)
export const registerEmployee = async ({fullName, employeeId, password, email, department, role = 'verifier'}) => {
    // Check if employee already exists
    const existingEmployee = await EmployeeProfile.findOne({ $or: [{employeeId}, {email}] });
    if(existingEmployee){
        throw new Error('Employee ID or email already in use');
    }

    // Create new employee
    const employeeProfile = new EmployeeProfile({ 
        fullName, 
        employeeId, 
        password, 
        email, 
        department,
        role,
        isActive: true
    });
    await employeeProfile.save();

    return { 
        employeeProfile: {
            id: employeeProfile._id, 
            fullName: employeeProfile.fullName, 
            employeeId: employeeProfile.employeeId, 
            email: employeeProfile.email,
            department: employeeProfile.department,
            role: employeeProfile.role
        }
    };
};

// Employee login
export const loginEmployee = async ({employeeId, password}) => {
    const employeeProfile = await EmployeeProfile.findOne({employeeId});
    
    if (!employeeProfile) {
        throw new Error('Invalid employee ID or password');
    }

    if (!employeeProfile.isActive) {
        throw new Error('Employee account is inactive. Contact administrator.');
    }

    const isMatch = await employeeProfile.comparePassword(password);
    if (!isMatch){
        throw new Error('Invalid employee ID or password');
    }

    const token = generateToken(employeeProfile);
    return { 
        employeeProfile: {
            id: employeeProfile._id, 
            fullName: employeeProfile.fullName, 
            employeeId: employeeProfile.employeeId, 
            email: employeeProfile.email,
            department: employeeProfile.department,
            role: employeeProfile.role
        }, 
        token
    };
}