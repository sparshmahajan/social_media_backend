# REST API server for SocialMedia-Backend

## ENV Vars

```env
MONGODB_URL=Your_Mongo_Database_URL
APP_SECRET=token_encryption_secret_for_jwt
CLOUDINARY_CLOUD_NAME=cloudinary_cloud_name
CLOUDINARY_API_KEY=cloudinary_api_key
CLOUDINARY_API_SECRET=cloudinary_api_secret
```

```
## important : "/api" is used with every path before the URLs given

## API DOCS

### USER ROUTES
    
 ``` 
 ---

| Description            |                 URL              | Method |         Body         |   Status    |
| ---------------------- | -------------------------------- | ------ | -------------------- | ----------- |
|        Sign Up         |        /user/signup              | POST   |      SignUp body     | CREATED     |
|        LogIn           |        /user/login               | POST   | user_name, password  | OK          |
|   Get User details     |        /user                     | GET    |          \_\_        | OK          |
|   Update User details  |        /user                     | PUT    |      SignUp body     | OK          |
|   Remove User          |        /user                     | DELETE |          \_\_        | OK          |
|   Follow User          |        /user/follow              | POST   |    followingId       | OK          |
|   Unfollow User        |        /user/unfollow            | POST   |    followingId       | OK          |
|   Get followers List   |        /user/followers           | GET    |          \_\_        | OK          |
|   Get following List   |        /user/following           | GET    |          \_\_        | OK          |
|   Get User Posts       |        /user/posts               | GET    |          \_\_        | OK          |
|   Get all liked posts  |        /user/liked               | GET    |          \_\_        | OK          |
|   Block User           |        /user/block               | POST   |     blockedUserId    | OK          |
|   Unblock User         |        /user/unblock             | POST   |   unblockedUserId    | OK          |
|   Get Blocked Users    |        /user/blocked             | GET    |          \_\_        | OK          |
|   Change Password      |        /user/password            | PUT    |          \_\_        | OK          |

---


```json
SignUp Body = {
    "user_name": "your_user_name",
    "password": "your_password",
    "email": "your_email",
    "name": "your_name",
    "profile": "your_profile_status",
    "phone_number": "your_phone_number",
    "gender" : "your_gender"
}
```

---
### Posts Routes
| Description            |                 URL              | Method |         Body         |   Status    |
| ---------------------- | -------------------------------- | ------ | -------------------- | ----------- |
|   Create Post          |        /posts/create             | POST   |     Post Body        | CREATED     |
|   Get Post By its id   |        /:postId                  | GET    |          \_\_        | OK          |
|   Get Public Posts     |        /posts/get/public         | GET    |          \_\_        | OK          |
|   Update Post          |        /:postId                  | PUT    |     Post Body        | OK          |
|   Remove Post          |        /:postId                  | DELETE |          \_\_        | OK          |
|   Like Post            |        /:postId/like             | POST   |          \_\_        | OK          |
|   Add Comment          |        /:postId/comment          | POST   |          \_\_        | OK          |
|   Get Comments         |        /:postId/comments         | GET    |          \_\_        | OK          |
| Get User who liked post|        /:postId/likes            | GET    |          \_\_        | OK          |
|   Get Random Posts     |        /posts/get/random         | GET    |          \_\_        | OK          |
|   Remove Like          |        /:postId/like             | DELETE |          \_\_        | OK          |
|   Get user Timeline    |        /posts/get/timeline       | GET    |          \_\_        | OK          |
---


```json
Post Object = {
    "title": "Post Title",
    "content" : "content or image or video",
    "taggedUsers": [
        "user_id_1",
        "user_id_2",
        "user_id_3"
    ],
    "hashtags" : ["hashtags"],
    "postStatus": "public_or_private"
}
```


