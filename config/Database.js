import {Sequelize} from "sequelize";

const db = new Sequelize('u700861365_coach', 'u700861365_marios', '4261!Marios', {
    host: "18.201.88.187",
    dialect: "mysql"
});

export default db;