const express = require('express');
const router = express.Router();
const usercontroller= require('../controller/usercontroller')
const productcontroller= require('../controller/productcontroller')
const cartcontroller= require('../controller/cartcontroller')
const ordercontroller = require('../controller/ordercontroller')
const {authentication, authorization}=require('../middleware/auth.js')

// .................................................. Users Api ....................................................................
 router.post('/register', usercontroller.registerUser)
 router.post('/login', usercontroller.userLogIn)
 router.get('/user/:userId/profile', authentication, authorization, usercontroller.getUserParam)
 router.put('/user/:userId/profile', authentication, authorization, usercontroller.updateUser)

// .................................................. Products Api ....................................................................
router.post('/products', productcontroller.createProduct)
router.get('/products', productcontroller.getAllProducts)
router.get('/products/:productId', productcontroller.getDetailsFromParam)
router.put('/products/:productId', productcontroller.updateProduct)
router.delete('/products/:productId', productcontroller.deleteById)

// .................................................. Carts Api ....................................................................
router.post('/users/:userId/cart',authentication, authorization, cartcontroller.createCart )
router.get('/users/:userId/cart',authentication, authorization, cartcontroller.getCartDetails)
router.put('/users/:userId/cart',authentication, authorization,cartcontroller.updateCart)
router.delete('/users/:userId/cart',authentication, authorization, cartcontroller.deleteCart)

// .................................................. Orders Api ....................................................................
router.post('/users/:userId/orders',authentication, authorization, ordercontroller.createOrder)
router.put('/users/:userId/orderssss',authentication, authorization, ordercontroller.updateOrder)

//===============================router validation(For path is valid or Not)===================================================//


router.all("/*", async function (req, res) {
    return res.status(400).send({ status: false, message: "Bad reqeust / invalid Path" });
  });


module.exports=router;
