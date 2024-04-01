import {Sequelize} from "sequelize";

const db = new Sequelize('u700861365_coach', 'u700861365_marios', '4261!Marios', {
    host: "153.92.220.1",
    dialect: "mysql"
});

export default db;