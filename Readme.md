# Backend with js
 [Model Link](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)
## project setup : 
### part 1 :
- npm init 
- create.gitkeep for push the empty file.
-  create.gitignore for hiding the secure file. 
- create .env file
- create src folder
- src/index.js is the entry file for this project
- install nodemon for auto running the server npm i -D nodemon (-D for devDependencies)
- "dev": "nodemon src/index.js"
### part 2 :
- src/ mkdir controllers db middlewares models routes utils
- npm i express mongoose dotenv
- npm i cookie-parser cors (cors -> cross-origin resource sharing)
- npm install mongoose-aggregate-paginate-v2
- npm install bcrypt (A library to help you hash passwords.)

### run project with dotenv :
`"dev": "nodemon -r dotenv/config --experimental-json-modules src/index.js"`


## Project Flow
1. connect database (db folder)
2. define constants.js file
3. configuration express at app.js file
4. utils/asyncHandler.js ->
5. utils/errorHandler.js->Handling Errors
6. utils/ApiResponse.js -> Handling Response
7. models /user.js-> create user schema and model,implement bcryptjs for password hashing.
8. models/video.js
9. 