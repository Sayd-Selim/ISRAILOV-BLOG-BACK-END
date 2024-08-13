import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    avatarUrl: String,
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('User', UserSchema);

/*
model возвращает функцию при ее вызове которой создаются методы (save, find, и т.д)
 для сохранение пользователя в базу данных
*/

/*

Schema - это сотрудник который делает распечатку документа, 
мы передаем ему текст а тот ее запечатывает, потом мы это схему передаем Model, 

а Model справшивает:

  - это схема для кого ?

  - чисто для пользователей которые регистрируются,
  если НЕ соответствуют схеме то НЕ дай им зарегистрироваться !
  
  (Поэтому указали первым параметром в Model 'User' - можешь написать что угодно !
   но логично указать 'User') 



 Model - это как бы сотрудник который проверяет у входа двери, 
 и мы как начальник говорим сотруднику:

 - Вот тебе схема (то есть, наш объект который мы передаем в первый параметр) 
 пропускай только тех кто соответствует этой схеме !

 Мы НЕ говорим что FullName будет объектом ! 
 просто мы так указываем настройки в которые должен соответствовать пользователь, то есть,
 значение FullName должен быть - строкой и обезательным ! а email точно также и + уникальным


 И передаем вторым параметром {timestamps: true} - Это значит что мы говорим схеме:
 - Для каждого пользователя пропиши дату создаение, то есть, когда он зарегистрировался !
*/