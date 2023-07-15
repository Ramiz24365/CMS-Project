const Reg = require('../models/reg')
const bcrypt = require('bcrypt') /* <--module for password encrypted for security of password*/
const nodemailer = require('nodemailer')

exports.loginpage = (req, res) => {
    res.render('login.ejs', { massage: "" })
}

exports.signuppage = (req, res) => {
    res.render('signup.ejs', { massage: "" })
}
exports.registration = async (req, res) => {
    const { user, pass } = req.body
    try {
        const convertpass = await bcrypt.hash(pass, 10)  /* <---convert pass into encrypted code */
        const usercheck = await Reg.findOne({ email: user })  /* <--check the mail into database */
        if (usercheck == null) {
            //console.log(convertpass)
            const record = new Reg({ email: user, password: convertpass })  /* <---insert into table */
            record.save()
            let testAccount = await nodemailer.createTestAccount();

            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: "r48483240@gmail.com", // generated ethereal user
                    pass: "aoywolfibddppcmk", // generated ethereal password
                },
            });
            console.log('connected to smtp gmail server')
            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: "r48483240@gmail.com", // sender address
                to: user, // list of receivers
                subject: "Email verification-cmsproject", // Subject line
                text: "click on below link to verify your account", // plain text body
                html: `<a href=http://localhost:5000/emailactivelink/${user}>click here to verify your account</a>`, // html body
            });
            console.log('Email is sent')
            res.render('signup.ejs', { massage: "Your account has been created successfully." })
        }
        else {
            res.render('signup.ejs', { massage: "Your Email is Already registered" })
        }
    }
    catch (error) {
        console.log(error)
    }
}

exports.logincheck = async (req, res) => {
    const { user, pass } = req.body
    const record = await Reg.findOne({ email: user })
    //console.log(record)
    if (record !== null) {
        const passwordcheck = await bcrypt.compare(pass, record.password)
        if (passwordcheck) {
            req.session.isAuth = true  /* <---trigger for create session details are correct */
            req.session.loginname = user  /* <---store user login email into variable */
            req.session.role=record.role
            if (record.email == "admin@gmail.com" || record.email == "admin1@gmail.com") {
                res.redirect('/admin/dashboard')
            }
            else if (record.status == 'unverified') {
                res.render('login.ejs', { massage: "your email is not verified..please check your email to verify your account" })
            }
            else {
                res.redirect('/userprofiles')
            }
        }
        else {
            res.render('login.ejs', { massage: "Wrong credentials" })
        }
    }
    else {
        res.render('login.ejs', { massage: "Wrong credentials" })
    }
}

exports.forgotform = (req, res) => {
    res.render('forgotform.ejs', { massage: '' })
}
exports.sendlink = async (req, res) => {
    const { user } = req.body
    const record = await Reg.findOne({ email: user })
    //console.log(record)
    if (record == null) {
        res.render('forgotform.ejs', { massage: "Email is not registered with us" })
    }
    else {
        let testAccount = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: "r48483240@gmail.com", // generated ethereal user
                pass: "aoywolfibddppcmk", // generated ethereal password
            },
        });
        console.log('connected to smtp gmail server')

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: "r48483240@gmail.com", // sender address
            to: user, // list of receivers
            subject: "forgot password link-cms-project", // Subject line
            text: "click on below link to change your password", // plain text body
            html: `<a href=http://localhost:5000/forgotpasswordchangeform/${email}>click to open google</a>`, // html body
        });
        console.log('Email is sent')
        res.render("forgotform.ejs", { massage: "Link has been sent plaese check your email" })

    }
}

exports.forgotpasswordchangeform = (req, res) => {
    //console.log(req.params.email)
    const email = req.params.email
    res.render("/forgotpasswordchangeform.ejs", { email })
}

exports.changepassword = async (req, res) => {
    //console.log(req.params.email)
    const email = req.params.email
    const record = await Reg.findOne({ email: email })
    //console.log(record)
    const id = record.id   /* <--get the id on the basis of email */
    const { pass } = req.body
    const newPass = await bcrypt.hash(pass, 10)  /* <---converted new pass into encrypted code */
    await Reg.findByIdAndUpdate(id, { password: newPass })
    res.render('forgotpasswordmassage.ejs')
}

exports.admindashboard =async (req, res) => {
    const loginname = (req.session.loginname)  /* <---store name of user who is login to show on dashboard page */
    const verfiedCount=await Reg.count({status:'verified'}) /* <--count verified user for dashboard */
    const unverifiedCount=await Reg.count({status:'unverified'}) /* <--count unverified user for dashboard */
    const totalCount=await Reg.count()  /* <--count total user for dashboard */
    res.render('admin/dashboard.ejs', { loginname,verfiedCount,unverifiedCount,totalCount})
}

exports.logout = (req, res) => {
    req.session.destroy()
    res.redirect('/')
}

exports.allusers = async (req, res) => {
    const loginname = (req.session.loginname)
    const record = await Reg.find()  /* <---get all data from reg table */
    const verfiedCount=await Reg.count({status:'verified'}) /* <--count verified user for dashboard */
    const unverifiedCount=await Reg.count({status:'unverified'}) /* <--count unverified user for dashboard */
    const totalCount=await Reg.count()  /* <--count total user for dashboard */
    res.render('admin/users.ejs', {loginname,record,verfiedCount,unverifiedCount,totalCount })
}

exports.userdelete = async (req, res) => {
    //console.log(req.params.id)
    const id = req.params.id
    await Reg.findByIdAndDelete(id)
    res.redirect('/admin/users')
}

/* start<--for verify users/email */
exports.activelink = async (req, res) => {
    //console.log(req.params.email)
    const user = (req.params.email)
    const record = await Reg.findOne({ email: user })
    //console.log(record)
    const id = record.id
    await Reg.findByIdAndUpdate(id,{ status: 'verified' })
    res.render('activelinkmassage.ejs', { massage: 'your account has been Active' })
}
/* end<--for verify users/email */

exports.usersprofiles = async(req, res) => {
    const loginname = req.session.loginname
    const record=await Reg.find({img:{$nin:['defaultimg.png']}})
    res.render('usersprofiles.ejs', { loginname,record })
}
exports.userupdateform=async(req,res)=>{
    const loginname = req.session.loginname
    const record=await Reg.findOne({email:loginname})
    //console.log(record)
    res.render('profileupdateform.ejs',{loginname,record,massage:""})
}

exports.userprofileupdate=async(req,res)=>{
    //console.log(req.body)
    //console.log(req.file)
    const{fname,lname,mob,des}=req.body
    const loginname = req.session.loginname
   const record= await Reg.findOne({email:loginname})
   //console.log(record)
   const id=record.id
   if(req.file){
    const filename=req.file.filename
    await Reg.findByIdAndUpdate(id,{firstName:fname,lastName:lname,mobile:mob,des:des,img:filename})
   }
   else{
    await Reg.findByIdAndUpdate(id,{firstName:fname,lastName:lname,mobile:mob,des:des})
   }
   res.redirect('/profileupdate')
}

exports.singledetails=async(req,res)=>{
    const id=req.params.id
    const loginname = req.session.loginname
    const record=await Reg.findById(id)
    res.render('singleprofile.ejs',{loginname,record})
}
exports.roleupdate=async(req,res)=>{
    //console.log(req.params.id)
    const id=req.params.id
    const record=await Reg.findById(id)
    let currentrole=null
    if(record.role=='suscribed'){
        currentrole='public'
    }
    else{
        currentrole="suscribed"
    }
    await Reg.findByIdAndUpdate(id,{role:currentrole})
    res.redirect('/admin/users')
}