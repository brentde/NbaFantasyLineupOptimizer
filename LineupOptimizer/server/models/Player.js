const mongoose = require('mongoose');

const player = new mongoose.Schema({
    _id: {
        type: Number
    },
    playerId: {
        type: String
    },
    creationDate: {
        type: Date
    },
    name: {
        type: String
    },
    position: {
        type: String
    },
    photoUrl: {
        type: String
    },
    team: {
        type: String
    },
    teamLogo: {
        type: String
    },
    fgMade: {
        type: Number
    },
    fgAtt: {
        type: Number
    },
    fgPct: {
        type: Number
    },
    threesMade: {
        type: Number
    },
    threesAtt: {
        type: Number
    },
    threePct: {
        type: Number
    },
    twosMade: {
        type: Number
    },
    twosAtt: {
        type: Number
    },
    twoPct: {
        type: Number
    },
    effFgPct: {
        type: Number
    },
    ftMade: {
        type: Number
    },
    ftAtt: {
        type: Number
    },
    ftPct: {
        type: Number
    },
    offRbds: {
        type: Number
    },
    defRbds: {
        type: Number
    },
    totRbds: {
        type: Number
    },
    assists: {
        type: Number
    },
    steals: {
        type: Number
    },
    blocks: {
        type: Number
    },
    turnovers: {
        type: Number
    },
    pf: {
        type: Number
    },
    points: {
        type: Number
    },
    expFv: {
        type: Number
    },
    price: {
        type: Number
    },
    ratio: {
        type: Number
    },
    active: {
        type: String
    },
    injured: {
        type: String
    }
});

module.exports = Player = mongoose.model('player', player);