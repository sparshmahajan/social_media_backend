const postSchema = require('../models/postSchema');
const userSchema = require('../models/userSchema');
const { cloudinary } = require('../utils/cloudinary');
const { ObjectId } = require('mongoose').Types;

const createPost = async (req, res) => {
    const { userId } = req.user;
    const { title, content, postStatus, hashtags, taggedUsers } = req.body;

    let result = {
        secure_url: "",
        public_id: ""
    };
    if (req.file) {
        result = await cloudinary.uploader.upload(req.file.path);
    }

    const post = new postSchema({
        userId: ObjectId(userId),
        title: title,
        content: result.secure_url || content,
        postStatus: postStatus,
        hashtags: hashtags,
        taggedUsers: taggedUsers,
        cloudinaryId: result.public_id,
    });
    post.save(function (error, post) {
        if (error) {
            console.log(error);
            return res.status(500).send({ message: "Server Error" });
        }
        const { userId, title, content, createdAt, likes, comments, hashtags, taggedUsers, cloudinaryId } = post;
        res.status(201).json({
            userId: userId,
            postId: post._id,
            hashtags: hashtags,
            taggedUsers: taggedUsers,
            postStatus: postStatus,
            title: title,
            content: content,
            cloudinaryId: cloudinaryId,
            createdAt: createdAt,
            likes: likes,
            comments: comments,
            message: "Post Created Successfully"
        });
    });
}

const getPostById = async (req, res) => {
    const { postId } = req.params;

    postSchema.findById(postId, function (error, post) {
        if (error) {
            console.log(error);
            return res.status(500).send({ message: "Server Error" });
        }
        const { userId, title, content, createdAt, likes, comments, hashtags, taggedUsers } = post;
        res.status(200).json({
            userId: userId,
            title: title,
            content: content,
            hashtags: hashtags,
            taggedUsers: taggedUsers,
            createdAt: createdAt,
            likes: likes,
            comments: comments,
            postStatus: post.postStatus,
            message: "Post Found"
        });
    });
}

const updatePost = async (req, res) => {
    const { postId } = req.params;
    const { title, content, postStatus, hashtags, taggedUsers } = req.body;
    const { userId } = req.user;

    postSchema.findById(postId, function (error, post) {
        if (error) {
            console.log(error);
            return res.status(500).send({ message: "Server Error" });
        }
        if (JSON.stringify(post.userId) !== JSON.stringify(userId)) {
            console.log(post.userId, userId);
            return res.status(403).send({ message: "You are not authorized to update this post" });
        }
        postSchema.findByIdAndUpdate(postId, {
            title: title,
            content: content,
            postStatus: postStatus,
            hashtags: hashtags,
            taggedUsers: taggedUsers,
            createdAt: Date.now()
        }, { new: true }, function (error, post) {
            if (error) {
                console.log(error);
                return res.status(500).send({ message: "Server Error" });
            }

            const { userId, title, content, createdAt, likes, comments, hashtags, taggedUsers } = post;
            res.status(200).json({
                userId: userId,
                postId: post._id,
                hashtags: hashtags,
                taggedUsers: taggedUsers,
                postStatus: postStatus,
                title: title,
                content: content,
                createdAt: createdAt,
                likes: likes,
                comments: comments,
                message: "Post Updated Successfully"
            });
        });
    });
}

const deletePost = async (req, res) => {
    const { postId } = req.params;
    const { userId } = req.user;

    postSchema.findById(postId, async function (error, post) {
        if (error) {
            console.log(error);
            return res.status(500).send({ message: "Server Error" });
        }
        if (JSON.stringify(post.userId) !== JSON.stringify(userId)) {
            return res.status(403).send({ message: "You are not authorized to delete this post" });
        }
        if (post.cloudinaryId) {
            await cloudinary.uploader.destroy(post.cloudinaryId);
        }

        const { likes, comments } = post;
        likes.forEach(like => {
            userSchema.findByIdAndUpdate(like.userId, { $pull: { liked_posts: postId } }, { new: true }, function (error, user) {
                if (error) {
                    console.log(error);
                    return res.status(500).send({ message: "Server Error" });
                }
            });
        });

        comments.forEach(comment => {
            userSchema.findByIdAndUpdate(comment.userId, { $pull: { commented_posts: postId } }, { new: true }, function (error, user) {
                if (error) {
                    console.log(error);
                    return res.status(500).send({ message: "Server Error" });
                }
            });
        });

        postSchema.findByIdAndDelete(postId, function (error, post) {
            if (error) {
                console.log(error);
                return res.status(500).send({ message: "Server Error" });
            }
            res.status(200).json({
                message: "Post Deleted Successfully"
            });
        });
    });
}

const getPublicPosts = async (req, res) => {
    const { userId } = req.user;

    postSchema.find({ postStatus: "public" }, function (error, posts) {
        if (error) {
            console.log(error);
            return res.status(500).send({ message: "Server Error" });
        }

        userSchema.findById(userId, function (error, user) {
            if (error) {
                console.log(error);
                return res.status(500).send({ message: "Server Error" });
            }

            const filteredPosts = posts.filter(post => {
                return (
                    user.blocked_by.includes(post.userId) || user.blocked_users.includes(post.userId) ? false : true
                );
            });

            res.status(200).json({
                posts: filteredPosts,
                postsCount: filteredPosts.length,
                message: "Posts Found"
            });
        });
    }).sort({ createdAt: -1 });
}

const getRandomPost = async (req, res) => {
    const { userId } = req.user;

    postSchema.find({ $and: [{ userId: { $ne: ObjectId(userId) } }, { postStatus: "public" }] }, function (error, posts) {
        if (error) {
            console.log(error);
            return res.status(500).send({ message: "Server Error" });
        }

        userSchema.findById(userId, function (error, user) {
            if (error) {
                console.log(error);
                return res.status(500).send({ message: "Server Error" });
            }

            const filteredPosts = posts.filter(post => {
                return (
                    user.blocked_by.includes(post.userId) || user.blocked_users.includes(post.userId) ? false : true
                );
            });

            if (filteredPosts.length === 0) {
                return res.status(200).json({
                    message: "No Posts Found"
                });
            }

            const randomPost = filteredPosts[Math.floor(Math.random() * filteredPosts.length)];
            res.status(200).json({
                post: randomPost,
                message: "Post Found"
            });
        });
    });
}

const addLike = async (req, res) => {
    const { postId } = req.params;
    const { userId } = req.user;

    const likedObject = {
        userId: ObjectId(userId)
    }

    postSchema.findById(postId, function (error, post) {
        if (error) {
            console.log(error);
            return res.status(500).send({ message: "Server Error" });
        }

        if (!post) {
            return res.status(404).send({ message: "Post Not Found" });
        }
        const { likes } = post;
        const isLiked = likes.find(like => like.userId == userId);
        if (isLiked) {
            return res.status(200).json({
                message: "Already Liked",
                likesCount: likes.length
            });
        }
        postSchema.findByIdAndUpdate(postId, {
            $push: { likes: likedObject }
        }, { new: true }, function (error, post) {
            if (error) {
                console.log(error);
                return res.status(500).send({ message: "Server Error" });
            }

            userSchema.findByIdAndUpdate(userId, { $push: { liked_posts: postId } }, function (error, user) {
                if (error) {
                    console.log(error);
                    return res.status(500).send({ message: "Server Error" });
                }

                const { likes } = post;
                res.status(200).json({
                    likesCount: likes.length,
                    message: "Like added Successfully"
                });
            });
        });
    });
}


const addComment = async (req, res) => {
    const { postId } = req.params;
    const { userId } = req.user;
    const { comment } = req.body;

    postSchema.findByIdAndUpdate(postId, { $push: { comments: { userId: userId, content: comment } } }, { new: true }, function (error, post) {
        if (error) {
            console.log(error);
            return res.status(500).send({ message: "Server Error" });
        }

        userSchema.findByIdAndUpdate(userId, { $push: { commented_posts: postId } }, function (error, user) {
            if (error) {
                console.log(error);
                return res.status(500).send({ message: "Server Error" });
            }

            const { comments } = post;
            res.status(200).json({
                comments: comments,
                message: "Comment Added Successfully"
            });
        });
    });
}

const getUsersWhoLikedPost = async (req, res) => {
    const { postId } = req.params;

    postSchema.findById(postId, function (error, post) {
        if (error) {
            console.log(error);
            return res.status(500).send({ message: "Server Error" });
        }
        const { likes } = post;

        userSchema.find({ _id: { $in: likes.map(like => like.userId) } }, function (error, users) {
            if (error) {
                console.log(error);
                return res.status(500).send({ message: "Server Error" });
            }

            const resultUsers = users.map(user => {
                return {
                    name: user.name,
                    user_name: user.user_name,
                    userId: user._id,
                    profile: user.profile,
                }
            });
            res.status(200).json({
                users: resultUsers,
                likesCount: resultUsers.length,
                message: "Users who liked post"
            });
        }).sort({ createdAt: -1 });
    });
}

const getComments = async (req, res) => {
    const { postId } = req.params;

    postSchema.findById(postId, function (error, post) {
        if (error) {
            console.log(error);
            return res.status(500).send({ message: "Server Error" });
        }

        const comments = post.comments.map(comment => {
            return {
                content: comment.content,
                createdAt: comment.createdAt,
            };
        });

        res.status(200).json({
            comments: comments,
            commentsCount: comments.length,
            message: "Comments on post"
        });
    });
}

const removeLike = async (req, res) => {
    const { postId } = req.params;
    const { userId } = req.user;

    postSchema.findById(postId, function (error, result) {
        if (error) {
            console.log(error);
            return res.status(500).send({ message: "Server Error" });
        }

        const { likes } = result;
        const isLiked = likes.find(like => like.userId == userId);
        if (!isLiked) {
            return res.status(200).json({
                message: "Already Unliked",
                likesCount: likes.length
            });
        }

        postSchema.findByIdAndUpdate(postId, {
            $pull: { likes: { userId: userId } }
        }, { new: true }, function (error, post) {
            if (error) {
                console.log(error);
                return res.status(500).send({ message: "Server Error" });
            }

            userSchema.findByIdAndUpdate(userId, { $pull: { liked_posts: postId } }, function (error, user) {
                if (error) {
                    console.log(error);
                    return res.status(500).send({ message: "Server Error" });
                }

                const { likes } = post;
                res.status(200).json({
                    likesCount: likes.length,
                    message: "Like removed Successfully"
                });
            });
        });
    });
}

const getTimeline = async (req, res) => {
    const { userId } = req.user;

    userSchema.findById(userId, function (error, user) {
        if (error) {
            console.log(error);
            return res.status(500).send({ message: "Server Error" });
        }

        const { following } = user;

        let followingUsersIds;
        if (following) {
            followingUsersIds = following.map(followingUser => followingUser);
        }
        followingUsersIds.push(userId);
        postSchema.find({ userId: { $in: followingUsersIds } }, function (error, posts) {
            if (error) {
                console.log(error);
                return res.status(500).send({ message: "Server Error" });
            }

            const resultPosts = posts.map(post => {
                return {
                    _id: post._id,
                    userId: post.userId,
                    user_name: post.user_name,
                    profile: post.profile,
                    content: post.content,
                    createdAt: post.createdAt,
                    likesCount: post.likes.length,
                    commentsCount: post.comments.length,
                    isLiked: post.likes.find(like => like.userId == userId) ? true : false,
                    isCommented: post.comments.find(comment => comment.userId == userId) ? true : false,
                }
            });
            res.status(200).json({
                posts: resultPosts,
                postsCount: resultPosts.length,
                message: "Timeline"
            });
        }).sort({ createdAt: -1 });
    });
}


module.exports = { createPost, getPostById, updatePost, deletePost, getPublicPosts, addLike, addComment, getUsersWhoLikedPost, getComments, getRandomPost, removeLike, getTimeline };