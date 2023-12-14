import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const refreshToken = user.generateRefreshToken();
        const accessToken = user.generateAccessToken();

        user.refreshToken = refreshToken;
        user.save({validateBeforeSave: false});
        return {accessToken, refreshToken};
    } catch (err) {
        throw new ApiError(500, "Something went wrong while generating access & refresh token");
    }
}
const registerUser = asyncHandler(async (req, res) => {
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
    const {fullName, email, username, password} = req.body
    // console.log('email',email);

    /*//you can check by using again and again
    if (fullName === ''){
        throw new ApiError(400,"FullName is required !!");
    }*/

    //Advance code
    if (
        [fullName, email, username, password].some((field) => field?.trim() === '')
    ) {
        throw new ApiError(400, "All Fields are required !!");
    }

    // Check user is already exist or not

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exist");
    }

    // Check image and avatar
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    const avatarLocalPath = req.files?.avatar[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar is required");
    }

    // create user object ->create entry in DB
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username: username.toLowerCase(),
        password
    });

    // remove password and refresh token field
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registration");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})

const loginUser = asyncHandler(async (req,res)=>{
    //Take data from user ->req.body ->data
    //username or email
    //find the user
    //password check
    //access and refresh token
    //send token via cookies
    //send a success or fail message

    //1
    const {username, email, password} = req.body;

    if (!username || !email) {
        throw new ApiError(404, "username or email is required!!")
    }

    //2
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    //3
   const isPasswordValid =  await user.isPasswordCorrect(password);

    if (!isPasswordValid){
        throw new ApiError(401,"Invalid user credential");
    }

    //4
   const {accessToken , refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly :true,
        secure : true,
    }
    return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    user : loggedInUser,refreshToken,accessToken,
                },
                "user logged in successfully",
            )
        )
})

const logoutUser = asyncHandler(async (req, res)=>{
    //I have to design my own middleware
   await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(
            new ApiResponse(200,{},"User logged Out")
        )
})

export {
    registerUser,
    loginUser,
    logoutUser
}