import Chart from "../models/ChartModel.js";
import User from "../models/UserModel.js";
import {Op} from "sequelize"

export const getChart = async (req, res) => {
    try {
        let response;
        if (req.role === "admin") {
            response = await Chart.findAll({
                attributes: ['uuid',  'date', 'goals', 'antipaloi','assists', 'passes','xamenespasses', 'anepitixispasses','anepitixispasses',
                'longpass','keypass','sentres','sthmenesfaseis','xamenikatoxi','klepsimo','kefalia','keyerror','tripla','shootsofftarget',
                'shootsontarget','xG','apokrouseis','shootspoudektike'], // Add additional attributes here
                include: [{
                    model: User,
                    attributes: ['name', 'email']
                }]
            });
        } else {
            response = await Chart.findAll({
                attributes: ['uuid',  'date', 'goals', 'antipaloi','assists', 'passes','xamenespasses', 'anepitixispasses','anepitixispasses',
                'longpass','keypass','sentres','sthmenesfaseis','xamenikatoxi','klepsimo','kefalia','keyerror','tripla','shootsofftarget',
                'shootsontarget','xG','apokrouseis','shootspoudektike'],// Add additional attributes here
                where: {
                    userId: req.userId
                },
                include: [{
                    model: User,
                    attributes: ['name', 'email']
                }]
            });
        }
        response = response.map(item => {
            const date = item.date instanceof Date && !isNaN(item.date) ? new Date(item.date) : null;
            const formattedDate = date ? date.toLocaleDateString('el-GR') : 'Δεν έχει βάλει ημερομηνία';
            const apodosi = item.passes*0.1-item.xamenespasses*0.1+item.goals*0.5+item.assists*0.25+item.keypass*0.15+item.shootsontarget*0.1-item.keyerror*0.1
            +item.kefalia*0.1-item.anepitixispasses*0.05;
            const totalActions = item.passes + item.xamenespasses;
            
            const passesPercentage = (item.passes / totalActions) * 100;
            

            return {
                ...item.toJSON(),
                date: formattedDate,
                apodosi,
                passesPercentage
            };
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}



export const createChart = async (req, res) => {
    const {  goals, antipaloi, date ,assists,passes,xamenespasses,anepitixispasses,longpass,keypass,sentres,xamenikatoxi,
        sthmenesfaseis,klepsimo,kefalia,shootsofftarget,shootsontarget,keyerror,tripla,xG,apokrouseis,shootspoudektike} = req.body;
    try {
        await Chart.create({
            
            goals: goals,
            date: date,
            antipaloi: antipaloi,
            assists: assists,
            passes: passes,
            xamenespasses: xamenespasses,
            anepitixispasses: anepitixispasses,
            longpass: longpass,
            keypass: keypass,
            sentres: sentres,
            sthmenesfaseis: sthmenesfaseis,
            klepsimo: klepsimo,
            kefalia: kefalia,
            keyerror: keyerror,
            tripla: tripla,
            xamenikatoxi:xamenikatoxi,
            shootsofftarget: shootsofftarget,
            shootsontarget: shootsontarget,
            xG:xG,
            apokrouseis:apokrouseis,
            shootspoudektike:shootspoudektike,
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
}


export const deleteChart = async(req, res) =>{
    try {
        const chart = await Chart.findOne({
            where:{
                uuid: req.params.id
            }
        });
        if(!chart) return res.status(404).json({msg: "Data tidak ditemukan"});
        const {name, price} = req.body;
        if(req.role === "admin"){
            await Chart.destroy({
                where:{
                    id: chart.id
                }
            });
        }else{
            if(req.userId !== chart.userId) return res.status(403).json({msg: "Akses terlarang"});
            await Chart.destroy({
                where:{
                    [Op.and]:[{id: chart.id}, {userId: req.userId}]
                }
            });
        }
        res.status(200).json({msg: "Product deleted successfuly"});
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}
export const getTotalAssists = async (req, res) => {
    try {
        let totalAssists;
        let totalGoals;
        let totalPasses;
        let totalMispass;
        if (req.role === "admin") {
            // Admin can see total assists of all users
            totalAssists = await Chart.sum('assists');
            totalGoals = await Chart.sum('goals');
            totalPasses = await Chart.sum('passes');
            totalMispass = await Chart.sum('xamenespasses');
        } else {
            // Non-admin users can only see their own total assists
            totalAssists = await Chart.sum('assists', {
                where: { userId: req.userId }
            });
            totalGoals = await Chart.sum('goals', {
                where: { userId: req.userId }
            });
            totalPasses = await Chart.sum('passes', {
                where: { userId: req.userId }
            });
            totalMispass = await Chart.sum('xamenespasses', {
                where: { userId: req.userId }
            });
        }
        res.status(200).json({ totalAssists });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}
export const getTotalStatistics = async (req, res) => {
    try {
        let totalStatistics;
        if (req.role === "admin") {
            // Admin can see total statistics of all users
            totalStatistics = await Chart.findOne({
                attributes: [
                    [Chart.sequelize.fn('sum', Chart.sequelize.col('assists')), 'totalAssists'],
                    [Chart.sequelize.fn('sum', Chart.sequelize.col('goals')), 'totalGoals'],
                    [Chart.sequelize.fn('sum', Chart.sequelize.col('passes')), 'totalPasses'],
                    [Chart.sequelize.fn('sum', Chart.sequelize.col('xamenespasses')), 'totalMissPasses'],
                    [Chart.sequelize.fn('sum', Chart.sequelize.col('longpass')), 'totalLongpass'],
                    [Chart.sequelize.fn('sum', Chart.sequelize.col('keypass')), 'totalkeypass'],
                    [Chart.sequelize.fn('sum', Chart.sequelize.col('shootsontarget')), 'totalshootsontarget'],
                    [Chart.sequelize.fn('sum', Chart.sequelize.col('shootsofftarget')), 'totalshootsofftarget'],
                    [Chart.sequelize.fn('sum', Chart.sequelize.col('sentres')), 'totalsentres'],
                    [Chart.sequelize.fn('count', Chart.sequelize.col('*')), 'totalEntries']
                ]
            });
        } else {
            // Non-admin users can only see their own total statistics
            totalStatistics = await Chart.findOne({
                attributes: [
                    [Chart.sequelize.fn('sum', Chart.sequelize.col('assists')), 'totalAssists'],
                    [Chart.sequelize.fn('sum', Chart.sequelize.col('goals')), 'totalGoals'],
                    [Chart.sequelize.fn('sum', Chart.sequelize.col('passes')), 'totalPasses'],
                    [Chart.sequelize.fn('sum', Chart.sequelize.col('xamenespasses')), 'totalMissPasses'],
                    [Chart.sequelize.fn('sum', Chart.sequelize.col('longpass')), 'totalLongpass'],
                    [Chart.sequelize.fn('sum', Chart.sequelize.col('keypass')), 'totalkeypass'],
                    [Chart.sequelize.fn('sum', Chart.sequelize.col('shootsontarget')), 'totalshootsontarget'],
                    [Chart.sequelize.fn('sum', Chart.sequelize.col('shootsofftarget')), 'totalshootsofftarget'],
                    [Chart.sequelize.fn('sum', Chart.sequelize.col('sentres')), 'totalsentres'],
                    [Chart.sequelize.fn('count', Chart.sequelize.col('*')), 'totalEntries']
                    
                ],
                where: { userId: req.userId }
            });
        }
        
        res.status(200).json(totalStatistics);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const getTotalStatistics123 = async (req, res) => {
    try {
        let totalStatistics;
        let totalEntries;

        if (req.role === "admin") {
            // Admin can see total statistics of all users
            totalStatistics = await Chart.findOne({
                attributes: [
                    [Chart.sequelize.fn('sum', Chart.sequelize.col('assists')), 'totalAssists'],
                    [Chart.sequelize.fn('sum', Chart.sequelize.col('goals')), 'totalGoals'],
                    [Chart.sequelize.fn('sum', Chart.sequelize.col('passes')), 'totalPasses'],
                    [Chart.sequelize.fn('sum', Chart.sequelize.col('xamenespasses')), 'totalMissPasses'],
                    [Chart.sequelize.fn('count', Chart.sequelize.col('*')), 'totalEntries']
                ]
            });
        } else {
            // Non-admin users can only see their own total statistics
            totalStatistics = await Chart.findOne({
                attributes: [
                    [Chart.sequelize.fn('sum', Chart.sequelize.col('assists')), 'totalAssists'],
                    [Chart.sequelize.fn('sum', Chart.sequelize.col('goals')), 'totalGoals'],
                    [Chart.sequelize.fn('sum', Chart.sequelize.col('passes')), 'totalPasses'],
                    [Chart.sequelize.fn('sum', Chart.sequelize.col('xamenespasses')), 'totalMissPasses'],
                    [Chart.sequelize.fn('count', Chart.sequelize.col('*')), 'totalEntries']
                ],
                where: { userId: req.userId }
            });
        }

        // Extract total entries count
        totalEntries = totalStatistics.get('totalEntries');

        // Remove totalEntries from the result object
        totalStatistics = totalStatistics.toJSON();
        delete totalStatistics.totalEntries;

        // Calculate averages
        const averageStatistics = {
            totalAssists: totalStatistics.totalAssists / totalEntries,
            totalGoals: totalStatistics.totalGoals / totalEntries,
            totalPasses: totalStatistics.totalPasses / totalEntries,
            totalMissPasses: totalStatistics.totalMissPasses / totalEntries
        };

        res.status(200).json(averageStatistics);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}


export const updateChart = async(req, res) =>{
    try {
        const chart = await Chart.findOne({
            where:{
                uuid: req.params.id
            }
        });
        if(!chart) return res.status(404).json({msg: "Data tidak ditemukan"});
        const {goals, antipaloi} = req.body;
        if(req.role === "admin"){
            await Chart.update({goals, antipaloi},{
                where:{
                    id: chart.id
                }
            });
        }else{
            if(req.userId !== chart.userId) return res.status(403).json({msg: "Akses terlarang"});
            await Chart.update({goals, antipaloi},{
                where:{
                    [Op.and]:[{id: chart.id}, {userId: req.userId}]
                }
            });
        }
        res.status(200).json({msg: "Chart updated successfuly"});
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}


export const getChartById = async(req, res) =>{
    try {
        const chart = await Chart.findOne({
            where:{
                uuid: req.params.id
            }
        });
        if(!chart) return res.status(404).json({msg: "Data tidak ditemukan"});
        let response;
        if(req.role === "admin"){
            response = await Chart.findOne({
                attributes:['uuid','goals','antipaloi'],
                where:{
                    id: chart.id
                },
                include:[{
                    model: User,
                    attributes:['name','email']
                }]
            });
        }else{
            response = await Chart.findOne({
                attributes:['uuid','goals','antipaloi'],
                where:{
                    [Op.and]:[{id: chart.id}, {userId: req.userId}]
                },
                include:[{
                    model: User,
                    attributes:['name','email']
                }]
            });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}
