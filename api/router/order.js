const express=require('express');
const mongoose=require('mongoose');
const Order=require('../models/order');
const Product=require('../models/product');
const checkAuth=require('../middleware/check-auth');

const router=express.Router();

router.get('/',checkAuth,(req,res,next)=>{
    // res.status(200).json({
    //     message:'order were fetched'
    // });

    Order.find()
    .populate('product','name') //second parameter is used to display that property only
    .exec()
    .then(docs=>{
        console.log(docs);
        res.status(200).json({
            count:docs.length,
            orders:docs.map(doc=>{
                return{
                    _id:doc._id,
                    product:doc.product,
                    quantity:doc.quantity,
                    request:{
                        type:'GET',
                        url:'http://localhost:3000/orders/'+doc._id
                    }
                }
            })
        });
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        })
    })

});

router.post('/',checkAuth,(req,res,next)=>{
    Product.findById(req.body.productId)
    .then(product=>{
        if(!product){
            return res.status(404).json({
                message:'product not found'
            });
        }
        const order=new Order({
            _id:mongoose.Types.ObjectId(),
            quantity:req.body.quantity,
            product:req.body.productId
        });
        return order.save()
        
        .then(result=>{
            console.log(result);
            res.status(200).json(result);
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json({
                error:err
            });
        })
        // res.status(200).json({                   dummy data
        //     message:'order was created',
        //     orde:order
        // });
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        })
    })
    
});

router.get('/:id',checkAuth,(req,res,next)=>{
    // res.status(200).json({
    //     message:'order details',
    //     orderId:req.params.id
    // });

    Order.findById(req.params.id)
    .exec()
    .then(order=>{
        res.status(200).json({
            order:order,
            request:{
                type:'GET',
                url:'http://localhost:3000/orders'
            }
        })
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        })
    })
});

router.delete('/:id',checkAuth,(req,res,next)=>{
    // res.status(200).json({
    //     message:'order deleted',
    //     orderId:req.params.id
    // });
    Order.remove({_id:req.params.id})
    .exec()
    .then(result=>{
        res.status(200).json({
            message:'order deleted',
            request:{
                type:'POST',
                url:'http://localhost:3000/orders'
            }
        })
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        })
    })
});


module.exports=router;