import {verifyToken} from "../utils/jwt.utils.js";
import User from "../models/User.model.js";

const authenticate = async (req, res, next) => {
    try{
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            const error = new Error("Authorization header missing or malformed.");
            error.statusCode = 401;
            throw error;
        }

        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id);
        if(!user){
            const error = new Error("User not found.");
            error.statusCode = 404;
            throw error;
        }

        req.user = user;
        next();
    }
    catch (error) {
        return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please log in again.",
        });
  }
}

export default authenticate;