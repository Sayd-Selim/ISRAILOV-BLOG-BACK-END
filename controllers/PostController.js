import mongoose from "mongoose";
import PostModel from "../models/Post.js"


export const getLastTags = async (req, res) => {
    try {
      const posts = await PostModel.find().limit(5).exec();

      const tags = posts.map(obj => obj.tags).flat().slice(0, 5)
        res.json(tags);

    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: 'Не удалось получить тэги',
      });
    }
};


export const getAll = async (req, res) => {
    try {
      const posts = await PostModel.find().populate('user').exec();
    //  1) ишет ту схему где есть ключ user и берет его ключ ref
    // 2) потом ишет модель который зарегистрирован с этим ключом из ref чтобы потом передать его данные в user из постов
    // 3) потом берет то что вернул метод find() то есть нашу базу данных (а он вернул нам наши посты) и запихаем их в ключ user

    // резюмируя: populate() изпользуется чтобы взять данные из одной базы данных и передать их в другой
      res.json(posts);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: 'Не удалось получить статьи',
      });
    }
};

export const getOne = async (req, res) => {
    try {
        const postId = req.params.id;

        const doc = await PostModel.findOneAndUpdate(
            { _id: postId },
            { $inc: { viewsCount: 1,  } },
            { returnDocument: 'after' }
        ).populate('user'); // Переместили populate сюда

        if (!doc) {
            return res.status(404).json({
                message: 'Статья не найдена!'
            });
        }

        res.json(doc);
    } catch (error) {
        res.status(500).json({
            message: 'Не удалось вернуть статью!'
        });
    }
};



export const create = async (req, res) => {
    // console.log('req.body.text',req.body.text);
    try {
        const document = new PostModel({
            title: req.body.title,
            text: req.body.text,
            imageUrl: req.body.imageUrl,
            tags: req.body.tags,
            comments:[],
            user: req.userId
        })

        const post = await document.save()
        res.json(post)
    } catch (error) {
        res.status(500).json({
            message: 'Не удалось создать статью !'
        })
    }
}


export const remove = async (req, res) => {
    try {
        const userId = req.params.id
        const user = await PostModel.findOneAndDelete({
            _id: userId
        })

        if (!user) {
            return res.status(404).json({
                message: 'Статья не найдена !'
            })
        }

        res.json({
            message: 'Статья успешна удалена !',
            user
        })

    } catch (error) {
        res.status(404).json({
            message: 'Не удалось удалить статью из-за ошибки где-то !'
        })
    }
};


export const update = async (req, res) => {
    try {
        if (req.body?.element) {
            const PostId = req.params.id
            await PostModel.updateOne({
                _id: PostId
            }, {
                title: req.body.value.title,
                text: req.body.value.text,
                imageUrl: req.body.value.imageUrl,
                tags: req.body.value.tags,
                user: new mongoose.Types.ObjectId(req.body.element?.user?._id)
            })

            res.json({
                message: 'Статья успешна обновлена !'
            })

        } else {
            const userId = req.params.id

            await PostModel.updateOne({
                _id: userId
            }, {
                title: req.body.title,
                text: req.body.text,
                imageUrl: req.body.imageUrl,
                tags: req.body.tags,
                user: req.userId
            })

            res.json({
                message: 'Статья успешна обновлена !'
            })
        }

    } catch (error) {
        console.error('error',error);
        res.json({
            message: 'Не удалось обновить статью !'
        })
    }
}

export const addComment = async (req, res) => {
    const postId = req.params.id

    const postFromMongoDB = await PostModel.findByIdAndUpdate(
        {_id: postId},
        {comments: req.body.comment},
        {returnDocument: 'before'}
    )

    res.json(postFromMongoDB)
}