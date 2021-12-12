
const Sequelize = require("sequelize");
const cors = require("cors");
const { graphqlHTTP: express_graphql } = require("express-graphql");
const jwtCheck = require("./service");
const {User} = require("./models");
const resolvers = require("./resolvers");
const schema = require("./schema");
const SECRET = "big big SeCret";
const app = require("express")();
const express = require("express");
const router = require('./routes');
const sequelize = new Sequelize("project", "postgres", "1300", {
  dialect: "postgres",
  host: "localhost",
  port: 5001,
});

app.use(cors());
app.use(express.static("public"));


(async () => {
    //const vasya = await User.create({email: 'artem@gmail.com', password: '123', role: "ADMIN"})
})();

  
app.use(router);

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


app.listen(5002, console.log("Starting"));
