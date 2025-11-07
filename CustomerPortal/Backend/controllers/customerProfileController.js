import CustomerProfile from "../models/CustomerProfile.js";

const getME = async (req, res) => {
    try {
        // Validate MongoDB ObjectId format
        if (!/^[a-fA-F0-9]{24}$/.test(req.customerProfile.id)) {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }

        const customerProfile = await CustomerProfile.findById(req.customerProfile.id).select('-password');
        if (!customerProfile) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ customerProfile });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error: ' + err.message })
    }
}

const getAllCustomerProfiles = async (req, res) => {
    try {
        // Get all profiles without passwords
        const customerProfiles = await CustomerProfile.find().select('-password');
        res.status(200).json({ count: customerProfiles.length, customerProfiles });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error: ' + err.message });
    }
}

const getCustomerProfileById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectId format
        if (!/^[a-fA-F0-9]{24}$/.test(id)) {
            return res.status(400).json({ error: 'Invalid customer ID format' });
        }

        const customerProfile = await CustomerProfile.findById(id).select('-password');
        if (!customerProfile) {
            return res.status(404).json({ error: 'Customer profile not found' });
        }

        res.status(200).json({ customerProfile });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error: ' + err.message });
    }
}

const deleteCustomerProfileById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectId format
        if (!/^[a-fA-F0-9]{24}$/.test(id)) {
            return res.status(400).json({ error: 'Invalid customer ID format' });
        }

        const customerProfile = await CustomerProfile.findByIdAndDelete(id);
        if (!customerProfile) {
            return res.status(404).json({ error: 'Customer profile not found' });
        }

        res.status(200).json({ message: 'Customer profile deleted successfully', customerProfile: { id: customerProfile._id, fullName: customerProfile.fullName } });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error: ' + err.message });
    }
}

export default {
    getME,
    deleteCustomerProfileById,
    getAllCustomerProfiles,
    getCustomerProfileById
}