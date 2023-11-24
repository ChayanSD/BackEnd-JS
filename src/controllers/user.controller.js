import {asyncHandler} from "../utils/asyncHandler.js";

const registerUser = asyncHandler( async (req,res)=>{
    /*res.status(200).json({
        message : 'Ok'
    })*/

    //get user details from frontend
    //validation like email is empty or not
    //check if user already exists : user , email
    //check for images,check for avatar
    //upload them to cloudinary
    // create user object ->create entry in DB
    // remove password and refresh token field
    // check for user creation
    // return response

    //step 1.
    const { email , username , password} = req.body
    console.log('email',email);
})

export {
    registerUser
}