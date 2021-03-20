const { getPlayerData, getTeamData, getInjuryStatus, getDkData } = require('./webscraping/scrape');
const dbName = 'LineupOptimizer';
const dbService = require('./db.service');
const MatchupSchema = require('./models/Matchup');
const PlayerSchema = require('./models/Player');
const { convertActionBinding } = require('@angular/compiler/src/compiler_util/expression_converter');
const { consoleTestResultHandler } = require('tslint/lib/test');


function refreshPlayerData() {
    return new Promise((resolve, reject) => {
        const database = dbService.db.db(dbName);
        const Players = database.collection('Player');
        const Historical = database.collection('Player_History')

        // Dump table contents and insert latest player data
        Players.deleteMany({});
        
        // Have one table for current player data and another historical data
        try{
            getPlayerData().then(players => {
                
                players.forEach(player => {
                    Players.insertOne(player, (err) => {
                        if (err) {
                            console.log('Error: ', err);
                            reject();
                        } else {
                          //  console.log(`${player.name} Updated!`);
                        }
                    })
                    
                    // Will be used to query a players historical data for player card
                    Historical.insertOne(player, (err) => {
                        if(err){
                          console.log(err);
                          reject();      
                        } else {
                         //  console.log(`${player.name} Historical Data Added!`); 
                        }
                    })
                })

                resolve();
            }, err => {
                reject(err); 
            })
        } catch(err){
            console.error(err);
        } 
      })
  }

function refreshTeamData(){
    return new Promise((resolve, reject) => {
        const database = dbService.db.db(dbName);
        const Team = database.collection('Team');
        Team.deleteMany({});
   
          try{
            getTeamData().then(teams => {
                teams.forEach(team => {
                    Team.insertOne(team, (err) => {
                        if (err) {
                            console.log(err);
                            reject();
                        } else {
                          //  console.log(`${team.name} Inserted!`);
                        }
                    })
                })

                resolve();
            }, err => {
                reject(err); 
            })



         
        } catch(err){
            console.error(err);
        } 
      })
}

function updateInjuries() {
    return new Promise((resolve, reject) => {
        const database = dbService.db.db(dbName);
        const Player = database.collection('Player');
        
        try{
        Player.updateMany({}, {$set: {injured: 'N'}}, (err) => {
            if(err){
                console.log(err);
                reject();
            } else {
                getInjuryStatus().then(players => {
                    players.forEach(player => {
                       
                        let filter = {name: player}
                        let update = {$set: {injured: 'Y'}};
                        Player.updateOne(filter, update, (err) => {
                            if(err){
                                console.log(err);
                                reject();
                            } 
                            else {
                               // console.log(`${player} injury status updated!`);
                            }
                        })
                    })
                   resolve();
                })
                   
              
            }
        })          
    } catch(err) {
        console.log(err);
       reject();
    }
    })
}

function updateDkData() {
    return new Promise((resolve, reject) => {
        try{
            const database = dbService.db.db(dbName);
            const Player = database.collection('Player');
            const Matchup = database.collection('Matchup');
        
            // Fresh slate of matchups
            Matchup.deleteMany({});

            getDkData().then(allDkData => {
                allDkData.forEach(dkData => {
                    // Add Matchup
                    let newMatchup = new MatchupSchema;
                    newMatchup.home = dkData.home;
                    newMatchup.away = dkData.away;

                    const matchUpfilter = {home: dkData.home, away: dkData.away};
                    const config = {upsert: true};
    
                    Matchup.updateOne(matchUpfilter, {$set: {newMatchup}}, config, (err) => {
                        if(err){
                            console.log("Error in update matchup! ", err);
                            reject();
                        } 
                        else {
                          // console.log(`${matchUpfilter.away} @ ${matchUpfilter.home} added!`)
                        }
                    })


                    dkData.positions.split('/').forEach(position => {
                        const playerQuery = {name: dkData.name, team: dkData.team, position: position};
                        const filter = {$set: {price: dkData.price, active: 'Y'}};
                        let playerPromise_0 = Player.findOne(playerQuery);
                        
                        // console.log(playerQuery);
                        playerPromise_0.then(player_0 => {
                            if(player_0 && player_0.position == position){
                                Player.updateOne(playerQuery, filter, (err) => {
                                    if(err){
                                        console.log(err);
                                        reject();
                                    } 
                                    else {
                                      // console.log(`${player_0.name} DK data updated!`);
                                    }
                                })
                            } else if(!player_0) {
                                let playerPromise_1 = Player.findOne({name: dkData.name, team: dkData.team});
                                playerPromise_1.then(player_1 => {
                                    if(player_1){
                                        let newPlayer = new PlayerSchema();
                                        newPlayer = JSON.parse(JSON.stringify(player_1));
                                        newPlayer._id = Math.floor(Math.random() * 1000000000);
                                        newPlayer.position = position;
                                        newPlayer.price = dkData.price;
                                        newPlayer.active = 'Y';
                                    
                                        Player.insertOne(newPlayer, (err) => {
                                            if(err){
                                                console.log("Error in DK Data Player Insert: " , err);
                                            } 
                                            else {
                                               // console.log(`Player: ${newPlayer.name} Position: ${newPlayer.position} successfully added!`);
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    })
                })

                resolve();
            })
        } catch(err) {
            console.log("Error in getDkData!" , err);
            reject();
        }
    })
}

function getPlayers(){
    return new Promise((resolve, reject) => {
       const database = dbService.db.db(dbName);
       const collection = database.collection('Player');
       const query = {active: 'Y', injured: 'N'};
       resolve(collection.find(query).toArray());
    })
}


function getPlayer(id){
    const database = dbService.db.db(dbName);
    const collection = database.collection('Player');
    const query = {_id: id};
    return collection.findOne(query);
}

function getAllActiveByPosition(position){
    const database = dbService.db.db(dbName);
    const collection = database.collection('Player');
    const query = {active: 'Y', injured: 'N', position: position};
    return collection.find(query);
}
function getTeams(){
    return new Promise((resolve, reject) => {
        const colName = 'Team';
        const database = dbService.db.db(dbName);
        const collection = database.collection(colName);
        const query = {};
        resolve(collection.find().toArray());
    })
}

function getTeam(id){
    const database = dbService.db.db(dbName);
    const collection = database.collection("Team");
    const query = {_id: id};
    return collection.findOne(query);
}

function getMatchups(){
    return new Promise((resolve, reject) => {
        const database = dbService.db.db(dbName);
        const collection = database.collection('Matchup');
        const query = {};
        resolve(collection.find(query).toArray());
    })
}

exports.refreshPlayerData = refreshPlayerData;
exports.refreshTeamData = refreshTeamData;
exports.updateInjuries = updateInjuries;
exports.updateDkData = updateDkData;
exports.getPlayer = getPlayer;
exports.getAllActiveByPosition = getAllActiveByPosition;
exports.getTeam = getTeam;
exports.getMatchups = getMatchups;
exports.getPlayers = getPlayers;
exports.getTeams = getTeams;
  
  