const blog = require("../models/blog");
const blogModel = require("../models/blog");
const moment = require("moment");
const removeEmptyTags = function (arr) {
  return arr.filter(tag => tag.trim() !== '');
};
const createBlog = async function (req, res) {
  try {
    const data = req.body;
    const authdata = data.authorId;
    let authId = req.decodedToken.authorId;
    if (authdata != authId) {
      return res
        .status(404)
        .send({ status: false, msg: "not a valid author to create a blog" });
      //   if isDeleted true in database or we are passing different attributes in query params
    }
    data.tags = data.tags.filter(tag => tag.trim() !== '');
    data.subcategory = data.subcategory.filter(subcat => subcat.trim() !== '');


    const blog = await blogModel.create(data);
    res.status(201).send({ status: true, data: blog });
  } catch (error) {
    res.status(400).send({ status: false, msg: error.message });
  }
};


const getBlogData = async (req, res) => {
  try {
    let query = req.query;
    let authId = req.decodedToken.authorId;
    if (query["authorId"] != authId && query["authorId"])
      return res.status(404).send({ status: false, msg: "blog not found" });
    query.authorId = authId;
    query.isDeleted = false;
    query.isPublished = true;
     
    let doc = await blogModel.find(query);
    if (doc.length == 0) {
      return res.status(404).send({ status: false, msg: "Document not found" });
    }
    res.status(200).send({ status: true, msg: doc });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};
/**
 * This function validates the author ID and creates a new blog post if the author ID is valid and
 * present in the request.
 * @param req - The request object, which contains information about the incoming HTTP request.
 * @param res - The `res` parameter is the response object that is used to send the response back to
 * the client making the request. It contains methods and properties that allow you to set the status
 * code, headers, and body of the response.
 * @param next - next is a function that is called to pass control to the next middleware function in
 * the stack. If there are no more middleware functions left in the stack, it will pass control to the
 * route handler function.
 * @returns The function `validAuthor` is returning either a response with a status code and message if
 * there is an error, or calling the `next()` function if there are no errors. If `authId` is provided
 * in the request body, the function checks if it is a valid MongoDB ObjectId and if it exists in the
 * `authorModel`. If it does not pass these checks, an error response is
 */

const updatedBlog = async (req, res) => {
  try {
    const blogId = req.params.blogId;
    const { title, body, tags, subcategory } = req.body;

    let updateContent = {
      title: title,
      body: body,
      $push: { tags: tags, subcategory: subcategory },
      isPublished: true,
      publishedAt: `${moment()}`,
    };
   
    // Update the blog fields
    const updateBlog = await blogModel.findOneAndUpdate(
      { _id: blogId, isDeleted: false },
      updateContent,
      { new: true }
    );

    if (!updateBlog)
      return res
        .status(404)
        .send({ status: false, msg: "No such data present" });

    let tagSet = new Set([...updateBlog.tags]);
    let subSet = new Set([...updateBlog.subcategory]);
    updateBlog.tags = Array.from(tagSet);
    updateBlog.subcategory = Array.from(subSet);
    let pushData = await blogModel.findOneAndUpdate(
      { _id: blogId },
      updateBlog
    );

    // Return the updated blog document in the response
    res
      .status(200)
      .send({
        status: true,
        message: "Blog updated successfully",
        data: updateBlog,
      });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

const deleteBlogByPathParam = async (req, res) => {
  try {
    let bId = req.params.blogId;
    let blogData = await blogModel.findOne({ _id: bId, isDeleted: false });

    if (!blogData)
      return res.status(404).send({ status: false, msg: "Document not found" });

    let deletedBlog = await blogModel.findOneAndUpdate(
      { _id: bId },
      { isDeleted: true, deletedAt: `${moment()}` }
    );
    res.status(200).send({ status: true, message: "" });
  } catch (err) {
    res.status(500).send({ status: false, Error: err.message });
  }
};

const deleteBlogByQueryParam = async (req, res) => {
  try {
    let filterData = req.query;
    let authId = req.decodedToken.authorId;
    if (filterData["authorId"] != authId && filterData["authorId"])
      return res
        .status(404)
        .send({
          status: false,
          msg: "Filter AuthorID is not matched with login Author",
        });

    filterData["authorId"] = authId;
    let existData = await blogModel.findOne(filterData);

    if (!existData) {
      return res
        .status(404)
        .send({ status: false, msg: "Blog not Found of login Author" });
      //   if isDeleted true in database or we are passing different attributes in query params
    }
    if (existData.isDeleted)
      return res
        .status(400)
        .send({ status: false, msg: "Blog is already deleted" });

    let deletedBlog = await blogModel.updateMany(
      filterData,
      { isDeleted: true, deletedAt: `${moment()}` },
      { new: true }
    );

    res.status(200).send({ status: true, message: "" });
  } catch (err) {
    res.status(500).send({ status: false, ErrorMsg: err.message });
  }
};

module.exports = {
  createBlog,
  getBlogData,
  updatedBlog,
  deleteBlogByPathParam,
  deleteBlogByQueryParam,
};
