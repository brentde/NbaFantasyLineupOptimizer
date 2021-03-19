const mongoose = require('mongoose');

const team = new mongoose.Schema({
    name : {
        type: String
    },
    points : {
        type: Number
    },
    rebounds : {
        type: Number
    },
    assists : {
        type: Number
    },
    steals : {
        type: Number
    },
    blocks : {
        type: Number
    },
    turnovers : {
        type: Number
    },
    pf : {
        type: Number
    },
    defRbds : {
        type: Number
    },
    offRbds : {
        type: Number
    },
    totRbds : {
        type: Number
    },
    fgMade : {
        type: Number
    },
    fgatt : {
        type: Number
    },
    fgPct : {
        type: Number
    },
    threesMade : {
        type: Number
    },
    threesAtt : {
        type: Number
    },
    threePct : {
        type: Number
    },
    twosMade : {
        type: Number
    },
    twosAtt : {
        type: Number
    },
    twoPct : {
        type: Number
    },
    ftMade : {
        type: Number
    },
    ftAtt : {
        type: Number
    },
    ftPct : {
        type: Number
    },
});

module.exports = Team = mongoose.model('team', team);
