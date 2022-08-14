const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const { signup, login, getUser, addFollowing, removeFollowing, getFollowers, getFollowing, updateUser, deleteUser, changePassword, blockUser, getBlockedUsers, unblockUser, getAllLikedPosts, getUserPosts } = require("../controllers/user.controller");
const { dataValidator } = require("../middlewares/dataValidator");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.post("/signup",
    body("email", "Email is required").not().isEmpty(),
    body("email", "Email is invalid").isEmail().normalizeEmail(),
    body("password", "Password is required").not().isEmpty(),
    body("password", "Password must be more than 7 characters").isLength({ min: 8 }),
    body('password', 'Password must be at least one uppercase letter').matches(/[A-Z]/),
    body('password', 'Password must be at least one lowercase letter').matches(/[a-z]/),
    body('password', 'Password must be at least one number').matches(/[0-9]/),
    body('password', 'Password must be at least one special character').matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/),
    dataValidator, signup);

router.post("/login", login);
router.get("/", authMiddleware, getUser);
router.post("/follow", authMiddleware, addFollowing);
router.post("/unfollow", authMiddleware, removeFollowing);
router.get("/followers", authMiddleware, getFollowers);
router.get("/following", authMiddleware, getFollowing);
router.get("/posts", authMiddleware, getUserPosts);
router.put("/", authMiddleware, updateUser);
router.delete("/", authMiddleware, deleteUser);
router.put("/password",
    body("newPassword", "New Password is required").not().isEmpty(),
    body("newPassword", "New Password must be more than 7 characters").isLength({ min: 8 }),
    body('newPassword', 'New Password must be at least one uppercase letter').matches(/[A-Z]/),
    body('newPassword', 'New Password must be at least one lowercase letter').matches(/[a-z]/),
    body('newPassword', 'New Password must be at least one number').matches(/[0-9]/),
    body('newPassword', 'New Password must be at least one special character').matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/),
    dataValidator, authMiddleware, changePassword);
router.post("/block", authMiddleware, blockUser);
router.get("/blocked", authMiddleware, getBlockedUsers);
router.post("/unblock", authMiddleware, unblockUser);
router.get("/liked", authMiddleware, getAllLikedPosts);

module.exports = router;