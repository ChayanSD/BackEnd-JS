import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {Tweet} from "../models/tweet.model.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body
    const userId = req.user._id;
    if (!content) {
        throw new ApiError(400, "Content is required")
    }

    const tweet = Tweet.create({
        owner: userId,
        content
    });

    return res.status(201).json(
        new ApiResponse(201, content,"Tweet created successfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
   const {userId} = req.params;
   if (!userId) {
       throw new ApiError(400, "User ID is required")
   }
   const tweets = await Tweet.find({owner: userId}).populate("owner", "username");

   return res.status(200).json(
       new ApiResponse(200, {"Tweets": tweets,
       "Number of tweet": tweets.length}, "User tweets retrieved successfully")
   )
})

const updateTweet = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { content } = req.body;
    const { tweetId } = req.params;
    if (!content) {
        throw new ApiError(400, "Content not found")
    }
    if (!tweetId) {
        throw new ApiError(400, "Tweet ID not found")
    }
    const result = await Tweet.findOneAndUpdate(
        { _id: tweetId, owner: userId },
        { $set: { content: content } }
    );

    return res.status(200).json(
        new ApiResponse(200, result, "Tweet updated successfully")
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { tweetId } = req.params;
    if (!tweetId) {
        throw new ApiError(400, "Tweet ID not found")
    }
    const result = await Tweet.findOneAndDelete({ _id: tweetId, owner: userId });
    return res.status(200).json(
        new ApiResponse(200, result, "Tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
