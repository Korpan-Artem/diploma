const schema = require("./schema");
const Sequelize = require("sequelize");
const cors = require("cors");
const jwt = require("jsonwebtoken")
const SECRET = "big big SeCret";
const {grapqlHTTP: express_graphql} = require("express-qraphql");
const express = require("express");
const app = require("express")();
const fs = require("fs");
const multer = require("multer");
app.use(express.static("public"));
const upload = multer({dest: "public/uploads"});

const sequelize = new Sequelize("shop123", "postgres", "1300",{
    dialect: "postgres",
    host: "localhost",
    port: 5001,
})

app.use(cors);

class User extends Sequelize.Model {}

User.init({
    id:{type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    email:{type: Sequelize.STRING, unique: true},
    password:{type: Sequelize.STRING},
    role:{type: Sequelize.STRING, defaultValues: "USER"}
},  {sequelize, modelName: "user"}
);

class Device extends Sequelize.Model {
    get image () {
        return this.getImage();
    }
}

Device.init({
    id:{type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    name:{type: Sequelize.STRING, allowNull: false},
    description:{type: Sequelize.STRING, allowNull: false},
    price:{type: Sequelize.INTEGER,allowNull: false},
    isDeleted:{type: Sequelize.BOOLEAN, defaultValues: false},
    qty:{type: Sequelize.INTEGER,allowNull: false},
}, {sequelize, modelName: "device"}
);

class Device extends Sequelize.Model {
    get image () {
        return this.getImage();
    }
}

Device.init({
    id:{type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    name:{type: Sequelize.STRING, allowNull: false},
    description:{type: Sequelize.STRING, allowNull: false},
    price:{type: Sequelize.INTEGER,allowNull: false},
    isDeleted:{type: Sequelize.BOOLEAN, defaultValues: false},
    qty:{type: Sequelize.INTEGER,allowNull: false},
}, {sequelize, modelName: "device"}
);


class Order extends Sequelize.Model {}

Order.init({
    id:{type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
}, {sequelize, modelName: "order"});

class OrderDevice extends Sequelize.Model {
    get order () {
        return this.getOrder();
    }
}

OrderDevice.init({
    id:{type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    count:{type: Sequelize.INTEGER},
    price:{type: Sequelize.INTEGER},
}, {sequelize, modelName: "orderDevice"});

class Image extends Sequelize.Model {}

Image.init({
    id:{type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    url:{type: Sequelize.STRING, allowNull: false},
    originalFileName:{type: Sequelize.STRING, allowNull: false},
}, {sequelize, modelName: "image"});

User.hasOne(Order);
Order.belongsTo(User);

OrderDevice.hasMany(Device);
Device.belongsTo(OrderDevice);

Image.hasMany(Device);
Device.belongsTo(Image);

const resolvers = {
    async getAllDevice() {
        return await Device.findAll({where: {isDeleted: false}});
    },
    async getAllDeviceAdmin(){
        return await Device.findAll();
    },

    async register ({email,password}) {
        if(!email || !password) return null;
        const oldUser = await User.findOne({where: {email}});
        if(oldUser) return null;
        const input = {email,password};
        const user = await User.create(input);
        const token = jwt.sign({
            sub: email,
            role: user.role
        }, SECRET)
        return token;
    }, 

    async AdUpsert({name,price,description,imageId }) {
        const input = {name, price,description, imageId};
        const device = await Device.create(input);
    },

    async deleteOrRestoreDevice({id, isDeleted}) {
        const device = await Device.findOne({where: {id}});
        if(!device) return null;
        device.isDeleted = isDeleted;
        return await device.save();
    },

    async getDevice({id}) {
        const device = await Device.findByPk(id);
        return await device;
    },

}

function jwtCheck (req,secret) {
    const authorization = req && req.headers && req.headers.authorization;

    if(authorization && authorization.strartsWith("Bearer ")) {
        const token = authorization.substr("Bearer ".length);
        let decoded;
        try {
            decoded = jwt.verify(token,secret);
        } catch (e) {
            return null;
        }
        return decoded;
    }
}

app.use("/graphql", express_graphql(async (req, res) => {
    const jwt = jwtCheck(req,SECRET);
    if(jwt) {
        const thisUser = await User.findOne({where: {emai:jwt.sub}});
        return {
            schema,
            rootValue: resolvers,
            graphiql: true,
            context: {jwt, thisUser}
        };
    }
    return {
        schema,
        rootValue: resolvers,
        graphiql: true,
        context: {}
    }
}));

app.get('/download/:id', async (req, res,next) => {
    const path = req.params.id;
    const file = fs.createReadStream(`public/uploads/${path}`);
    const filename = (new Date().toISOString());
    res.setHeader('Content-Disposition', 'attachment: filename="' + filename + '"');
    file.pipe(res);
})

app.post('/uploads', upload.single('image'), async  function(req,res,next) {
    let filedata = req.file;
    const jwt = jwtCheck(req,SECRET);
    if(!filedata) res.send(JSON.stringify("Error"));
    if (jwt) {
        let url = filedata.path.replace(/public\//, "");
        let originalFileName = filedata.filename;
        let image = Image.create({
            url,
            originalFileName
        })
        const {dataValues} = await image;
        res.json(dataValues);
    }
})

sequelize.sync();
sequelize.sync({force: true});


app.listen(5002, console.log("Starting"));

module.exports = schema;










