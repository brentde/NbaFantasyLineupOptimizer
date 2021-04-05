const mongoose = require('mongoose');

const matchup = new mongoose.Schema({
    home: {
        type: String
    },
    away: {
        type: String
    }
})

module.exports = Matchup = mongoose.model('matchup', matchup);