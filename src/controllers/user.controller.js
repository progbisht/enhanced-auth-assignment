const User = require('../models/user.model')
const uploadOnCloudinary = require('../utils/cloudinary')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


// @desc -      register a new user
// @route -     POST /register
// @access -    public

const newUserRegistration = async (req,res) => {
    try{
        const { email, fullName, bio, phone, password } = req.body
        
        // if the required fields are empty
        if([email, fullName, bio, phone, password].some( (field) => field?.trim === "")){
            return res.status(400).json({
                "message" : "email and password are required"
            })
        }

        // check for existing user
        const existedUser = await User.findOne( { email } ).exec()

        if(existedUser){
            return res.status(409).json({
                "message" : "User with email already exists"
            })
        }

        // password encryption
        const hashedPassword = await bcrypt.hash(password, 10)

        // check for the file uploaded through multer
        const photoLocalPath = req.files?.photo[0]?.path

        if(!photoLocalPath){
            return res.status(400).json({ message: "Photo is required" })
        }

        // upload the image from server to cloudinary
        const photo = await uploadOnCloudinary(photoLocalPath)

        if(!photo){
            return res.status(400).json({ message: "Photo is required" })
        }

        // create a new user
        const newUser = await User.create({
            email,
            fullName,
            phone,
            photo: photo.url,
            password: hashedPassword,
            bio

        })

        // check for user created successfully
        const createdUser = await User.findById( newUser._id ).select("-password -refreshToken")

        // sending response
        res.status(201).json({
            message: "User created successfully.",
            createdUser
        })
 
    }
    catch(err){
        return res.status(500).json({
            "message" : err.message
        })
    }

}



// @desc -      login a user
// @route -     POST /auth
// @access -    public

const authUser = async (req,res) => {
    try{

        const {email, password} = req.body
        
        // check if the required fields are empty
        if(!email || !password){
            return res.status(400).json({
                "message" : "email and Password are required. "
            })
        }
        
        // user email verification
        const existedUser = await User.findOne( { email : email } )
    
        if(!existedUser){
            return res.status(400).json({
                "message" : "User with credentials does not exist."
            })
        }
        
        // user password verification
        const foundUser = await bcrypt.compare(password ,existedUser.password)
    
        if(foundUser){
    
            const roles = Object.values(existedUser.roles).filter(Boolean)
            
    
            // generating access token and refresh token for user to authenticate
            const accessToken = jwt.sign(
                {
                    "UserInfo" : {
                        "email" : existedUser.email,
                        "roles" : roles
                    }         
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn : "30s" }
            )
    
            const refreshToken = jwt.sign(
                { "email" : existedUser.email },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn : "1d" }
            )
    
            // persist the refresh token in the database
            existedUser.refreshToken = refreshToken
            
            const result = await existedUser.save()
            
            
            // setting cookie value with refresh token
            res.cookie('jwt', refreshToken, {
                httpOnly : true,
                sameSite: 'None',
                secure: true,
                maxAge : 24 * 60 * 60 * 1000
            })
    
            res.status(200).json({
                roles,
                accessToken
            })
        }
        else{
            res.status(401).json({
                "message" : "Unauthorized User"
            })
        }
    }
    catch(err){
        return res.status(500).json({
            "message" : err.message
        })
    }
}



// @desc -      To logout from a session
// @route -     GET /logout
// @access -    public
const handleLogout = async (req,res) => {
    try{

        const authCookies = req.cookies
            
        // checking for the jwt property in cookies
        if(!authCookies?.jwt) return res.sendStatus(204)
    
        // accessing and checking the refresh token belongs to valid user
        const refreshToken = authCookies.jwt
    
        const foundUser = await User.findOne({ refreshToken }).exec()
    
        // if cookie does not belongs to a valid user then cleaning the cookie
        if(!foundUser) {
            return res.clearCookie('jwt', refreshToken, {
                httpOnly : true,
                sameSite: 'None',
                secure: true,
                maxAge : 24 * 60 * 60 * 1000
            }).status(204).json({
                message: "Success"
            })
        }
        else{
            foundUser.refreshToken = ''
            await foundUser.save()
            
        
            // clearing the cookie syntax should be same as while setting cookie and maxAge ptoperty is optional
            res.clearCookie(
                'jwt', 
                refreshToken, {
                httpOnly : true,
                    sameSite: 'None',
                    secure: true,
                    maxAge : 24 * 60 * 60 * 1000
                }
            )
            .status(204)
            .json(
                {
                    message: "Success"
                }
            )
        }  
    
    

    }
    catch(err){
        return res.status(500).json({
            "message" : err.message
        })
    }

}


// @desc -      get an access token
// @route -     GET /refresh
// @access -    public

const handleRefreshToken = async (req,res) => {
    try{
        const authCookies = req.cookies
    
        // checking for the jwt property in cookie else the user is unauthorized
        if(!authCookies?.jwt){
            return res.status(401).json({
                message: "Unauthorized User"
            })
        }
    
        const refreshToken = authCookies.jwt
    
        // const foundUser = userDB.users.find(user => user.refreshToken === refreshToken)
        const foundUser = await User.findOne({ refreshToken : refreshToken }).exec()
    
        // if user is not exisiting user but still manages to have token then the the status should be Forbidden
        if(!foundUser){
            return res.status(403).json({
                message: "Forbidden"
            })
        } 
    
    
        // if user is valid then allocating access token to user
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, verified) => {
                if(err || foundUser.email !== verified.email){
                    return res.status(403).json({
                        message: "Forbidden"
                    })
                }
    
                const roles = Object.values(foundUser.roles)
                const accessToken = jwt.sign(
                    { 
                        "UserInfo" : {
                            "email" : verified.email,
                            "roles" : roles
                        }
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: "30s" }
                )
    
                res.send({ roles, accessToken })
            }
        )
    }
    catch(err){
        return res.status(500).json({
            "message" : err.message
        })
    }
}


// @desc -      detail user profile
// @route -     GET /profiles/:id
// @access -    private (authorized user)

const handleUserProfile  = async(req,res) => {
    try{
        const { id } = req.params
        
        // check for user with id exisit in our records 
        const foundUser = await User.findOne({ _id : id }).exec()

        if(!foundUser){
            return res.status(400).json({
                message: `User prodile with ${id} does not exist.`
            })
        }


        res.status(200).json({
            message: "Success",
            foundUser
        })
    }
    catch(err){
        return res.status(500).json({
            "message" : err.message
        })
    }
}



// @desc -      update a user profile
// @route -     PATCH /profiles/:id
// @access -    private (authorized user)

const updateUserProfile  = async(req,res) => {
    try{

        const { id } = req.params
        const { email, fullName, bio, phone, password, photoUrl } = req.body
        
        // check for user exists in our records 
        const user = await User.findOne( {_id : id} ).exec();

        if(!user)
        {
            return res.status(400).json({
                message :  `User with id ${id} dooes not exist.`
            });
        }
        
        
        const existedUser = await User.findOne( { email } ).exec()
    
        // check if the user enters an email that belongs to other registered user
        if(existedUser && existedUser.id.toString() !== id.toString()){
            return res.status(409).json({
                message : "User with email already exists"
            })
        }
    
        // update the values as provided by the user
        // if user provides an email to update
        if(email){
            user.email = email
        }

        // if user provides name to update
        if(fullName){
            user.fullName = fullName
        }
        
        // if user provides phone number to update
        if(phone){
            user.phone = phone
        }

        // if user provides bio to update
        if(bio){
            user.bio = bio
        }

        // if user provides password to update
        if(password){
            const hashedPassword = await bcrypt.hash(password, 10)

            user.password = hashedPassword
        } 

        // if user uploads an image
        if(req.files){
            const photoLocalPath = req.files?.photo[0]?.path
    
            if(!photoLocalPath){
                return res.status(400).json({ message: "Photo is required" })
            }
    
            const photo = await uploadOnCloudinary(photoLocalPath)
    
            if(!photo){
                return res.status(400).json({ message: "Photo is required" })
            }
            user.photo = photo.url

        }

        // if user provides a link to update
        if(photoUrl){
            user.photo = photoUrl
        }
     
        // save the updated user in the database
        const updated = await user.save();
        res.status(200).json({
            message: "Success",
            updated
        });

    }
    catch(err){
        return res.status(500).json({
            "message" : err.message
        })
    }
}


// @desc -      fetch all user profiles
// @route -     GET /admin
// @access -    private (authorized and admin only)
const getAllProfiles  = async(req,res) => {
    try{
        
        // fetch the user profile excluding private information
        const users = await User.find().select("-password -phone -refreshToken -roles -isPublic").exec()
        
        if(!users){
            return res.status(200).json({
                message: "No user profile to show.",
                users
            })
        }

        res.status(200).json({
            message: "Success",
            users
        })

    }
    catch(err){
        return res.status(500).json({
            "message" : err.message
        })
    }
}


// @desc -      fetch Public profiles
// @route -     GET /profiles
// @access -    private (authorized user)
const getPublicProfiles  = async(req,res) => {
    try{
        // fetch the user profile excluding private information
        const users = await User.find({ isPublic: true }).select("-password -phone -refreshToken -roles -isPublic").exec()
        
        if(!users){
            return res.status(200).json({
                message: "No user profile to show",
                users
            })
        }

        res.status(200).json({
            message: "Success",
            users
        })
    }
    catch(err){
        return res.status(500).json({
            "message" : err.message
        })
    }
}




// @desc -      set profile public or private
// @route -     PATCH /profiles/:id
// @access -    private (authorized user only)
const toggleProfile = async(req,res) => {
    try{
        const { id } = req.params

        // check for users existence in our records
        const foundUser = await User.findOne({ _id : id }).exec()

        if(!foundUser){
            return res.status(400).json({
                message: `User prodile with ${id} does not exist.`
            })
        }

        // set the profile if it is public or private
        foundUser.isPublic = !foundUser.isPublic;
        await foundUser.save()

        res.status(204).json({
            message: "Success"
        })

    }
    catch(err){
        return res.status(500).json({
            "message" : err.message
        })
    }
}


// @desc -      get admin profiles
// @route -     GET /profiles/admins
// @access -    privaate (authorized user)
const getAdminProfiles = async(req, res) => {
    try{
        // fetch the user profile excluding private information
        const users = await User.find().select("-password -phone -refreshToken -isPublic").exec()
        console.log(users);
        if(!users){
            return res.status(200).json({
                message: "No user profile to show",
                users
            })
        }

        // filter the users whose role is admin
        const admins = users.filter( (user) => user.roles.Admin === 3000)
        console.log(admins);
        res.status(200).json({
            message: "Success",
            admins
        })

    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            "message" : err.message
        })
    }
}

// @desc -      get user profiles
// @route -     GET /profiles/users
// @access -    private (authorized user)
const getUserProfiles = async(req,res) => {
    try{
        // fetch the user profile excluding private information
        const users = await User.find().select("-password -phone -refreshToken -isPublic").exec()
        

        if(!users){
            return res.status(200).json({
                message: "No user profile to show",
                users
            })
        }

        // filter the user who are not admins but normal users
        const allUsers = users.filter( (user) => user.roles?.Admin !== 3000)
        
        res.status(200).json({
            message: "Success",
            allUsers
        })
    }
    catch(err){
        return res.status(500).json({
            "message" : err.message
        })
    }
}



// extras
// this method is just to set an admin for testing purpose
const setAdmin = async (req, res) => {
    try{
        const {id} = req.params

        // check for user exists in our records 
        const user = await User.findOne( {_id : id} ).exec();

        if(!user)
        {
            return res.status(400).json({
                message :  `User with id ${id} dooes not exist.`
            });
        }

        user.roles.Admin = 3000
        await user.save()

        res.status(200).json({
            message: "Success"
        })
        
    }
    catch(err){
        return res.status(500).json({
            "message" : err.message
        })
    }
}

module.exports = {
    newUserRegistration,
    authUser,
    handleRefreshToken,
    handleLogout,
    getAllProfiles,
    getPublicProfiles,
    handleUserProfile,
    updateUserProfile,
    toggleProfile,
    getAdminProfiles,
    getUserProfiles,
    setAdmin,
}

