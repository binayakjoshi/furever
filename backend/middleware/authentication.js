const jwt = require ('jsonwebtoken');

const HttpError= require('../models/http-error');

const authenticate= (req, res,next)=>{
    try{
        const token = req.headers.authentication;

        if(!token || !token.startsWith('Bearer')){
            return next(new HttpError('Authentication failed, token not found', 401));
        }

        if (!token){
            return next(new HttpError('Authentication failed, token not found', 401));
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userData={userId:decodedToken.userId}
    next();
}
    catch(error){
        return next(new HttpError('Authentication failed, token not found', 401));
    }
}