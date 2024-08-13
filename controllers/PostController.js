import PostModel from "../models/Post.js"


export const getLastTags = async (req, res) => {
    try {
      const posts = await PostModel.find().limit(5).exec();

      const tags = posts.map(obj => obj.tags).flat().slice(0, 5)
            res.json(tags);

    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: 'Не удалось получить тэги',
      });
    }
};


export const getAll = async (req, res) => {
    try {
      const posts = await PostModel.find().populate('user').exec();
      res.json(posts);
    } catch (err) {
      console.log(err);
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
            { $inc: { viewsCount: 1 } },
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
            user: req.userId
        })

        const post = await document.save()
        console.log('post',post);
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

        console.log('updatedPost',req.body.title);
        res.json({
            message: 'Статья успешна обновлена !'
        })

    } catch (error) {
        res.json({
            message: 'Не удалось обновить статью !'
        })
    }
}