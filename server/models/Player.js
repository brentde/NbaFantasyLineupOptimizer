const mongoose = require('mongoose');

const player = new mongoose.Schema({
    _id: {
        type: Number
    },
    playerId: {
        type: String
    },
    bbrefId: {
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
    fgExp: {
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
    threesExp: {
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
    twosExp: {
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
    rbdsExp: {
        type: Number
    },
    assists: {
        type: Number
    },
    assistsExp: {
        type: Number
    },
    steals: {
        type: Number
    },
    stealsExp: {
        type: Number
    },
    blocks: {
        type: Number
    },
    blocksExp: {
        type: Number
    },
    turnovers: {
        type: Number
    },
    turnoversExp: {
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