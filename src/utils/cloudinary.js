import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //uploading file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        //file uploaded sucessfully
        console.log("File is uploaded on cloudinary", response)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove locally saved temp file as upload gets failed
        return null
    }
}



cloudinary.uploader
    .upload("my_image.jpg")
    .then(result => console.log(result));