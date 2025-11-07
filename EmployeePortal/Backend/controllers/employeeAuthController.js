import { registerEmployee, loginEmployee } from '../services/employeeProfileService.js';

// Register new employee (admin only - used during employment)
const register = async (req, res) => {
    try {
        const { fullName, employeeId, password, email, department, role } = req.body;
        const result = await registerEmployee({ fullName, employeeId, password, email, department, role });
        res.status(201).json({ message: 'Employee registered successfully', employee: result.employeeProfile });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Employee login
const login = async (req, res) => {
    try {
        const { employeeId, password } = req.body;
        const result = await loginEmployee({ employeeId, password });
        res.status(200).json(result);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export default {
    register,
    login,
}