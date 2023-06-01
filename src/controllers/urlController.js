const urlModel = require("../models/urlModel");
const {nanoid} = require("nanoid");

const createURL = async function(req,res){
  const shortId = nanoid(8);
  let data = req.body;
  let savedData = await urlModel.create({
    shortId: shortId,
    redirectUrl: req.body.url
  });
  res.status(201).send({status:true,msg:savedData})
}

module.exports = {createURL}