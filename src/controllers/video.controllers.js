import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {Video} from "../models/video.model.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10, query, sortBy, sortType, userId} = req.query;
    //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
    const {title, description} = req.body
    if (
        [title, description].some((field) => field?.trim() === '')
    ) {
        throw new ApiError(400, "All fields are required!!")
    }

//upload the video and thumbnail on cloud
    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailPath = req.files?.thumbnail[0]?.path;

    if (!videoLocalPath) {
        throw new ApiError(400, "Video is missing!");
    }

    if (!thumbnailPath) {
        throw new ApiError(400, "Thumbnail is missing!");
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailPath);

    if (!videoFile) {
        throw new ApiError(500, "something went wrong while upload the video");
    }

    if (!thumbnail) {
        throw new ApiError(500, "something went wrong while upload the thumbnail");
    }

    //Create the video

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile?.duration,
        owner: req.user._id,
        isPublished: true
    })

    return res.status(201).json(
        new ApiResponse(200, video, "Video upload successfully")
    )
});


export {
    getAllVideos,
    publishAVideo,
}