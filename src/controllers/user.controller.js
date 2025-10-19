import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
    /*Algorithm for registering user
        1.get user details from frontend/postman
        2.validation
        3.check if user already exits
        4.check for images,avatar
        5.upload to cloudinary
        6.create user object in DB
        7.remove pasword and refresh token from response
        8.check for user creation
        9.return response */

    //1
    const { fullname, email, username, password } = req.body
    console.log("email: ", email);

    //2
    if ([fullname, email, username, password].some((field) =>
        field?.trim() === "")
    ) {
        throw new apiError(400, "All fields are required!")
    }

    //3
    const existingUser = User.findOne({
        $or: [{ email }, { username }]
    })
    if (existingUser) {
        throw new apiError(400, "User already exists!")
    }

    //4
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverLocalPath = req.files?.coverImage[0]?.path
    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar file required!")
    }

    //5
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverLocalPath)
    if (!avatar) {
        throw new apiError(400, "Avatar file missing!")
    }

    //6
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    //8
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new apiError(500, "Something went wrong while registering user!")
    }

    //9
    return res.status(201).json(
        new apiResponse(200, createdUser, "User Registered Successfully!")
    )
})

export { registerUser }