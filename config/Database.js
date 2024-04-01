import {Sequelize} from "sequelize";

const db = new Sequelize('heroku_251b7ffcbdfdbb5', 'be2ffa22947a17', '1bc1bd62', {
    host: "eu-cluster-west-01.k8s.cleardb.net",
    dialect: "mysql"
});

export default db;

