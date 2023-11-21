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

### run project with dotenv :
`"dev": "nodemon -r dotenv/config --experimental-json-modules src/index.js"`