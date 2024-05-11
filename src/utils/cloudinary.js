const { v2 : cloudinary } =  require('cloudinary')
const fs = require('fs')


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});



const uploadOnCloudinary = async(localFilePath) => {
    try{
        if(!localFilePath)  return null

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        fs.unlinkSync(localFilePath)    // remove the locally saved file from the server as the upload operation got failed.

        return response
    }
    catch(err){
        console.log("cloudi",err)
        fs.unlinkSync(localFilePath)    // remove the locally saved file from the server as the upload operation got failed.
        return null
    }
}


module.exports = uploadOnCloudinary