import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

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

const loginUser = asyncHandler(async (req, res) => {
    //Take data from user ->req.body ->data
    //username or email
    //find the user
    //password check
    //access and refresh token
    //send token via cookies
    //send a success or fail message

    //1
    const {username, email, password} = req.body;

    if (!username && !email) {
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
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credential");
    }

    //4
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    }
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, refreshToken, accessToken,
                },
                "user logged in successfully",
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    //I have to design my own middleware
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged Out")
        )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);

    if (!user) {
        throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used");
    }
    const options = {
        httpOnly: true,
        secure: true
    }
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id);
    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, {accessToken, refreshToken: newRefreshToken},
                "Successfully AccessToken refreshed"
            )
        )
})


const changeCurrentPassword = asyncHandler(async (req, res) => {
    /*
    I need old password,
    user id,
    update the password
    don't change other info
     */

    const {oldPassword, newPassword} = req.body;
    //in authMiddleware i have logged-in user.line number 24

    const user = await User.findById(req.user?._id);
    //I have a method called isPasswordCorrect that's return true or false
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid password");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res.status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(200, req.user, "Current user fetch successfully");
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    //data from req.body
    const {fullName, email} = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {new: true}
    ).select("-password");

    return res.status(200)
        .json(new ApiResponse(200, user, "Details update successfully"));

});


const updateUserAvatar = asyncHandler(async (req, res) => {
    //In routing time , I need to use 2 middleware authMiddleware, multerMiddleware
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file path missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(400, "Error while upload avatar");
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password");

    return res.status(200)
        .json(new ApiResponse(200, user, "Avatar update successfully"));

});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const localCoverImagePath = req.file?.path;
    if (!localCoverImagePath) {
        throw new ApiError(400, "CoverImage file path missing");
    }
    const coverImage = await uploadOnCloudinary(localCoverImagePath);

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading CoverImage");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password");

    return res.status(200)
        .json(new ApiResponse(200, user, "Cover Image update successfully"));
});


const getUserChannelProfile = asyncHandler(async (req,res)=>{
    //De-structure the username from params
    const {username} = req.params;

    if (!username?.trim()){
        throw new ApiError(400,"Username is missing");
    }
    //Implementing the aggregation pipeline
    const channel = await User.aggregate([
        {
            $match : {
                username : username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from : "subscriptions",
                localField :"_id",
                foreignField : "channel",
                as: "subscribers"

            }
        },
        {
            $lookup : {
                from : "subscriptions",
                localField :"_id",
                foreignField : "subscriber",
                as: "subscribedTo"
            }
        },
        //add some fields
        {
            $addFields : {
                subscribersCount : {
                    $size : "$subscribers"
                },
                channelsSubscribedToCount : {
                    $size : "$subscribedTo"
                },
                //user subscribed then true otherwise false
                isSubscribed : {
                    $cond : {
                        if: {$in: [req.user?._id,"$subscribers.subscriber"]},
                        then : true,
                        else : false
                    }
                }
            }
        },
        {
            $project :{
                fullName : 1,
                username : 1,
                subscribersCount:1,
                channelsSubscribedToCount: 1,
                isSubscribed : 1,
                avatar : 1,
                coverImage : 1,
                email : 1

            }
        }
    ]);
    console.log(channel);

    if (!channel?.length){
        throw new ApiError(404,"channel does not exist");
    }

    return res.status(200).json(
        new ApiResponse(200,channel[0],"user channel fetched successfully")
    );

})


const getWatchHistory = asyncHandler(async (req,res)=>{
    const user = await User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(req.user._id),
            }
        },
        {
            $lookup :{
                from : 'videos',
                localField : 'watchHistory',
                foreignField : '_id',
                as: "watchHistory",
                pipeline:[
                    {
                        $lookup :{
                            from :'users',
                            localField : 'owner',
                            foreignField :'_id',
                            as : 'owner',
                            pipeline :[
                                {
                                    $project : {
                                        fullName : 1,
                                        username : 1,
                                        avatar :1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner : {
                                $first : '$owner'
                            }
                        }
                    }
                ]


            }
        }
    ]);

    return res.status(200).json(new ApiResponse(200,user[0].watchHistory,"watch history fetched successfully"));
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}