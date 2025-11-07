import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

const employeeAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({error: 'No token provided'});
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.employeeProfile = decoded;
        next();
    } catch (err) {
        return res.status(401).json({error: 'Invalid or expired token'});  
    }
}

// Middleware to check if employee has admin or manager role
const requireAdminOrManager = (req, res, next) => {
    if (!req.employeeProfile) {
        return res.status(401).json({error: 'Authentication required'});
    }

    if (req.employeeProfile.role !== 'admin' && req.employeeProfile.role !== 'manager') {
        return res.status(403).json({error: 'Access denied. Admin or Manager role required.'});
    }

    next();
};

// Middleware to check if employee has admin role
const requireAdmin = (req, res, next) => {
    if (!req.employeeProfile) {
        return res.status(401).json({error: 'Authentication required'});
    }

    if (req.employeeProfile.role !== 'admin') {
        return res.status(403).json({error: 'Access denied. Admin role required.'});
    }

    next();
};

export default employeeAuth;
export { requireAdminOrManager, requireAdmin };