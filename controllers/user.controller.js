const userSchema = require('../models/userSchema');
const postSchema = require('../models/postSchema');
const { ObjectId } = require('mongoose').Types;
const { cloudinary } = require('../utils/cloudinary');

const { Encrypt, Decrypt } = require('../security/bcrypt');
const { getToken } = require('../security/jwt');

const signup = async (req, res) => {
    const { name, email, password, user_name, phone_number, gender, profile } = req.body;
    const encryptedPassword = await Encrypt(password);

    userSchema.find({ $or: [{ email: email }, { user_name: user_name }, { phone_number: phone_number }] }, (err, users) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ message: "Server Error" });
        }

        if (users.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        const newUser = new userSchema({
            name: name,
            email: email,
            password: encryptedPassword,
            user_name: user_name,
            phone_number: phone_number,
            gender: gender,
            profile: profile,
        });

        newUser.save((err, user) => {
            if (err) {
                console.log(err);
                return res.status(500).send({ message: "Server Error" });
            }

            const { _id, name, email, user_name, phone_number, profile, gender, createdAt } = user;
            return res.status(201).json({
                message: "Signup Successful",
                userId: _id,
                name: name,
                email: email,
                user_name: user_name,
                phone_number: phone_number,
                profile: profile,
                gender: gender,
                createdAt: createdAt
            });
        });
    });
}

const login = async (req, res) => {
    const { user_name, password } = req.body;

    userSchema.findOne({ user_name: user_name }, async function (error, foundUser) {
        if (error) {
            console.log(error);
            return res.status(500).send({ message: "Server Error" });
        }

        if (!foundUser) {
            return res.status(400).send({ message: "User Not Found." });
        }

        const result = await Decrypt(password, foundUser.password);
        if (result === true) {
            const token = getToken({ userId: foundUser._id });
            const { name, email, user_name, user_id } = foundUser;
            res.status(200).json({
                name: name,
                email: email,
                user_name: user_name,
                token: token,
                message: "Login Successful"
            });
        } else {
            res.status(400).send({ message: "Incorrect Password." })
        }
    });
}

const addFollowing = async (req, res) => {
    const { userId } = req.user;
    const { followingId } = req.body;

    userSchema.findById(userId, function (error, user) {
        if (error) {
            console.log(error);
            return res.status(500).send({ message: "Server Error" });
        }

        const { following } = user;
        if (following.includes(ObjectId(followingId))) {
            return res.status(400).send({ message: "Already Following" });
        }
        userSchema.findByIdAndUpdate(userId, { $push: { following: followingId } }, { new: true }, function (error, followingUser) {
            if (error) {
                console.log(error);
                return res.status(500).send({ message: "Server Error" });
            }
            userSchema.findByIdAndUpdate(followingId, { $push: { followers: userId } }, function (error, followedUser) {
                if (error) {
                    console.log(error);
                    return res.status(500).send({ message: "Server Error" });
                }

                const { following, followers } = followingUser;
                res.status(200).json({
                    message: "Following Added",
                    followingCount: following.length,
                    followersCount: followers.length
                });
            })
        });
    });
}

const removeFollowing = async (req, res) => {
    const { userId } = req.user;
    const { followingId } = req.body;

    userSchema.findById(userId, function (error, user) {
        if (error) {
            console.log(error);
            return res.status(500).send({ message: "Server Error" });
        }

        const { following } = user;
        if (!following.includes(ObjectId(followingId))) {
            return res.status(400).send({ message: "Not Following" });
        }
        userSchema.findByIdAndUpdate(userId, { $pull: { following: followingId } }, { new: true }, function (error, unfollowingUser) {
            if (error) {
                console.log(error);
                return res.status(500).send({ message: "Server Error" });
            }

            userSchema.findByIdAndUpdate(followingId, { $pull: { followers: userId } }, function (error, unfollowedUser) {
                if (error) {
                    console.log(error);
                    return res.status(500).send({ message: "Server Error" });
                }

                const { following, followers } = unfollowingUser;
                res.status(200).json({
                    message: "Following Removed",
                    followingCount: following.length,
                    followersCount: followers.length
                });
            });
        });
    });
}

const getFollowing = async (req, res) => {
    const { userId } = req.user;

    userSchema.findById(userId, function (error, user) {
        if (error) {
            console.log(error);
            return res.status(500).send({ message: "Server Error" });
        }

        const { following } = user;
        userSchema.find({ _id: { $in: following } }, function (error, followingUsers) {
            if (error) {
                console.log(error);
                return res.status(500).send({ message: "Server Error" });
            }

            const followingUsersData = followingUsers.map(user => {
                const { _id, name, email, user_name } = user;
                return { _id, name, email, user_name };
            });

            res.status(200).json({
                message: "Following Users",
                followingUsers: followingUsersData,
                followingCount: following.length
            });
        });
    });
}

const getFollowers = async (req, res) => {
    const { userId } = req.user;

    userSchema.findById(userId, function (error, user) {
        if (error) {
            console.log(error);
            return res.status(500).send({ message: "Server Error" });
        }

        const { followers } = user;
        userSchema.find({ _id: { $in: followers } }, function (error, followersUsers) {
            if (error) {
                console.log(error);
                return res.status(500).send({ message: "Server Error" });
            }

            const followersUsersData = followersUsers.map(user => {
                const { _id, name, email, user_name, } = user;
                return {
                    _id,
                    name,
                    email,
                    user_name,
                }
            });

            res.status(200).json({
                message: "Followers Users",
                followersUsers: followersUsersData,
                followersCount: followers.length
            });
        });
    });
}

const updateUser = async (req, res) => {
    const { userId } = req.user;
    const { name, email, user_name, phone_number, gender, profile } = req.body;

    userSchema.findByIdAndUpdate(userId, {
        name: name,
        email: email,
        user_name: user_name,
        phone_number: phone_number,
        gender: gender,
        profile: profile
    }, { new: true }, function (error, user) {
        if (error) {
            console.log(error);
            return res.status(500).send({ message: "Server Error" });
        }

        const { name, email, user_name, phone_number, gender, profile } = user;
        res.status(200).json({
            name: name,
            email: email,
            user_name: user_name,
            phone_number: phone_number,
            gender: gender,
            profile: profile,
            message: "User Updated"
        });
    });
}

const deleteUser = async (req, res) => {
    const { userId } = req.user;

    userSchema.findById(userId, function (error, user) {
        if (error) {
            console.log(error);
            return res.status(500).send({ message: "Server Error" });
        }

        const { following, followers, liked_posts, commented_posts, blocked_users, blocked_by } = user;
        following.forEach(followingId => {
            userSchema.findByIdAndUpdate(followingId, { $pull: { followers: userId } }, function (error, unfollowedUser) {
                if (error) {
                    console.log(error);
                    return res.status(500).send({ message: "Server Error" });
                }
            });
        });

        followers.forEach(followersId => {
            userSchema.findByIdAndUpdate(followersId, { $pull: { following: userId } }, function (error, unfollowingUser) {
                if (error) {
                    console.log(error);
                    return res.status(500).send({ message: "Server Error" });
                }
            });
        });

        liked_posts.forEach(likedPostId => {
            postSchema.findByIdAndUpdate(likedPostId, { $pull: { likes: { userId: userId } } }, function (error, unlikedPost) {
                if (error) {
                    console.log(error);
                    return res.status(500).send({ message: "Server Error" });
                }
            });
        });

        commented_posts.forEach(commentedPostId => {
            postSchema.findByIdAndUpdate(commentedPostId, { $pull: { comments: { userId: userId } } }, function (error, uncommentedPost) {
                if (error) {
                    console.log(error);
                    return res.status(500).send({ message: "Server Error" });
                }
            });
        });

        blocked_users.forEach(blockedUserId => {
            userSchema.findByIdAndUpdate(blockedUserId, { $pull: { blocked_by: userId } }, function (error, unblockedUser) {
                if (error) {
                    console.log(error);
                    return res.status(500).send({ message: "Server Error" });
                }
            });
        });

        blocked_by.forEach(blockedById => {
            userSchema.findByIdAndUpdate(blockedById, { $pull: { blocked_users: userId } }, function (error, unblockedByUser) {
                if (error) {
                    console.log(error);
                    return res.status(500).send({ message: "Server Error" });
                }
            });
        });

        postSchema.find({ userId: userId }, async function (error, posts) {
            if (error) {
                console.log(error);
                return res.status(500).send({ message: "Server Error" });
            }


            posts.forEach(post => {
                const { _id } = post;
                postSchema.findByIdAndDelete(_id, async function (error, deletedPost) {
                    if (error) {
                        console.log(error);
                        return res.status(500).send({ message: "Server Error" });
                    }
                    const { cloudinaryId } = deletedPost;

                    if (cloudinaryId) {
                        await cloudinary.uploader.destroy(cloudinaryId);
                    }
                });
            });
        });

        userSchema.findByIdAndDelete(userId, function (error, deletedUser) {
            if (error) {
                console.log(error);
                return res.status(500).send({ message: "Server Error" });
            }

            res.status(200).json({
                message: "User Deleted"
            });
        });
    });
}

const changePassword = async (req, res) => {
    const { userId } = req.user;
    const { oldPassword, newPassword } = req.body;
    const encryptedPassword = await Encrypt(newPassword);
    if (oldPassword === newPassword) {
        return res.status(400).json({ message: "New Password is same as old password" });
    }
    userSchema.findById(userId, async (error, user) => {
        if (error) {
            console.log(error);
            return res.status(500).send({ message: "Server Error" });
        }

        const { user_name, password } = user;
        const result = await Decrypt(oldPassword, password);
        if (result) {
            userSchema.findByIdAndUpdate(userId, {
                password: encryptedPassword
            }, function (error, user) {
                if (error) {
                    console.log(error);
                    return res.status(500).send({ message: "Server Error" });
                }

                res.status(200).json({
                    message: "Password Changed",
                    user_name: user_name,
                })
            });
        } else {
            return res.status(400).json({ message: "Old Password is incorrect" });
        }
    });
}

const blockUser = async (req, res) => {
    const { userId } = req.user;
    const { blockedUserId } = req.body;

    userSchema.findById(userId, function (error, user) {
        if (error) {
            console.log(error);
            return res.status(500).send({ message: "Server Error" });
        }

        const { blocked_users } = user;
        if (blocked_users.includes(blockedUserId)) {
            return res.status(400).json({ message: "User is already blocked" });
        }

        const { following, followers } = user;
        if (following.includes(blockedUserId)) {
            userSchema.findByIdAndUpdate(userId, {
                $pull: { following: blockedUserId }
            }, function (error, user) {
                if (error) {
                    console.log(error);
                    return res.status(500).send({ message: "Server Error" });
                }

                userSchema.findByIdAndUpdate(blockedUserId, {
                    $pull: { followers: userId }
                }, function (error, user) {
                    if (error) {
                        console.log(error);
                        return res.status(500).send({ message: "Server Error" });
                    }
                });
            });
        }
        if (followers.includes(blockedUserId)) {
            userSchema.findByIdAndUpdate(userId, {
                $pull: { followers: blockedUserId }
            }, function (error, user) {
                if (error) {
                    console.log(error);
                    return res.status(500).send({ message: "Server Error" });
                }

                userSchema.findByIdAndUpdate(blockedUserId, {
                    $pull: { following: userId }
                }, function (error, user) {
                    if (error) {
                        console.log(error);
                        return res.status(500).send({ message: "Server Error" });
                    }
                });
            });
        }

        userSchema.findByIdAndUpdate(userId, { $push: { blocked_users: blockedUserId } }, function (error, user) {
            if (error) {
                console.log(error);
                return res.status(500).send({ message: "Server Error" });
            }

            userSchema.findByIdAndUpdate(blockedUserId, { $push: { blocked_by: userId } }, function (error, user) {
                if (error) {
                    console.log(error);
                    return res.status(500).send({ message: "Server Error" });
                }

                res.status(200).json({
                    message: "User Blocked"
                });
            });
        });
    });
}

const unblockUser = async (req, res) => {
    const { userId } = req.user;
    const { unblockedUserId } = req.body;

    userSchema.findById(userId, function (error, user) {
        if (error) {
            console.log(error);
            return res.status(500).send({ message: "Server Error" });
        }

        const { blocked_users } = user;
        if (!blocked_users.includes(unblockedUserId)) {
            return res.status(400).json({ message: "User is not blocked" });
        }

        userSchema.findByIdAndUpdate(userId, { $pull: { blocked_users: unblockedUserId } }, function (error, user) {
            if (error) {
                console.log(error);
                return res.status(500).send({ message: "Server Error" });
            }

            userSchema.findByIdAndUpdate(unblockedUserId, { $pull: { blocked_by: userId } }, function (error, user) {
                if (error) {
                    console.log(error);
                    return res.status(500).send({ message: "Server Error" });
                }

                res.status(200).json({
                    message: "User Unblocked"
                });
            });
        });
    });
}

const getUser = async (req, res) => {
    const { userId } = req.user;

    userSchema.findById(userId, function (error, user) {
        if (error) {
            console.log(error);
            return res.status(500).send({ message: "Server Error" });
        }

        const { user_name, email, _id, phone_number, gender, profile } = user;
        res.status(200).json({
            user_name: user_name,
            email: email,
            _id: _id,
            phone_number: phone_number,
            gender: gender,
            profile: profile
        });
    });
}

const getBlockedUsers = async (req, res) => {
    const { userId } = req.user;

    userSchema.findById(userId, function (error, user) {
        if (error) {
            console.log(error);
            return res.status(500).send({ message: "Server Error" });
        }

        const { blocked_users } = user;

        userSchema.find({ _id: { $in: blocked_users } }, function (error, users) {
            if (error) {
                console.log(error);
                return res.status(500).send({ message: "Server Error" });
            }

            res.status(200).json({
                users: users
            });
        });
    });
}

const getAllLikedPosts = async (req, res) => {
    const { userId } = req.user;

    userSchema.findById(userId, async function (error, user) {
        if (error) {
            console.log(error);
            return res.status(500).send({ message: "Server Error" });
        }

        const { liked_posts } = user;

        const posts = [];
        for (let i = 0; i < liked_posts.length; i++) {
            const post = await postSchema.findById(liked_posts[i]);
            posts.push(post);
        }

        res.status(200).json({
            posts: posts,
            postsCount: posts.length,
            "message": "Liked Posts"
        });
    })
}

const getUserPosts = async (req, res) => {
    const { userId } = req.user;

    postSchema.find({ userId: userId }, function (error, posts) {
        if (error) {
            console.log(error);
            return res.status(500).send({ message: "Server Error" });
        }

        res.status(200).json({
            posts: posts,
            postsCount: posts.length,
            "message": "User Posts"
        });
    }).sort({ created_at: -1 });
}

module.exports = { signup, login, getUser, addFollowing, removeFollowing, getFollowing, getFollowers, getUserPosts, updateUser, deleteUser, changePassword, blockUser, unblockUser, getBlockedUsers, getAllLikedPosts };