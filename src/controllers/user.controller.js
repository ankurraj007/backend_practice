import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js"


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new apiError(500, "Something went wrong while generating Access & Refresh tokens!")
    }
}

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
    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (existingUser) {
        throw new apiError(400, "User already exists!")
    }


    //4
    const avatarLocalPath = req.files && req.files.avatar && req.files.avatar[0] ? req.files.avatar[0].path : null;
    const coverLocalPath = req.files && req.files.coverImage && req.files.coverImage[0] ? req.files.coverImage[0].path : null;
    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar file required!")
    }

    //5
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar) {
        throw new apiError(400, "Error uploading avatar to cloudinary")
    }
    let coverImage = null
    if (coverLocalPath) {
        coverImage = await uploadOnCloudinary(coverLocalPath)
        if (!coverImage) {
            console.warn("Error uploading cover image to cloudinary")
        }
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


const loginUser = asyncHandler(async (req, res) => {
    /*Algorithm for login user
    1. Take request from body
    2. username or email
    3.find the user
    4.password check
    5.access and refresh token
    6.send cookies
    */

    //1
    const { email, username, password } = req.body

    //2
    if (!username && !email) {
        throw new apiError(400, "Username or Email is required!")
    }

    //3
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new apiError(400, "User not found!")
    }

    //4
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new apiError(401, "Invalid Password!")
    }

    //5
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    //6

    const loggedInUser = await User.findById(user._id).select("-password --refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(200, {
                user: loggedInUser, accessToken, refreshToken
            }, "User logged in successfully")
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id,
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

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new apiResponse(200, {}, "User logged out!"))

})





export { registerUser, loginUser, logoutUser }