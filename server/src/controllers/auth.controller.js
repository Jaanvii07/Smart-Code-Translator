import * as authService from "../services/auth.service.js";

export const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if(!name || !email || !password){
            const error = new Error("Name, email, and password are required.");
            error.statusCode = 400;
            throw error;
        }
        if(password.length < 6){
            const error = new Error("Password must be at least 6 characters long.");
            error.statusCode = 400;
            throw error;
        }

        const result = await authService.registerUser(name, email, password);
        return res.status(201).json({success: true, ...result});
    }
    catch (error) {
        if (error.statusCode)
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
       
        next(error);
    }
};

export const loginUser = async(req,res,next)=>{
    const {email,password}=req.body;
    try{
        if(!email || !password){
            const error = new Error("Email and password are required.");
            error.statusCode = 400;
            throw error;
        }

        const result=await authService.emailLogin(email,password);
        return res.status(200).json({success:true,...result});
    }
    catch(error){   
        if(error.statusCode)
            return res
                .status(error.statusCode)
                .json({ success: false, message: error.message });
        next(error);
    }
};

export const googleAuth = async (req, res, next) => {
    try{
        const { credential } = req.body;
        if(!credential){
            const error = new Error("Google credential is required.");
            error.statusCode = 400;
            throw error;
        }

        const result = await authService.googleLogin(credential);
        return res.status(200).json({success: true, ...result});
    }
    catch (error) {
        if (error.statusCode)
            return res
                .status(error.statusCode)
                .json({ success: false, message: error.message });
        next(error);
    }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserProfile(req.user._id);
    return res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      data: { message: "Logged out successfully" },
    });
  } catch (error) {
    next(error);
  }
};