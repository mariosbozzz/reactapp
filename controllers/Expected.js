import Expected from "../models/ExpectedGoalsModel.js";
import User from "../models/UserModel.js";
import {Op} from "sequelize"

export const getExpected = async (req, res) => {
    try {
        let response;
        if (req.role === "admin") {
            response = await Expected.findAll({
                attributes: ['uuid', 'date', 'xG'], // Only fetch uuid, date, and xG
                include: [{
                    model: User,
                    attributes: ['name', 'email']
                }]
            });
        } else {
            response = await Expected.findAll({
                attributes: ['uuid', 'date', 'xG'], // Only fetch uuid, date, and xG
                where: {
                    userId: req.userId
                },
                include: [{
                    model: User,
                    attributes: ['name', 'email']
                }]
            });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export const createExpected = async (req, res) => {
    const { xG, date } = req.body; // Only extract xG and date from the request body
    try {
        await Expected.create({
            xG: xG,
            date: date,
            userId: req.userId
        });
        res.status(201).json({ msg: "Chart Created Successfully" });
    } catch (error) {
        let errorMsg = "Validation error:";
        if (error.errors) {
            errorMsg = error.errors.map(err => {
                switch(err.validatorKey) {
                    case 'notEmpty':
                        return `${err.path} cannot be empty`;
                    case 'len':
                        return `${err.path} length must be between ${err.validatorArgs[0]} and ${err.validatorArgs[1]} characters`;
                    // Add more cases for other validation types if needed
                    default:
                        return `${err.message}`;
                }
            }).join('; ');
        } else {
            errorMsg = error.message;
        }
        res.status(400).json({ msg: errorMsg });
    }
};