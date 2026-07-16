import History from "../models/History.model.js";

export const createHistoryEntry  = async(data)=>{
        const entry= await History.create(data);
        return entry;
};

export const getUserHistory=async(userId , page=1, limit=10)=>{
    try{
        const skip=(page-1)*limit;
        const [entries , totalEntries]=await Promise.all([
           History.find({userId})
              .sort({createdAt:-1})
              .skip(skip)
              .limit(limit)
              .select("-__v"),

              History.countDocuments({userId})
        ]);

        return{
            entries,
            totalEntries,
            totalPages: Math.ceil(totalEntries/limit),
            currentPage: page
        };
    }
    catch(error){
        console.error("Error fetching user history:", error);
        throw new Error("Failed to fetch user history");
       
    }
};

export const getHistoryEntry = async(entryId , userId)=>{
    try{
        const entry= await History.findOne({
            _id: entryId,
            userId,
        }).select("-__v");

        if(!entry){
            throw new Error("History entry not found");
        }

        return entry;
    }
    catch(error){
        console.error("Error fetching history entry:", error);
        throw new Error("Failed to fetch history entry");
    }
};

export const deleteHistoryEntry = async(entryId , userId)=>{
    try{
        const result=await History.findByIdAndDelete({
            _id: entryId,
            userId,
        });

        if(!result){
            throw new Error("History entry not found or not authorized to delete");
        }
        return result;
    }
    catch(error){
        console.error("Error deleting history entry:", error);
        throw new Error("Failed to delete history entry");
    }
};

export const clearUserHistory = async(userId)=>{
    try{
        const result=await History.deleteMany({userId});    
        return result;
    }
    catch(error){
        console.error("Error clearing user history:", error);
        throw new Error("Failed to clear user history");
    }
};
