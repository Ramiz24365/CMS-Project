const express=require('express')  /* <---function */
const app=express() /* <--module */
require('dotenv').config()  /* <--callign .env file */
app.use(express.urlencoded({extended:false}))
const userRouter=require('./routers/userrouter')
const adminRouter=require('./routers/adminrouter')
const mongoose=require('mongoose')  /* <---module */
const session=require('express-session')  /* <---module */
mongoose.connect(`${process.env.DB_URL}/${process.env.DB_NAME}`)


app.use(session({
    secret:process.env.SECRET_KEY,
    resave:false,
    saveUninitialized:false
}))
app.use('/admin',adminRouter)
app.use(userRouter)
app.use(express.static('public'))
app.set('view engine','ejs')
app.listen(process.env.PORT,()=>{console.log(` Ramiz server is running on port ${process.env.PORT}`)})