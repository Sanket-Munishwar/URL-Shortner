const checkValidUrl = require('valid-url');
const axios = require('axios');
const shortId = require('shortid');
const urlModel = require('../model/urlModel');
const { SET_ASYNC, GET_ASYNC } = require('../redis/redis');



const createShortUrl = async function (req, res) {
    try {
        let data = req.body
        let longUrl = data.longUrl
        //======long URL validation=====

        if (!longUrl || longUrl == "") {
            res.status(400).send({ status: false, msg: "Long Url is required and Long Url cannot be empty" })
        }
        if (typeof longUrl != "string") {
            res.status(400).send({ status: false, msg: "Long Url's type should be string only" })
        }
        if (!checkValidUrl.isWebUri(longUrl.trim())) {
            return res.status(400).send({ status: false, message: "Please Enter a valid URL." });
        }





        //=====check data present in redis cache or not=====//
        let cacheUrl = await GET_ASYNC(longUrl);

        if (cacheUrl) {
            const { shortUrl } = JSON.parse(cacheUrl);
            return res.status(200).send({ status: true, message: 'Already available', shortUrl });
        }

        //=====check if long URL exists in database and set in redis cahche======//
        const findUrlDetails = await urlModel.findOne({ longUrl: longUrl }).select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 });
        if (findUrlDetails) {
            await SET_ASYNC(longUrl, JSON.stringify({ urlCode: findUrlDetails.urlCode, shortUrl: findUrlDetails.shortUrl }), 'EX', 24 * 60 * 60);
            return res.status(200).send({ status: true, message: 'Already exist', shortUrl: findUrlDetails.shortUrl });
        }

        //====if long url is unique then generate URL code and short URL=====
        const isValidUrl = axios.get(longUrl).then().catch(err => { return res.status(404).json({ status: false, message: "Please, Provide Valid URL" }) });
        let uniqueUrlCode = shortId.generate();
        let urlCode = uniqueUrlCode;
        data.urlCode = uniqueUrlCode;
        let shortUrl = "http://127.0.0.1:3000/" + uniqueUrlCode;
        data.shortUrl = shortUrl.toLowerCase();

        //====here we are creating tha data=====
        const createUrlData = await urlModel.create(data);
        await SET_ASYNC(longUrl, JSON.stringify({ urlCode, shortUrl }), 'EX', 24 * 60 * 60);
        const finalResult = await urlModel.findById(createUrlData._id).select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 });
        res.status(201).send({ status: true, data: finalResult });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

const getURL = async function (req, res) {
    try {
        let { urlCode } = req.params;
        let cachedUrl = await GET_ASYNC(urlCode);

        if (cachedUrl) {
            const { longUrl } = JSON.parse(cachedUrl);
            return res.redirect(longUrl);
        }


        const getData = await urlModel.findOne({ urlCode: urlCode });

        if (!getData) {
            return res.status(400).send({ status: false, msg: "invalid urlcode" });

        }
        await SET_ASYNC(getData.urlCode, JSON.stringify({ longUrl: getData.longUrl }), 'EX', 24 * 60 * 60);
        res.status(303).redirect(getData.longUrl);
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
    }
}
module.exports.createShortUrl = createShortUrl
module.exports.getURL = getURL;