const axios = require('axios');
const cheerio = require('cheerio');
const Player = require('../models/Player');
const Team = require('../models/Team');
const DkData = require('../models/DkData');
const fetch = require('node-fetch');
var fs = require('fs'); 



exports.getPlayerData = async () => {
    let playerIds = new Map();
    
    await  fetch('http://data.nba.net/data/10s/prod/v1/2020/players.json', {method: "GET"})
    .then(res => res.json())
    .then((json) => {
        json.league.standard.forEach(player => {
          playerIds.set(`${player.firstName} ${player.lastName}`, player.personId)
        })
    })

    try {
      const { data } = await axios.get(
        'https://www.basketball-reference.com/leagues/NBA_2021_per_game.html'
          );
      const $ = cheerio.load(data);
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

        player._id = Math.random() * 1000000000;
        // Set creation date so that we can get latest data
        player.creationDate = new Date();

        player.name = playerArr[0];
    
        if(playerIds.has(player.name)){
            player.playerId = playerIds.get(player.name)
            player.photoUrl = `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${player._id}.png`;
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
  
        player.twosMade = Number(playerArr[13]);
        player.twoAtt = Number(playerArr[14]);
  
        player.twoPct = Number(playerArr[15]);
        player.effFgPct = Number(playerArr[16]);
  
        player.ftMade = Number(playerArr[17]);
        player.ftAtt = Number(playerArr[18]);
  
        player.ftPct = Number(playerArr[19]);
        player.offRbds = Number(playerArr[20]);
  
        player.defRbds = Number(playerArr[21]);
        player.totRbds = Number(playerArr[22]);
  
        player.assists = Number(playerArr[23]);
        player.steals = Number(playerArr[24]);
  
        player.blocks = Number(playerArr[25]);
        player.turnovers = Number(playerArr[26]);
  
        player.pf = Number(playerArr[27]);
        player.points = Number(playerArr[28]);

        player.expFv = 0.0;
        player.price = 0;
        player.ratio = 0.0;
        player.active = 'N';
        player.injured = 'N';
      
        Players.push(player);
        beg += 29;
        end += 29;
      }
  
      return Players;
    } catch (error) {
      throw error;
    }
};


exports.getTeamData = async () => {

    try {
        const { data } = await axios.get(
              'http://www.hoopsstats.com/basketball/fantasy/nba/opponentstats/21/1/fgpct/1-1'
        );
        const $ = cheerio.load(data);
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
      
     
        return teamObjs;
    } catch (error) {
        throw error;
    }
};

exports.getInjuryStatus = async () => {
  try {
    const { data } = await axios.get(
      'https://www.cbssports.com/nba/injuries/'
        );
    const $ = cheerio.load(data);
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

    return inactive_players;
  } catch (error) {
    throw error;
  }
};

exports.getDkData = () => {
  return new Promise((resolve, reject) => {
    try{     
      fs.readFile(__dirname + '/dk_data.csv', 'utf8', (err, data) => {
        if(err) throw err;

        let allDkData = [];
        let rows = data.split('\n');

        rows.forEach(data => {
          let dkArr = data.split(',');
          // let i: number = 0;

          // while(i <= DKArr.length - 1){
          let dkData = new DkData();

          // dkData.position = dkArr[0]; // 
          // dkData.Name_id = DKArr[i + 1];
          dkData.name = dkArr[2]; // search filter
          // dkData.Id = Number(DKArr[i + 3]);
          dkData.positions = dkArr[4];
          dkData.price = Number(dkArr[5]); 

          // Get Matchups
          dkData.away = convertTeamNameDk(dkArr[6].split('@')[0]);
          dkData.home = convertTeamNameDk(dkArr[6].split('@')[1].split(' ')[0]);

          // if(DKArr[i + 6] !== undefined){
          //   let team1:string = this.TeamConversionService.convertTeamName(DKArr[i + 6].split('@')[0]);
          //   let team2:string = this.TeamConversionService.convertTeamName(DKArr[i + 6].split('@')[1].split(' ')[0]);

          //   if(!this.MatchUps.has(team1) && !this.MatchUps.has(team2)){
          //     this.MatchUps.set(team1, team2);
          //     this.MatchUps.set(team2, team1);
          //   }
          // }

          // dkData.Game_info = DKArr[i + 6];
          dkData.team = convertTeamNameDk(dkArr[7]); // search filter
      
          // if(dkData.Name !== undefined){
          //   this.DK.set(dkData.Name, dk_data);
          // }

        //   i += 8;
        // }
        allDkData.push(dkData);
      })

        resolve(allDkData);
      })
    } catch (err) {
      console.log(err);
    } 
  })
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



