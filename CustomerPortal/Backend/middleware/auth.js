import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET;

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    //Correctly handle the case where authHeader is missing or not in "Bearer <token>" format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({error: 'No token provided'})
    }

    const token = authHeader.split(' ')[1];  // Get the token part after "Bearer "

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.customerProfile = decoded;  // Attach the decoded user info to the request
        next();  // Continue to the next middleware
    } catch (err) {
        return res.status(401).json({error: 'Invalid or expired token'});  
    }
}

export default auth;
