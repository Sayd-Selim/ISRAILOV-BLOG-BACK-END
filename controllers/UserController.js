import {validationResult} from 'express-validator';
import UserModal from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export const mongoDB = () => (async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI); // Укажите имя базы данных
        console.log('Подключение к базе данных прошло успешно !');
    } catch (error) {
        console.error('Произошла ошибка при подключении к базе данных !');
    }
})();


export const register = async (req, res) => {
    try {

        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const document = new UserModal({
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.file ? `/uploads${req.file.filename}` : '', 
            passwordHash: hash,
        });

        const user = await document.save();

        const token = jwt.sign({
            _id: user._id
        }, 'secret', {
            expiresIn: '30d'
        });

        const { passwordHash, ...userData } = user._doc;

        res.json({
            ...userData,
            token
        });

    } catch (error) {
        res.status(500).json({
            message: 'Что-то пошло не так! Не удалось зарегистрироваться!'
        });
    }
};

export const login = async (req, res) => {
    try {
        // req.body.email - это email (params) мы передали через axios вторым параметром в файле auth.js
        const user = await UserModal.findOne({
            email: req.body.email
        })

        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден !'
            })
        }

        console.log('user',user);

        // Сначала ишет пользователя по email если нашел, то проверяет пароль, 
        // если true, то выдает новый токен
        
        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash)

        if (!isValidPass) {
            return res.status(400).json({
                message: 'Неверный логин или пароль !'
            })
        }

        const token = jwt.sign({
            _id: user._id
        }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        })

        const {passwordHash,...userData} = user._doc

        // тут мы вытаскиваем пароль хешированный, потому что, не нужно ее возвращать клиенту,
        // и создаем переменную userData и сохраняем туда все остальное из объекта user._doc

        res.json({
            ...userData,
            token
        })

    } catch (error) {
        res.status(500).json({
            message: 'Что-то пошло не так ! не удалось авторизоваться !'
        })
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await UserModal.findById(req.userId)

        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден !'
            })
        }

        const {passwordHash,...userData} = user._doc

        res.json(userData)

    } catch (error) {
        res.status(500).json({
            message: 'Нет доступа !'
        })
    }
}