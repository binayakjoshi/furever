class HttpError extends Error{
	constructor(message,errcode){
		super(message);
		this.code = errcode;
	}
}
module.exports = HttpError;