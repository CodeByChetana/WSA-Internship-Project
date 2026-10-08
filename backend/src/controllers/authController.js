
import jwt from "jsonwebtoken";
import cypto from "node:crypto";
import imagekit from "../utils/ImagekitIO.js";
import { sendMail, forgotPasswordMailGenContent} from "../utils/mail.js";
import { signinToken,createSendToken, defaultAvatarUrl, filterObj } from "../utils/token.js";
import { User } from "../Models/userModel.js";

//signup : create the account

const signup = async(req,res) =>{
    try{
        const newUser =await User.create({
            name: req.body.name,
            email:req.body.email,
            phoneNumber: req.body.phoneNumber,
            password:req.body.password,
            passwordConfirm:req.body.passwordConfirm,
            avatar:{url:req.body.avatar || defaultAvatarUrl(req.body.name)}
        });
        createSendToken(newUser,201,res);
    }catch(error){
        //const duplicateField = Object.keys(error.keyPattern ||{})[0];
        //const message =duplicateField ? `An account with that ${duplicateField} already exists`
        //:error.message;
        res.status(400).json({message: error.message});
    }
}

//login :check email &  password then give token

const login =async(req,res) =>{
    try{
        const {email,password} = req.body;
        if(!email || !password){
            throw new Error("Please provide email or password")
        }

        const user = await User.findOne({email}).select("+password")

        if(!user || (await user.correctPassword(password,user.password)) === false){
            throw new Error("Incorrect email or password")
        }
            createSendToken(user,200,res)

    }
    catch(error){
        res.status(400).json({status:"fail", message:error.message})
    }

}

//proctect
const protect = async(req,res,next)=>{
    try{
        //find token
        let token;
        if(
            req.headers.authorization &&
             req.headers.authorization.startsWith("Bearer")
        ){
            token=req.headers.authorization.split("")[1]
        }else if(req.cookies.jwt && req.cookies.jwt !=='loggedout'){
            token=req.cookies.jwt;
        }

        //step2:no token so stop here
        if(!token){
            throw new Error("You are not logged in! Please log in to get access")
        }
        
        //step3:verify token
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        //step4:check if user still exists
        const currentUser = await User.findById(decoded.id);
        if(!currentUser){
            throw new Error("The user belonging to this token does no longer exist")
        };
        //step5:check if user changed password after the token was issued
        if(currentUser.changedPasswordAfter(decoded.iat)){
            throw new Error("User recently changed password! Please log in again")
        }
        //grant access to protected route
        req.user = currentUser;
        next();
    }
    catch(error){
        res.status(401).json({status:"fail", message:error.message})

    }
}

export {signup,login,protect};