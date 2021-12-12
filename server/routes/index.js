const express = require('express');
const router = express.Router();
const {Image} = require("../models");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const upload = multer({ dest: "public/uploads" });
const SECRET = "big big SeCret";
const jwtCheck = require("../service");

router.get("/download/:id", async (req, res, next) => {
    const path = req.params.id;
    const file = fs.createReadStream(`public/uploads/${path}`);
    const filename = new Date().toISOString();
    res.setHeader(
      "Content-Disposition",
      'attachment: filename="' + filename + '"'
    );
    file.pipe(res);
  });
  
  router.post("/uploads", upload.single("image"), async function (req, res, next) {
    let filedata = req.file;
    const jwt = jwtCheck(req, SECRET);
    if (!filedata) res.send(JSON.stringify("Error"));
    if (jwt) {
      let url = filedata.path.replace(/public\//, "");
      let originalFileName = filedata.filename;
      let image = Image.create({
        url,
        originalFileName,
      });
      const { dataValues } = await image;
      res.json(dataValues);
    }
  });

  module.exports = router;