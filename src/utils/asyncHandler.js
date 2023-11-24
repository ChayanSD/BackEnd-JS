const asyncHandler = (requestHandler) => {
   return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).
        catch((error)=>next(error));
    }
}

export {asyncHandler};


//asyncHandler is a higher order function that takes a function as an argument and returns a function.
/*
const asyncHandler=(fn) =>async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        res.status(error.code || 500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        })
    }
}*/
