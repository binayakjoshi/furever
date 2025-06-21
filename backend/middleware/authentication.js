const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');


const authenticate = (req,res,next)=> {
	try{
		const token = req.headers.authorization.split(' ')[1];
		if(!token){
			return next(new HttpError('please login or create account to visit this route',401));
		}
		const decodedToken = jwt.verify(token,process.env.JWT_SECRET);
		req.userData = {userId: decodedToken.userId};
		next();

	}catch(error){
		return next(new HttpError('Please Login First.',401));
	}
	
}
module.exports = authenticate;