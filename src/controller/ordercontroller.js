const userModel = require("../models/usermodel");
const cartModel = require("../models/cartmodel");
const orderModel = require("../models/ordermodel");
const { isValidObjectId } = require("../validator/validation");

//....................................................................... POST API ..........................................................

const createOrder = async (req, res) => {
  try {
    let data = req.body;
    let {status}=data
    let UserId = req.params.userId;

    if (!data.cartId) return res.status(400).send({ staus: false, message: "Please Provide CartId" });
    if (!UserId) return res.status(400).send({ staus: false, message: "Please Provide UserId" });
    
    if (!isValidObjectId(data.cartId)) return res.status(400).send({ status: false, message: "CartID is not valid" });
    if (!isValidObjectId(UserId)) return res.status(400).send({ status: false, message: "userID is not valid" });
    
    const checkUser = await userModel.findOne({ _id: UserId });
    if (!checkUser) return res.satus(404).send({ status: false, msg: "User doesn't esxist" });
      
    let cartDetail = await cartModel.findOne({ _id: data.cartId });
    if (!cartDetail) return res.status(404).send({ status: false, message: "Cart does not exist" });
    
    if (cartDetail.userId != UserId) return res.status(400).send({ status: false, message: "user not found" });
    
    let obj = {};
    obj.userId = UserId;
    obj.items = cartDetail.items;

    obj.totalPrice = cartDetail.totalPrice;
    obj.totalItems = cartDetail.totalItems;
    

    var totalQuantity = 0;
    for (let product of cartDetail.items) {
      totalQuantity += product.quantity;
    }

    obj.totalQuantity = totalQuantity;
    obj.status=status

    let createdata = await orderModel.create(obj);
    return res.status(201).send({ status: true, data: createdata });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

//....................................................................... UPDATE API ..........................................................

const updateOrder = async function (req, res) {
    try {
  
      let data = req.body;
      let { status, orderId } = data;
  
      if (!isValidObjectId(orderId))return res.status(400).send({ status: false, message: "Invalid orderId" });
  
      let orderDetails = await orderModel.findOne({_id: orderId,isDeleted: false,});
  
      if (!["pending", "completed", "cancelled"].includes(status)) {
        return res.status(400).send({status: false,message: "status should be from [pending, completed, cancelled]"});
      }
  
      if (orderDetails.status === "completed") {
      return res.status(400).send({status: false,message: "Order completed, now its status can not be updated",});
      }
  
      if (orderDetails.cancellable === false && status == "cancelled") {
        return res.status(400).send({ status: false, message: "Order is not cancellable" });
      } else {
        if (status === "pending") {
        return res.status(400).send({ status: false, message: "order status is already pending" });
        }
  
        let orderStatus = await orderModel.findOneAndUpdate(
          { _id: orderId },
          { $set: { status: status } },
          { new: true }
        );
        return res.status(200).send({status: true,message: "Success",data: orderStatus,});
      }
    } catch (error) {
      res.status(500).send({ status: false, error: error.message });
    }
  };
  

module.exports.createOrder=createOrder
module.exports.updateOrder=updateOrder