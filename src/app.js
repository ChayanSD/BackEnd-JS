import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
const app = express();

//use the cors
//app.use basically work on when we use middleware , configuration ect.
app.use(cors({
    origin : process.env.CORS_ORIGIN ,//where to come the request
    credentials : true
}));

//accept json request
app.use(express.json({limit : '16kb'}))

//accept url request
app.use(express.urlencoded({extended : true , limit :"16kb"}))

//store some basic this for anyone
app.use(express.static('public'))

//configure the cookie parser
app.use(cookieParser())


export {app}