
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

export {signup,login};