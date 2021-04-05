const express=require('express');
const mongoose=require('mongoose');

const router=express.Router();
const Product=require('../models/product');
const checkAuth=require('../middleware/check-auth'); 

const multer=require('multer'); //for image upload
//for image upload
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploads/');
    },
    filename:function(req,file,cb){
        cb(null, Date.now() + file.originalname);
    }
}); 

const fileFilter=(req,file,cb)=>{
        if(file.mimetype==='image/jpeg'||file.mimetype==='image/png')
        {
            cb(null,true);
        }
        else{
            cb(null,false);
        }
};

const upload = multer({
    storage:storage,
    limits:{ //note:limit is optional for filesize
    fileSize:1024*1024*5
    },
    fileFilter: fileFilter
}); //for image upload

router.get('/',(req,res,next)=>{
    // res.status(200).json({
    //     message:'handling GET requests to /products' general message
    // });

    Product.find()
    .select("_id name price productImage")
    .exec()
    .then(docs=>{
        const response={
            count:docs.length,
            products:docs.map(doc=>{
                return{
                    name:doc.name,
                    price:doc.price,
                    productImage:doc.productImage,
                    _id:doc._id,
                    request:{
                        type:"GET",
                        url:"http://localhost:3000/products/"+doc._id
                    }
                }
            })
        };
        // if(docs.lenght>=0){
            res.status(200).json(response);
        // }
        // else{
        //     res.status(404).json(|{
        //         message:'No entries found'   if u want u can use
        //     })
        // }
        res.status(200).json(docs);
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        })
    })
})





router.post('/',checkAuth,upload.single('productImage'),(req,res,next)=>{    //checkauth for route protection
    // const product={             //body-parser to input data in json format
    //     name:req.body.name,
    //     price:req.body.price
    // };
    console.log(req.file);
    const product=new Product({            //saving data to database
        _id:new mongoose.Types.ObjectId(),
        name:req.body.name,
        price:req.body.price,
        productImage:req.file.path
    });
    product.save()                       
            .then(result=>{
                console.log(result);
                res.status(200).json({
                    message:'created products successfully',
                    createdProduct:product             //outputting the data (same in order page)
                });
            })
            .catch(err=>{
                console.log(err);
                res.status(500).json({
                    error:err
                });                
            }
                
            )
    // res.status(200).json({                  for proper response without waiting for error or response it has been shifted
    //     message:'handling POST requests to /products',
    //     createdProduct:product             //outputting the data (same in order page)
    // });
})





router.get('/:id',(req,res,next)=>{
    const id=req.params.id;
    // if(id=='special'){
    //     res.status(200).json({
    //         message:'you discovered the special id',
    //         id:id
    //     });
    // }
    // else{
    //     res.status(200).json({
    //         message:'you passed an id'
    //     });
    // }
    Product.findById(id)
        .exec()
        .then(doc=>{
            console.log(doc); 
            if(doc){
                res.status(200).json(doc); //if doc exist then show
            }
            else{
                res.status(404).json({message:'No valid entry found for provided Id'});
            }
                 
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json({error:err});
        });
});




router.patch('/:id',checkAuth,(req,res,next)=>{
    // res.status(200).json({
    //     message:'product is updated'
    // });
    const id=req.params.id;
    const updateOps={};
    for(const ops of req.body){
        updateOps[ops.propName]=ops.value;
    }
    Product.update({_id:id},{$set:updateOps})
    .exec()
    .then(result=>{
        console.log(result)
        res.status(200).json(result);
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        })
    });

})



router.delete('/:id',checkAuth,(req,res,next)=>{
    // res.status(200).json({
    //     message:'product is deleted'
    // });
    const id=req.params.id;
    Product.remove({_id:id})
    .exec()
    .then(result=>{
        res.status(200).json({
            message:'product deleted',
            request:{
                type:'POST',
                url:'http://localhost:3000/products',
                data:{name:'String',price:'Number'}
            }
        });
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        })
    });

})


module.exports=router;