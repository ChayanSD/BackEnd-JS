import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const deleteOnCloudinary = async (url) => {
    try {
        let publicId = String(url.split("/").pop().split(".")[0]);
        console.log("This is public Id", publicId);

        if (!publicId) {
            return console.log("No public Id present");
        }
        cloudinary.uploader.destroy(publicId).then((result) => console.log(result));
    } catch (error) {
        console.log(error.message);
    }
};
const deleteVideoOnCloudinary = async (url) => {
    try {
        //Getting public Id
        let publicId = String(url.split("/").pop().split(".")[0]);
        console.log("This is public Id", publicId);
        //Validating Public ID
        if (!publicId) {
            return console.log("No public Id present");
        }
        // Delete the file using the public ID
        cloudinary.uploader
            .destroy(publicId, { resource_type: "video" })
            .then((result) => console.log(result));
    } catch (error) {
        console.log(error.message);
    }
};
export {
    uploadOnCloudinary,
    deleteVideoOnCloudinary,
    deleteOnCloudinary
};