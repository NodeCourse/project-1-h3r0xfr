const Sequelize = require('sequelize');

// Connection
const db = new Sequelize('nodejs-poll', 'nodejs-poll', 'lolilol123', {
    host: 'h3r0x.ovh',
    dialect: 'mysql'
});

// Models
const pollModel = db.define('poll', {
    question: { type: Sequelize.STRING },
    description: { type: Sequelize.STRING },
    background: { type: Sequelize.STRING }
});

const answerModel = db.define('answer', {
    answer: { type: Sequelize.STRING },
    description: { type: Sequelize.STRING },
    image: { type: Sequelize.STRING }
});

const resultModel = db.define('result');

const userModel = db.define('user', {
    firstname: { type: Sequelize.STRING },
    lastname: { type: Sequelize.STRING },
    email: { type: Sequelize.STRING },
    password: { type: Sequelize.STRING }
});

// Relations
pollModel.hasMany(answerModel);
answerModel.belongsTo(pollModel);

userModel.hasMany(pollModel);
pollModel.belongsTo(userModel);

answerModel.hasMany(resultModel);
resultModel.belongsTo(answerModel);

// Synchronization
db.sync();

// Export
module.exports = {
    Poll: pollModel,
    Answer: answerModel,
    Result: resultModel,
    User: userModel
};
