import {Router} from "express";
import {deleteVideo, getVideoById, publishAVideo} from "../controllers/video.controllers.js";
import {upload} from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(
        upload.fields(
            [
                {
                    name: "videoFile",
                    maxCount: 1,
                },
                {
                    name: "thumbnail",
                    maxCount: 1,
                }
            ]
        )
,publishAVideo);

router.route("/:videoId")
    .delete(deleteVideo)
    .get(getVideoById);

export default router;