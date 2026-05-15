const { Setting } = require('../models');

// 1. Get Current Settings
const getSettings = async (req, res) => {
    try {
        console.log("Setting Model:", Setting); 
        let settings = await Setting.findOne();
        // පද්ධතිය මුලින්ම රන් වෙද්දී record එකක් නැත්නම් අලුතින් එකක් හදනවා
        if (!settings) {
            settings = await Setting.create({
                light_logo_url: '', // මෙතනට උඹේ default cloudinary url එක දාන්නත් පුළුවන්
                dark_logo_url: '',
                default_language: 'en'
            });
        }
        res.status(200).json(settings);
    } catch (err) {
        console.error("Backend GetSettings Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

// 2. Update Settings
const updateSettings = async (req, res) => {
    try {
        const { light_logo_url, dark_logo_url, default_language } = req.body;
        let settings = await Setting.findOne();
        
        if (settings) {
            await settings.update({ light_logo_url, dark_logo_url, default_language });
        } else {
            settings = await Setting.create({ light_logo_url, dark_logo_url, default_language });
        }
        res.status(200).json({ message: "Settings updated!", settings });
    } catch (err) {
        console.error("Backend UpdateSettings Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getSettings, updateSettings };