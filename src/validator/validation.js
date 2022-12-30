
//-------------------------------------------  NAME  VALIDATION  ----------------------------------------------------
  
  const forName = function (value) {
    return /^[a-z ,.'-]+$/i.test(value);
  };

  let mongoose = require("mongoose")
  //=============================Vlidator for Vlue(undefined,null and after trim lenth is zero)============================//
  
  const isValidName = function (value) {
    if (typeof value === undefined || typeof value === null || value === "" ) {
      return false;
    }
    if (( typeof value === "string" && value.trim().length > 0)) {
      return true;
    }
    
  }

  //===========================Vlidation for Email by using Regex=========================//
  
  
  const isValidEmail = function (value) {
    let emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (emailRegex.test(value)) return true
  }
  
  //===========================Vlidation for Phone Number by using Regex=========================//
  
  const isValidNumber = function (value) {
    let phnNum = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/
    if ((value === "" && value === null && value === "undefined")) return false
    if (phnNum.test(value)) return true
  }
  
  //===========================Vlidation for Passward by using Regex=========================//
  
  const isValidPassword = function (value) {
    let password = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$^+=!*()@%&]).{8,15}$/
    if (password.test(value)) return true
  
  }
  
  //===========================Vlidation for mongoose/mongoDb Oject Id by using Regex=========================//
  
  const isValidObjectId = function (objectId) {

    var valid = mongoose.Types.ObjectId.isValid(objectId)
    if(!valid){ return false }
    else{return true}
  }
  
  //............................................................ pincode ........................................................
  
  const isValidPincode = function (pincode) {
    return /^[1-9][0-9]{5}$/.test(pincode);
  }
  
   
  
  //===================================Export All validotor=================================//
  
  module.exports = { isValidName, forName, isValidEmail, isValidNumber, isValidPassword, isValidObjectId, isValidPincode }

