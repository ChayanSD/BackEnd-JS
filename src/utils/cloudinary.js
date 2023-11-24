import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
});


const uploadFileCloudinary = async(localFilePath)=>{
    try{
        if (!localFilePath) return null;
        //upload file to cloudinary
       const response =await cloudinary.uploader.upload(localFilePath,{
            resource_type : 'auto'
        });
        //file uploaded successfully on cloudinary
        console.log('file uploaded successfully on cloudinary',response.url);
        return response;
    }catch (error){
        fs.unlinkSync(localFilePath);
        //remove the locally saved file as the upload failed
        return null;
    }
}

export {
    uploadFileCloudinary
};