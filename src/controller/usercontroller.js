const { isValidName, forName, isValidEmail, isValidNumber, isValidPassword, isValidObjectId, isValidPincode }= require('../validator/validation.js')
const userModel= require('../models/usermodel.js')
const bcrypt= require('bcrypt')
const jwt= require('jsonwebtoken')
const aws= require("aws-sdk")

aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region: "ap-south-1"
  })
  
  let uploadFile= async ( file) =>{
   return new Promise( function(resolve, reject) {
    
    let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws
  
    var uploadParams= {
        ACL: "public-read",
        Bucket: "classroom-training-bucket",
        Key: "abc/" + file.originalname, 
        Body: file.buffer
    }
  
  
    s3.upload( uploadParams, function (err, data ){
        if(err) {
            return reject({"error": err})
        }
        console.log(data)
        console.log("file uploaded succesfully")
        return resolve(data.Location)
    })
})
  }


// ........................................................................... POST API .......................................................................

const registerUser = async function(req, res){
    try{
        let files= req.files
        if(files && files.length>0){
            let uploadedFileURL= await uploadFile( files[0] )
      
            req.body.profileImage=uploadedFileURL.toString()
        }
        else{
            res.status(400).send({ msg: "No file found" })
        }

        // checking requirements
        if(Object.keys(req.body).length==0){return res.status(400).send({status:false, message:"body is important"})}
        if(!req.body.fname){ return res.status(400).send({status:false, message:"fname is mandatory"})}
        if(!req.body.lname){return res.status(400).send({status:false, message:"lname is mandatory"})}
        if(!req.body.email){return res.status(400).send({status:false, message:"email is mandatory"})}
        if(!req.body.phone){return res.status(400).send({status:false, message:"phone is mandatory"})}
        if(!req.body.password){return res.status(400).send({status:false, message:"password is mandatory"})}
        if(!req.body.address){return res.status(400).send({status:false, message:"address is mandatory"})}
        req.body.address=JSON.parse(req.body.address)
        if(!req.body.address.shipping){return res.status(400).send({status:false, message:"shipping key is important"})}
        if(!req.body.address.billing){return res.status(400).send({status:false, message:"billing key is important"})}
        if(!req.body.address.shipping.street){return res.status(400).send({status:false, message:"street is mandatory"})}
        if(!req.body.address.shipping.city){return res.status(400).send({status:false, message:"city is mandatory"})}
        if(!req.body.address.shipping.pincode){return res.status(400).send({status:false, message:"pincode is mandatory"})}
        if(!req.body.address.billing.street){return res.status(400).send({status:false, message:"street is mandatory"})}
        if(!req.body.address.billing.city){return res.status(400).send({status:false, message:"city is mandatory"})}
        if(!req.body.address.billing.pincode){return res.status(400).send({status:false, message:"pincode is mandatory"})}  
    
    // validation starts
    if(!forName(req.body.fname) || !isValidName(req.body.fname)){return res.status(400).send({status:false, message:"fname is not valid, first letter should be in capital case."})}
    if(!forName(req.body.lname ||  !isValidName(req.body.lname))){return res.status(400).send({status:false, message:"lname is not valid, first letter should be in capital case."})}
    if(!isValidEmail(req.body.email)){return res.status(400).send({status:false, message:"email is not valid"})}
    if(!isValidNumber(req.body.phone)){return res.status(400).send({status:false, message:"phone no. is not valid"})}
    if( !isValidPassword(req.body.password)){return res.status(400).send({status:false, message:"password is not valid"})}
    if(!isValidName(req.body.address.shipping.street)){return res.status(400).send({status:false, message:"street is not valid"})}
    if(!isValidName(req.body.address.shipping.city)){return res.status(400).send({status:false, message:"city is not valid"})}
    if(!isValidPincode(req.body.address.shipping.pincode)){return res.status(400).send({status:false, message:"pincode is not valid"})}
    req.body.address.shipping.pincode=Number(req.body.address.shipping.pincode)
    if(!isValidName(req.body.address.billing.street)){return res.status(400).send({status:false, message:"street is not valid"})}
    if(!isValidName(req.body.address.billing.city)){return res.status(400).send({status:false, message:"city is not valid"})}
    if(!isValidPincode(req.body.address.billing.pincode)){return res.status(400).send({status:false, message:"pincode is not valid"})}
    req.body.address.billing.pincode=Number(req.body.address.billing.pincode)
    //validation ends
    //==========================================================
    
    // checking uniqueness
    if(await userModel.findOne({email:req.body.email})){return res.status(409).send({status:false, message:"this user is already exist with this emailId."})}
    if(await userModel.findOne({phone:req.body.phone})){return res.status(409).send({status:false, message:"this user is already exist with this phone."})}
    // encrypting the password
    req.body.password=await bcrypt.hash(req.body.password,1 )
    //==========================================================
    // storing document
    return res.status(201).send({status:true, message: "User created successfully", data:await userModel.create(req.body)})}
    catch(err){return res.status(500).send({status:false, message:"Internal Server Error"})}}


//............................................................ SIGNIN API ..............................................................................

const userLogIn = async function (req, res) {
    try {
        // validation and requirements
        if (Object.keys(req.body)== 0) {return res.status(400).send({ status: false, message: "email and password are required for Log in" })}
        if (!req.body.email) { return res.status(400).send({ status: false, message: "email is mandatory" }) }
        if (!req.body.password) { return res.status(400).send({ status: false, message: "password is mandatory" }) }
        if (req.body.email.length == 0 || req.body.password.length == 0) {return res.status(400).send({ status: false, message: "both fields are required." })}
        if (!isValidEmail(req.body.email)) {return res.status(400).send({ status: false, message: "email is not valid" })}
        if(!isValidPassword(req.body.password)){return res.status(400).send({status:false, message:"password is not valid."})}

        // user is not registered
        const userDetail = await userModel.findOne({ email:req.body.email})
        if(!userDetail){return res.status(404).send({ status: false, message: "User not found with this EmailId." })}

        const matchedpassword =await bcrypt.compare(req.body.password,userDetail.password)
        if (!matchedpassword) {return res.status(404).send({ status: false, message: "Password is not valid." })}
        
        // creating Token by Jwt.sign Function
        return res.status(200).send({ status: true, message: "user loggedin successfully", data:{userId:userDetail._id, token :jwt.sign({id: userDetail._id.toString(),}, "project/productManagementGroup8", { expiresIn: '24h'})}})}
        catch (error) { return res.status(500).send({ status: false, message: error.message })}}


//............................................................ GET API ..............................................................................

    const getUserParam =async function(req,res){
        try{
            const userId = req.params.userId
    
            const user = await userModel.findById(userId)
            if(!user){
                return res.status(404).send({status:false, message:"this user is not registered with us"})
            }
            let {fname,lname,email,profileImage,phone,password,address,_id} = user
            let data ={}
            data.address = address
            data._id = _id
            data.fname = fname
            data.lname = lname
            data.email = email
            data.profileImage = profileImage
            data.phone = phone
            data.password = password
    
            return res.status(200).send({status:true,message: "User profile details",data:data})
    
        }catch(err){return res.status(500).send({ status: false, message: err.message })}}

// ........................................................................... PUT API .......................................................................

const updateUser = async function (req, res) {
    try {
      const data = req.body;
      const userId = req.params.userId;
      const files = req.files;
      const update = {};
  
      const { fname, lname, email, phone, password, address } = data;
  
      if (!isValidBody(data) && !files) {
        return res.status(400).send({
          status: false,
          message: "Please provide data in the request body!",
        });
      }
  
                 if (fname) {
        if (!isValid(fname) || !isValidName(fname)) {
          return res
            .status(400)
            .send({ status: false, message: "fname is invalid" });
        }
  
        update["fname"] = fname;
      }
  
      if (lname) {
        if (!isValid(lname) || !isValidName(lname)) {
          return res
            .status(400)
            .send({ status: false, message: "lname is invalid" });
        }
        update["lname"] = lname;
      }
  
      if (email) {
        if (!isValidEmail(email)) {
          return res
            .status(400)
            .send({ status: false, message: "Email is invalid!" });
        }
  
        let userEmail = await userModel.findOne({ email: email });
        if (userEmail) {
          return res.status(409).send({
            status: false,
            message:
              "This email address already exists, please enter a unique email address!",
          });
        }
        update["email"] = email;
      }
  
      if (phone) {
        if (!isValidPhone(phone)) {
          return res
            .status(400)
            .send({ status: false, message: "Phone is invalid" });
        }
  
        let userNumber = await userModel.findOne({ phone: phone });
        if (userNumber)
          return res.status(409).send({
            status: false,
            message:
              "This phone number already exists, please enter a unique phone number!",
          });
        update["phone"] = phone;
      }
  
      if (password) {
        if (isValidPwd(password)) {
          return res.status(400).send({
            status: false,
            message:
              "Password should be strong, please use one number, one upper case, one lower case and one special character and characters should be between 8 to 15 only!",
          });
        }
  
        update.password = await bcrypt.hash(password, 10);
      }
  
      if (address) {
        const { shipping, billing } = address;
  
        if (shipping) {
          const { street, city, pincode } = shipping;
  
          if (street) {
            if (isValid(address.shipping.street)) {
              return res
                .status(400)
                .send({ status: false, message: "Invalid shipping street!" });
            }
            update["address.shipping.street"] = street;
          }
  
          if (city) {
            if (isValid(address.shipping.city)) {
              return res
                .status(400)
                .send({ status: false, message: "Invalid shipping city!" });
            }
            update["address.shipping.city"] = city;
          }
  
          if (pincode) {
            if (!isValidPincode(address.shipping.pincode)) {
              return res
                .status(400)
                .send({ status: false, message: "Invalid shipping pincode!" });
            }
            update["address.shipping.pincode"] = pincode;
          }
        }
  
        if (billing) {
          const { street, city, pincode } = billing;
  
          if (street) {
            if (isValid(address.billing.street)) {
              return res
                .status(400)
                .send({ status: false, message: "Invalid billing street!" });
            }
            update["address.billing.street"] = street;
          }
  
          if (city) {
            if (isValid(address.billing.city)) {
              return res
                .status(400)
                .send({ status: false, message: "Invalid billing city!" });
            }
            update["address.billing.city"] = city;
          }
  
          if (pincode) {
            if (!isValidPincode(address.billing.pincode)) {
              return res
                .status(400)
                .send({ status: false, message: "Invalid billing pincode!" });
            }
            update["address.billing.pincode"] = pincode;
          }
        }
      }
  
      if (files && files.length > 0) {
        let uploadedFileURL = await uploadFile(files[0]);
        update["profileImage"] = uploadedFileURL;
      } else if (Object.keys(data).includes("profileImage")) {
        return res
          .status(400)
          .send({ status: false, message: "please put the profileimage" });
      }
  
      const updateUser = await userModel.findOneAndUpdate(
        { _id: userId },
        update,
        { new: true }
      );
      return res.status(200).send({
        status: true,
        message: "user profile successfully updated",
        data: updateUser,
      });
    } catch (error) {
      res.status(500).send({ status: false, message: error.message });
    }
  };
    


module.exports.getUserParam= getUserParam
module.exports.registerUser= registerUser
module.exports.userLogIn=userLogIn
module.exports.updateUser=updateUser



















