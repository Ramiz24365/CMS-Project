const router=require('express').Router()
const regc=require('../controllers/regcontroller')
const multer=require('multer')

/* start<---setup for multer */
let storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./public/profileimage')
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+file.originalname)
    }
})

let upload=multer({
    storage:storage,
    limits:{fileSize:1024*1024*4}
})
/* end<---setup for multer */
/*start <--middleware function for user could not directly access page without login */
function handlelogin(req,res,next){
    if(req.session.isAuth){
        next()
    }
    else{
        res.redirect("/")
    }
}
/*end <--middleware function for user could not directly access page without login */

/* start<--middlware function for if user do not have subscribe then he dont see the other contact details */
function handlerole(req,res,next){
    if(req.session.role=='suscribed'){
        next()
    }
    else{
        res.send('you dont suscribed us to see the details..please suscribe us')
    }
}
/* end<--middlware function for if user do not have subscribe then he dont see the other contact details */


router.get('/',regc.loginpage)

router.get('/signup',regc.signuppage)
router.post('/signup',regc.registration)

router.post('/',regc.logincheck)

router.get('/forgotform',regc.forgotform)
router.post('/forgotform',regc.sendlink)
router.get('/forgotpasswordchangeform/:email',regc.forgotpasswordchangeform)
router.post('/forgotpasswordchangeform/:email',regc.changepassword)
router.get('/logout',regc.logout)
router.get('/emailactivelink/:email',regc.activelink)
router.get('/userprofiles',handlelogin,regc.usersprofiles)
router.get('/profileupdate',regc.userupdateform)
router.post('/profileupdate',upload.single('img'),regc.userprofileupdate)
router.get('/singleprofile/:id',handlerole,regc.singledetails)

module.exports=router