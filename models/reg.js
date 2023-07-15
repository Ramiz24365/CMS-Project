const mongoose=require('mongoose')

const regSchema=mongoose.Schema({
    email:String,
    password:String,
    firstName:String,
    lastName:String,
    mobile:String,
    des:String,
    img:{type:String,default:'defaultimg.png'},
    status:{type:String,default:'unverified'},
    role:{type:String,default:'public'}
})

module.exports=mongoose.model("reg",regSchema)