const jwt = require('jsonwebtoken');


// middleware that needs to be executed whatever routes we want to have an authorized access.
const handleVerification = (req,res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    console.log(authHeader);

    // check for the authorized header and retrieve the token from the header
    if(!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);

    const token = authHeader.split(' ')[1];

    // verify the access token and execute the next steps
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, verified) => {
            if(err) return res.sendStatus(403);
            req.email = verified.UserInfo.email;
            req.roles = verified.UserInfo.roles;
            next();
        }
    )
}

module.exports = handleVerification;