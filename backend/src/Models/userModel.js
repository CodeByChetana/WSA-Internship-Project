//user schema

import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "node:crypto"

const userSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            required:[true,"Please enter your name"],
            trim: true,
            maxlength:[50, "your name cannot be longer than 50 characters"]
        }
    }
)