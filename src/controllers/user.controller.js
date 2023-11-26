import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadFileCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

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
    const { fullName ,email, username , password} = req.body
    console.log('email',email);

    /*//you can check by using again and again
    if (fullName === ''){
        throw new ApiError(400,"FullName is required !!");
    }*/

    //Advance code
    if (
        [fullName,email,username,password].some((field)=>field?.trim()==='')
    ){
        throw new ApiError(400,"All Fields are required !!");
    }

    // Check user is already exist or not

    const existedUser =User.findOne({
        $or : [{ username } , { email }]
    })

    if (existedUser){
        throw new ApiError(409,"User already exist");
    }

    // Check image and avatar
   const coverImageLocalPath = req.files?.coverImage[0]?.path;
   const avatarLocalPath = req.files?.avatar[0]?.path;

   if (!avatarLocalPath){
       throw new ApiError(400,"Avatar is required");
   }

  const avatar = await uploadFileCloudinary(avatarLocalPath);
  const coverImage =await uploadFileCloudinary(coverImageLocalPath);

    if (!avatar){
        throw new ApiError(400,"Avatar is required");
    }

    // create user object ->create entry in DB
   const user =  await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        username : username.toLowerCase(),
        password
    });

    // remove password and refresh token field
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser){
        throw new ApiError(500,"Something went wrong while registration");
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )



})

export {
    registerUser
}