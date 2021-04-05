const express =require('express');
const app=express();
const morgan=require('morgan');
const bodyParser=require('body-parser');
const mongoose=require('mongoose');

const productRoutes=require('./api/router/product');
const orderRoutes=require('./api/router/order');
const userRoutes=require("./api/router/user");

mongoose.connect('mongodb://localhost:27017/restapi', { useNewUrlParser: true }); //connection to database

app.use('/uploads',express.static('uploads'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//CORES header for handling error in browser it wont show any affect in postman
app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header(
        "Access-control-Allow-Header",
        "Origin,X-Requsted-Width,Content-Type,Accept,Authorization"
    );
    if(req.method==='OPTIONS'){
        res.header('Access-Control-Allow-Method','PUT,POST,PATCH,DELETE');
        return res.status(200).json({});
    }
    next(); 
});

//Routes which should handle requests
app.use('/products',productRoutes);
app.use('/orders',orderRoutes);
app.use("/user",userRoutes)
app.use((req,res,next)=>{
    const error=new Error('Not found');  //error handling
    error.status=404;
    next(error);
})


app.use((error,req,res,next)=>{          //error handling
    res.status(error.status||500);
    res.json({
        error:{
            message:error.message
        }
    })
})
module.exports=app;