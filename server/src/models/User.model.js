import mongoose from 'mongoose';

const UserSchema=new mongoose.Schema({
    googleId:{
        type:String,
        unique:true,
        sparse: true
    },
    email:{
        type:String,
        required:[true, 'Email is required'],
        unique:true,
        lowercase:true,
        trim:true
    },
    name:{
        type:String,
        required:[true, 'Name is required'],
        trim:true
    },
    password:{
        type:String,
        required:[true, 'Password is required'],
        trim:true
    },
    picture:{
        type:String,
        default:""
    },
    lastLogin:{
        type:Date,
        default:Date.now
    },
   },
   {
    timestamps:true
   }
)
const User=mongoose.model('User', UserSchema);
export default User;