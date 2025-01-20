const { Order } = require('../models/order')
const express = require('express')
const router = express.Router()
const { User } = require('../models/user')
const { Product } = require('../models/product')
const { OrderItem } = require('../models/order-item')

router.get('/', async (req, res) => {
    const orderList = await Order.find()
        .populate('user', 'name')
        .sort({ dateOrdered: -1 })

    if (!orderList) {
        res.status(500).json({ success: false })
    }

    res.send(orderList)
})
router.get('/:id', async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name')
        .populate({
            path: 'orderItems',
            populate: {
                path: 'product',
                populate: 'category',
            },
        })

    if (!order) {
        res.status(500).json({ success: false })
    }

    res.send(order)
})



router.post('/', async (req, res) => {
    const orderItemsIds = Promise.all(
        req.body.orderItems.map(async (orderItem) => {
            let newOrderItem = new OrderItem({
                quantity: orderItem.quantity,
                product: orderItem.product,
            })

            newOrderItem = await newOrderItem.save()

            return newOrderItem._id
        })
    )

    const orderItemsIdsResolved = await orderItemsIds
    const totalPrices =await Promise.all(orderItemsIdsResolved.map(async (orderItemId) =>{
        const orderItemm = await OrderItem.findById(orderItemId).populate("product")
        const totalPrice = orderItemm.product.price * orderItemm.quantity
        return totalPrice
    }))
    console.log(orderItemsIdsResolved)
    console.log(totalPrices)
    const totalPrice = totalPrices.reduce((a , b) => a+b , 0);

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2 || '', 
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status || 'Pending',
        totalPrice: totalPrice,
        user: req.body.user,
        dateOrdered: req.body.dateOrdered || Date.now(),
    })

    order = await order.save()

    if (!order) {
        return res.status(401).send('Order is not created')
    }

    return res.status(200).send(order)
})


router.put('/:id', async (req, res) => {
    const order = await Order.findByIdAndUpdate(req.params.id,
        {
            status:req.body.status
        },
        {new:true}
    )
    

    if (!order) {
        res.status(500).json({ success: false })
    }

    res.send(order)
})

router.delete('/:id', async (req, res) => {
    Order.findByIdAndDelete(req.params.id).then(async order =>{
        if (order) {
            await order.orderItems.map(async orderItem =>{
                await OrderItem.findByIdAndDelete(orderItem)
            })
            return res.status(200).json({success:true})
        }else{
            return res.status(400).json({success:false})
        }
    })
})


router.get("/get/totalSales" , async(req , res)=>{
    const totalSales = await Order.aggregate([
        {$group : {_id : null , totalSales : {$sum: "$totalPrice"}}}
    ])
    if (!totalSales){
        return res.status(401).send("The order sales cannot generated")
    }
    return res.send({totalSales: totalSales.pop().totalSales})
})
router.get("/get/OrderCount" , async(req , res)=>{
    const orderCount = await Order.countDocuments()
    if (!orderCount){
        return res.status(401).send("The order sales cannot generated")
    }
    return res.send({OrderCount:orderCount})
})

router.get("/get/userOrders/:userid" , async(req , res) =>{
    const orders = await Order.find({user:req.params.userid}).populate({
        path: "orderItems" , populate:{
            path:"product" , populate:"category"
        }
    })

    if (!orders){
        return res.status(400).send({success:fail})
    }
    return res.send(orders)
})

module.exports = router
