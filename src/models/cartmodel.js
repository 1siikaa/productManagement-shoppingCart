const mongoose = require("mongoose")

const cartSchema = new mongoose.Schema({
    
        userId: { type : mongoose.Schema.Types.ObjectId, ref:"user", required:true, unique:true},
        items: [{
          productId: { type: mongoose.Schema.Types.ObjectId, ref:"product", required:true, trim:true},
          quantity: {type:Number, required:true} ,
          _id:false,    // min 1
        }],
        totalPrice: { type:Number, required:true},   //comment: "Holds total price of all the items in the cart"
        totalItems: {type:Number, required:true},},  // comment: "Holds total number of items in the cart"},
        {timestamps:true})

        
        module.exports = mongoose.model("Cart", cartSchema)
      

