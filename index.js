import express from 'express';
import {loginValidation, postCreateValidation, registerValidation} from './validations.js';
import checkAuth from './utils/checkAuth.js';
import { getMe, login, mongoDB, register } from './controllers/UserController.js';
import { create, getAll, getLastTags, getOne, remove, update } from './controllers/PostController.js';
import multer from 'multer';
import handleValidationErrors from './utils/handleValidationErrors.js';
import cors from 'cors'
import fs from 'fs'

import dotenv from 'dotenv';
dotenv.config();
mongoDB()

const app = express();

app.use('/uploads', express.static('uploads'))

app.use(cors())

const storage = multer.diskStorage({
    destination: (_, file, cb) => {
        if(!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads')
        }
        // console.log('file',file);
        cb(null, 'uploads')
        // задача cb() из destination: передать своё значение в логику функции filename
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({storage})


// 1) multer.diskStorage - Возвращает объект с функцией 
// 2) этот объект с фукнцией передаем в первым параметром в multer({сюда}) в объекте,
// и обязательно должен быть название storage, потому что , 
// в логике multer она вытаскивает именно storage из первого параметра 
// 3) multer-е создаются функции такие как: handleRequest, single, array и т.д 
// и multer возваращает объект с этими функциями кроме handleRequest,
//  потому что , single когда ее вызываешь, она вызывает handleRequest, то есть, - это происходит так:
//  Вызываю single() она через return возвращает midleware   
//  вот так = (req, res, next) => handleRequest() - а этот midleware вызывает нашу функцию handleRequest

app.use(express.json());

app.post('/auth/register', registerValidation, handleValidationErrors,  register);

app.post('/auth/login', loginValidation, handleValidationErrors, login)

app.get('/auth/me',checkAuth, getMe)


// тут будет запрос связанный с multer-ом

app.post('/upload', upload.single('image'), (req, res) => {

    res.json({
        url: `/uploads/${req.file.originalname}`
    })
    // тут мы возвращаем ссылку на наш сохраненный файл из папки uploads
    //  чтобы потом указать в <img src={вот сюда!}/>  и отрисовать ее в фронте
})

app.get('/posts', getAll)
app.get('/tags', getLastTags)
app.get('/posts/:id', getOne)
app.post('/posts', checkAuth,  postCreateValidation, handleValidationErrors, create)
app.delete('/posts/:id', checkAuth, remove)
app.patch('/posts/:id/edit', checkAuth,  update)


app.listen(process.env.PORT || 3001, () => {
    console.log(`Server запущен на порту ${process.env.PORT}`);
});


/*
1) создаем post запрос для регистрации
2) создаем милдваре для проверки регистрации
3) шифруем пароль через bcrypt
4) создаем пользователя через фукнкцию который вернул mongoose.modal
5) оборачиваем код из post запроса в try catch
6) шифруем _id из user через jwt.sign()
7) пишем уже логику на авторизацию !
8) Сначала находим пользователь в базе данных через email через метод findOne()
9) Потом сверяем пароль который отправил пользователь и пароль из базы данных через bcrypt.compare()
10) Потом рефакторинг кода 
11) создаем postController и создаем model для postController
12) Создаем валидацию на логина и создание статьи в validations.js
13) пишем логику в postController.js
*/