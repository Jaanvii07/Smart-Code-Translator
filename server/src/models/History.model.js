import mongoose from 'mongoose';

const historySchema = new mongoose.Schema(
    {
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
             required: [true, "User ID is required"],
            index: true
        },
        type:{
            type: String,
            enum: {
                values: ["translate", "analyze", "optimize", "explain"],
                message:"{VALUE} is not a valid type. Must be one of: translate, analyze, optimize, explain"
            },
            required: [true, "Type is required"]
        },
        inputCode:{
            type: String,
            required: [true, "Input code is required"]
        },
        sourceCode:{
            type:String,
            default: ""
        },
        targetCode:{
            type:String,
            default: "",
        },
         output:{
            type:mongoose.Schema.Types.Mixed,
            default: null
        },
    },
    {
    timestamps: true,
  },
);

const History = mongoose.model('History', historySchema);
export default History;