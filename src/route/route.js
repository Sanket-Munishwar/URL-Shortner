const express = require('express');
const authorCtrl=require('../controllers/authorController');
const blogCtrl=require('../controllers/blogController');
const mid = require('../middlewares/middleware')
const authmid=require('../middlewares/authmid')

const router = express.Router();



router.post('/authors',mid.reqBodyCheck,mid.missingFieldAuthor,mid.validEmail,mid.uniqueEmail,mid.validPassword,authorCtrl.createAuthor);//aditya 
router.post('/blogs',mid.reqBodyCheck,mid.missingFieldBlog,authmid.authenticationMid,mid.validAuthor, blogCtrl.createBlog);//Aditya 
router.get('/blogs' ,authmid.authenticationMid,blogCtrl.getBlogData);//pallavi 

router.put("/blogs/:blogId",mid.reqBodyCheck, mid.validBlogId,authmid.authenticationMid,authmid.authorizationMid, blogCtrl.updatedBlog);//preeti

router.delete('/blogs/:blogId',mid.validBlogId,authmid.authenticationMid,authmid.authorizationMid,blogCtrl.deleteBlogByPathParam);//swarnendu 
router.delete("/blogs", authmid.authenticationMid, blogCtrl.deleteBlogByQueryParam);//swarnendu
router.post("/login", mid.reqBodyCheck,mid.validEmail,authorCtrl.loginAuthor);
 
 
module.exports = router; 