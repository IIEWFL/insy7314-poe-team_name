import EmployeeProfile from "../models/EmployeeProfile.js";

// Get current employee's profile
const getMe = async (req, res) => {
    try {
        if (!/^[a-fA-F0-9]{24}$/.test(req.employeeProfile.id)) {
            return res.status(400).json({ error: 'Invalid employee ID format' });
        }

        const employeeProfile = await EmployeeProfile.findById(req.employeeProfile.id).select('-password');
        if (!employeeProfile) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json({ employeeProfile });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error: ' + err.message });
    }
}

// Get all employee profiles (admin only)
const getAllEmployees = async (req, res) => {
    try {
        const employeeProfiles = await EmployeeProfile.find().select('-password');
        res.status(200).json({ count: employeeProfiles.length, employeeProfiles });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error: ' + err.message });
    }
}

// Get employee profile by ID (admin only)
const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^[a-fA-F0-9]{24}$/.test(id)) {
            return res.status(400).json({ error: 'Invalid employee ID format' });
        }

        const employeeProfile = await EmployeeProfile.findById(id).select('-password');
        if (!employeeProfile) {
            return res.status(404).json({ error: 'Employee profile not found' });
        }

        res.status(200).json({ employeeProfile });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error: ' + err.message });
    }
}

// Deactivate employee account (admin only)
const deactivateEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^[a-fA-F0-9]{24}$/.test(id)) {
            return res.status(400).json({ error: 'Invalid employee ID format' });
        }

        const employeeProfile = await EmployeeProfile.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        ).select('-password');

        if (!employeeProfile) {
            return res.status(404).json({ error: 'Employee profile not found' });
        }

        res.status(200).json({ 
            message: 'Employee account deactivated successfully', 
            employeeProfile 
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error: ' + err.message });
    }
}

// Activate employee account (admin only)
const activateEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^[a-fA-F0-9]{24}$/.test(id)) {
            return res.status(400).json({ error: 'Invalid employee ID format' });
        }

        const employeeProfile = await EmployeeProfile.findByIdAndUpdate(
            id,
            { isActive: true },
            { new: true }
        ).select('-password');

        if (!employeeProfile) {
            return res.status(404).json({ error: 'Employee profile not found' });
        }

        res.status(200).json({ 
            message: 'Employee account activated successfully', 
            employeeProfile 
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error: ' + err.message });
    }
}

export default {
    getMe,
    getAllEmployees,
    getEmployeeById,
    deactivateEmployee,
    activateEmployee
}