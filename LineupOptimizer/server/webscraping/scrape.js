const axios = require('axios');
const cheerio = require('cheerio');
const Player = require('../models/Player');
const Team = require('../models/Team');
const DkData = require('../models/DkData');
const fetch = require('node-fetch');
var fs = require('fs'); 

function fetchPlayerIds() {
  return new Promise((resolve, reject) => {
    let playerIds = new Map();
      
    fetch('http://data.nba.net/data/10s/prod/v1/2020/players.json', {method: "GET"})
    .then(res => res.json())
    .then((json) => {
        json.league.standard.forEach(player => {
          playerIds.set(`${player.firstName} ${player.lastName}`, player.personId)
        })

        resolve(playerIds);
    })
  })
}

function getAllPlayers(teams, matchups, playerIds) {
  return new Promise((resolve, reject) => {

      axios.get('https://www.basketball-reference.com/leagues/NBA_2021_per_game.html').then(response => {
        const $ = cheerio.load(response.data);
        const Players = [];
        const playerData = [];
    
        $('tbody > tr > td').each((_idx, el) => {
          playerData.push($(el).text());
        })
    
        let beg = 0;
        let end = 29;
    
        while(beg < playerData.length){

          let playerArr = playerData.slice(beg, end);
          let player = new Player();

          player._id = Math.floor(Math.random() * 1000000000);
          // Set creation date so that we can get latest data
          player.creationDate = new Date();

          player.name = playerArr[0];
      
          if(playerIds.has(player.name)){
              player.playerId = playerIds.get(player.name)
              player.photoUrl = `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${player.playerId}.png`;
          } else {
              player.playerId = Math.random() * 1000000;
              player.photoUrl = 'assets/shared/team_logos/default.png';
          } 
        
          player.position = playerArr[1];
    
          player.team = convertTeamName_1(playerArr[3]);
          player.teamLogo = `assets/shared/team_logo/${player.team}.png`
          
          player.fgMade = Number(playerArr[7]);
          player.fgAtt = Number(playerArr[8]);
    
          player.fgPct = Number(playerArr[9]);
          player.threesMade = Number(playerArr[10]);
    
          player.threesAtt = Number(playerArr[11]);
          player.threePct = Number(playerArr[12]);
          player.threesExp = 0.0;
    
          player.twosMade = Number(playerArr[13]);
          player.twosAtt = Number(playerArr[14]);
          player.twosExp = 0.0;
    
          player.twoPct = Number(playerArr[15]);
          player.effFgPct = Number(playerArr[16]);
    
          player.ftMade = Number(playerArr[17]);
          player.ftAtt = Number(playerArr[18]);
    
          player.ftPct = Number(playerArr[19]);
          player.offRbds = Number(playerArr[20]);
    
          player.defRbds = Number(playerArr[21]);
          player.totRbds = Number(playerArr[22]);
          player.rbdsExp = 0.0;
    
          player.assists = Number(playerArr[23]);
          player.assistsExp = 0.0;
          
          player.steals = Number(playerArr[24]);
          player.stealsExp = 0.0;
    
          player.blocks = Number(playerArr[25]);
          player.blocksExp = 0.0;

          player.turnovers = Number(playerArr[26]);
          player.turnoversExp = 0.0;
    
          player.pf = Number(playerArr[27]);
          player.points = Number(playerArr[28]);

          player.expFv = 0.0;
          player.price = 0;
          player.ratio = 0.0;
          player.active = 'N';
          player.injured = 'N';

          calcFV(player, teams, matchups);

          Players.push(player);
          beg += 29;
          end += 29;
        }
        
        resolve(Players);
      })
  })
}

function getPlayerData() {

  return new Promise((resolve, reject) => {
    let teamMap = new Map();
    let matchupMap = new Map();
    getTeamData().then(teams => {
      
      // Fill team map
      teams.forEach(team => {
        teamMap.set(team.name, team);
      })


      getDkData().then(data => {
         
        // Fill matchup map
        data.forEach(entry => {
            matchupMap.set(entry.away, entry.home);
            matchupMap.set(entry.home, entry.away);
        })


        fetchPlayerIds().then(playerIdMap => {
          let playerIds = playerIdMap;

          getAllPlayers(teamMap, matchupMap, playerIds).then(players => {
              resolve(players);
          })
        })
      })
    })
  })
};

exports.getPlayerData = getPlayerData;

function getTeamData() {
    return new Promise((resolve, reject) => {
  
          axios.get('http://www.hoopsstats.com/basketball/fantasy/nba/opponentstats/21/1/fgpct/1-3').then(response => {

            const $ = cheerio.load(response.data);
            const teamData = [];
      
            $('table.statscontent > tbody > tr > td').each((_idx, el) => {
                teamData.push($(el).text());
            });
      
            const teamObjs = [];
            let beg = 0;
            let end = 21;
        
            while(beg < teamData.length){
              const teamObjData = teamData.slice(beg, end);

              let teamObj = new Team();

              teamObj.name = convertTeamName_2(teamObjData[1]);
              teamObj.gamesPlayed = teamObjData[2];
              teamObj.points = Number(teamObjData[4]);
              teamObj.rebounds = Number(teamObjData[5]);
              teamObj.assists = Number(teamObjData[6]);
              teamObj.steals = Number(teamObjData[7]);
              teamObj.blocks = Number(teamObjData[8]);
              teamObj.turnovers = Number(teamObjData[9]);
              teamObj.pf = Number(teamObjData[10]);

              // Rebound Data
              teamObj.defRbds = Number(teamObjData[11]);
              teamObj.offRbds = Number(teamObjData[12]);
              teamObj.totRbds = Number(teamObj.defRbds + teamObj.offRbds);
        
              // Field Goal Data
              let fieldGoalData = teamObjData[13].split('-');
              teamObj.fgMade = Number(fieldGoalData[0]);
              teamObj.fgAtt = Number(fieldGoalData[1]);
              teamObj.fgPct= Number(teamObjData[14]);
        
              // Three Point Data
              let threePtData = teamObjData[15].split('-');
              teamObj.threesMade = Number(threePtData[0]);
              teamObj.threesAtt = Number(threePtData[1]);
              teamObj.threePct = Number(teamObjData[16]);
        
              // Calculate Two Point Data
              teamObj.twosMade = Number(teamObj.fgMade - teamObj.threesMade);
              teamObj.twosAtt = Number(teamObj.fgAtt - teamObj.threesAtt);
              teamObj.twoPct = Number(teamObj.twosMade/teamObj.twosAtt);
        
              // Free Throw Data
              let ftData = teamObjData[17].split('-');
              teamObj.ftMade = Number(ftData[0]);
              teamObj.ftAtt = Number(ftData[1]);
              teamObj.ftPct = Number(teamObjData[18]);
        
              teamObjs.push(teamObj)
              beg += 21;
              end += 21;
            }
            
            resolve(teamObjs);
          })
    })
};

exports.getTeamData = getTeamData;

function getInjuryStatus(){
  return new Promise((resolve, reject) => {
  
     axios.get('https://www.cbssports.com/nba/injuries/').then(response => {
      const $ = cheerio.load(response.data);
      let players = [];
      let status = [];
      let inactive_players = [];

      // Get All Listed Players
      $('span.CellPlayerName--long > span > a').each((_idx, el) => {
        players.push($(el).text())
          });


      // Get Injury Status
      let i = 0;
      $('td.TableBase-bodyTd').each((_idx, el) => {
        i++;

        if(i === 5){
          status.push($(el).text());
          i = 0;
        }
      });

      // Parse injury status data searching for 'out'
      // push inactive players on to the array
      for(let i = 0; i < status.length; i++){
        let cur_status = String(status[i]).toLowerCase();

        if(cur_status.search('out') !== -1){
          inactive_players.push(players[i]);
        };
      }

      resolve(inactive_players);
     })
  })
};

exports.getInjuryStatus = getInjuryStatus;

function getDkData() {
  return new Promise((resolve, reject) => {
    try{     
      fs.readFile(__dirname + '/dk_data.csv', 'utf8', (err, data) => {
        if(err) throw err;

        let allDkData = [];
        let rows = data.split('\n');

        rows.forEach(data => {
          let dkArr = data.split(',');
          let dkData = new DkData();
          dkData.name = dkArr[2]; // search filter
          dkData.positions = dkArr[4];
          dkData.price = Number(dkArr[5]); 
          dkData.away = convertTeamNameDk(dkArr[6].split('@')[0]);
          dkData.home = convertTeamNameDk(dkArr[6].split('@')[1].split(' ')[0]);
          dkData.team = convertTeamNameDk(dkArr[7]); // search filter

        if(dkData.price >= 3200)
          allDkData.push(dkData);
      })

        resolve(allDkData);
      })
    } catch (err) {
      console.log(err);
    } 
  })
}

exports.getDkData = getDkData;

function getOppAverages(teams) {
  let averages = new Team();

  averages.threePct = 0.0;
  averages.twoPct =  0.0;
  averages.totRbds = 0.0;
  averages.steals =  0.0;
  averages.turnovers =  0.0;
  averages.assists = 0.0;
  averages.blocks =  0.0;

  teams.forEach(team => {
    averages.threePct += Number(team.threePct); 
    averages.twoPct += Number(team.twoPct);
    averages.totRbds += Number(team.totRbds); 
    averages.steals += Number(team.steals);
    averages.turnovers += Number(team.turnovers);
    averages.assists += Number(team.assists);
    averages.blocks += Number(team.blocks);
  })

  averages.threePct = Number(averages.threePct/30);
  averages.twoPct = Number(averages.twoPct/30);
  averages.totRbds = Number(averages.totRbds/30);
  averages.steals = Number(averages.steals/30);
  averages.turnovers = Number(averages.turnovers/30);
  averages.assists = Number(averages.assists/30);
  averages.blocks = Number(averages.blocks/30);
 
  return averages;
} 

function calcFV(player, teams, matchups) {
  let averages = getOppAverages(teams);
 
  let bonusProgress = 0;
  
  if(matchups.has(player.team)){
    // Calculate 3pt Value
    player.threesExp  = Number((player.threesAtt * (player.threePct + ((teams.get(matchups.get(player.team)).threePct - averages.threePct) / 100))).toFixed(2));
    // Calculate 2pt Value
    player.twosExp  = Number((player.twosAtt * (player.twoPct + ((teams.get(matchups.get(player.team)).twoPct - averages.twoPct) / 100))).toFixed(2));
  
    if((player.threesExp + player.twosExp + player.ftMade) > 10.0){
      bonusProgress += 1;
    }
    
    // Calculate Assist Value
    let assistPct = player.assists/teams.get(player.team).assists;
    player.assistsExp = Number((player.assists + assistPct * (teams.get(matchups.get(player.team)).assists - averages.assists)).toFixed(2));

    if(player.assistsExp >= 10.0){
      bonusProgress += 1;
    }

  
    // Calculate Rebound Value
    let reboundPct = player.totRbds/Number(teams.get(player.team).totRbds);
    player.rbdsExp = Number((player.totRbds + reboundPct * (teams.get(matchups.get(player.team)).totRbds - averages.totRbds)).toFixed(2));

    if(player.rbdsExp >= 10.0){
      bonusProgress += 1;
    }

    // Calculate Steal Value
    let stealPct = player.steals/Number(teams.get(player.team).steals);
    player.stealsExp = Number((player.steals + stealPct * (teams.get(matchups.get(player.team)).steals - averages.steals)).toFixed(2));


    if(player.stealsExp  >= 10.0){
      bonusProgress += 1;
    }

    // Calculate Block Value
    let blockPct = player.blocks/Number(teams.get(player.team).blocks);
    player.blocksExp = Number((player.blocks + blockPct * (teams.get(matchups.get(player.team)).blocks - averages.blocks)).toFixed(2));


    if(player.blocksExp  >= 10.0){
      bonusProgress += 1;
    }

    // Calculate Turnover Value
    let turnoverPct = player.turnovers/Number(teams.get(player.team).turnovers);
    player.turnoversExp = Number((player.turnovers + turnoverPct * (teams.get(matchups.get(player.team)).turnovers - averages.turnovers)).toFixed(2));

    let expFantasyPts = (player.twosExp * 2) + player.threesExp * 3.5 +  player.assistsExp  * 1.5 + player.ftMade + 
                                player.blocksExp * 2.0 + player.rbdsExp * 1.25 +  player.stealsExp * 2.0 -  (player.turnoversExp + player.pf)  * 0.5;

    if(bonusProgress >= 2){
      expFantasyPts += 1.5;
    }

    if(bonusProgress >= 3){
      expFantasyPts += 3.0;
    }

    player.expFv = Number(expFantasyPts.toFixed(2));
  }
}

// ********************************
// Team Name Conversion Functions
// ********************************

function convertTeamNameDk(teamName) {
  if(teamName === 'SA'){
    return 'SAS';
  } else if(teamName === 'GS'){
    return 'GSW';
  } else if(teamName === 'CHA'){
    return 'CHO'; 
  } else if(teamName === 'NO'){
    return 'NOP';
  } else if(teamName === 'NK'){
    return 'NYK';
  } else if(teamName === 'TOR'){
    return 'TOR';
  } else {
    return teamName;
  }
}

function convertTeamName_1(name) {
    if(name === 'BRK'){
      return "BKN";
    } 
  
    return name;
  }

  function convertTeamName_2(name) {
    if(name === 'Houston'){
      return 'HOU';
    } else if(name === 'Oklahoma City'){
      return 'OKC';
    } else if(name === 'Miami'){
      return 'MIA';
    } else if(name === 'Toronto'){
      return 'TOR';
    } else if(name === 'New York'){
      return 'NYK';
    } else if(name === 'Dallas'){
      return 'DAL';
    } else if(name === 'New Orleans'){
      return 'NOP';
    } else if(name === 'Indiana'){
      return 'IND';
    } else if(name === 'Memphis'){
      return 'MEM';
    } else if(name === 'Utah'){
      return 'UTA';
    } else if(name === 'Atlanta'){
      return 'ATL';
    } else if(name === 'Cleveland'){
      return 'CLE';
    } else if(name === 'San Antonio'){
      return 'SAS';
    } else if(name === 'Denver'){
      return 'DEN';
    } else if(name === 'Portland'){
      return 'POR';
    } else if(name === 'Phoenix'){
      return 'PHO';
    } else if(name === 'Detroit'){
      return 'DET';
    } else if(name === 'Golden State'){
      return 'GSW';
    } else if(name === 'L.A.Lakers'){
      return 'LAL';
    } else if(name === 'Philadelphia'){
      return 'PHI';
    } else if(name === 'L.A.Clippers'){
      return 'LAC';
    } else if(name === 'Orlando'){
      return 'ORL';
    } else if(name === 'Charlotte'){
      return 'CHA';
    } else if(name === 'Minnesota'){
      return 'MIN';
    } else if(name === 'Boston'){
      return 'BOS';
    } else if(name === 'Milwaukee'){
      return 'MIL';
    } else if(name === 'Brooklyn'){
      return 'BKN';
    } else if(name === 'Chicago'){
      return 'CHI';
    } else if(name === 'Sacramento'){
      return 'SAC';
    } else if(name === 'Washington'){
      return 'WAS';
    } else {
      return 'NO MATCH';
    }
  }



