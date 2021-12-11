
const Sequelize = require("sequelize");
const cors = require("cors");
const sequelize = new Sequelize("project", "postgres", "1300", {
  dialect: "postgres",
  host: "localhost",
  port: 5001,
});
const { graphqlHTTP: express_graphql } = require("express-graphql");
const jwtCheck = require("./service");
const {User,Device,Order,OrderDevice,Image} = require("./models");
const resolvers = require("./resolvers");
const schema = require("./schema");

const jwt = require("jsonwebtoken");
const SECRET = "big big SeCret";

const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest: "public/uploads" });

const app = require("express")();
const express = require("express");

app.use(cors());
app.use(express.static("public"));



(async () => {
    //const vasya = await User.create({email: 'artem@gmail.com', password: '123', role: "ADMIN"})
})();


app.get("/download/:id", async (req, res, next) => {
  const path = req.params.id;
  const file = fs.createReadStream(`public/uploads/${path}`);
  const filename = new Date().toISOString();
  res.setHeader(
    "Content-Disposition",
    'attachment: filename="' + filename + '"'
  );
  file.pipe(res);
});

app.post("/uploads", upload.single("image"), async function (req, res, next) {
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

app.use(
  "/graphql",
  express_graphql(async (req, res) => {
    const jwt = jwtCheck(req, SECRET);
    
    if (jwt) {
      const thisUser = await User.findOne({where: {email:jwt.sub}});
      return {
        schema, //jwt
        rootValue: resolvers,
        graphiql: true,
        context: { jwt, thisUser },
      };
    }
    return {
      schema, //anon
      rootValue: resolvers,
      graphiql: true,
      context: {},
    };
  })
);

sequelize.sync();
//sequelize.sync({force:true});

app.listen(5002, console.log("Starting"));
