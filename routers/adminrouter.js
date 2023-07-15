const router=require('express').Router()
const regc=require('../controllers/regcontroller')


router.get('/dashboard',regc.admindashboard)
router.get('/users',regc.allusers)
router.get("/userdelete/:id",regc.userdelete)
router.get('/roleupdate/:id',regc.roleupdate)

module.exports=router