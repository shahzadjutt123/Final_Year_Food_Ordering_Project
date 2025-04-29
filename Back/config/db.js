import mongoose from "mongoose";



export const connectDB= async()=>{
    await mongoose.connect('mongodb+srv://mernstack:osmanbay@cluster0.hvhkf.mongodb.net/food-del').then(()=>console.log("DB Connected"));
}


