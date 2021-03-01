const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();
const TeamOppStats = require('../models/TeamOppStats')

function convertTeamName(name) {
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

const getTeamData = async () => {
  try {
		const { data } = await axios.get(
			'http://www.hoopsstats.com/basketball/fantasy/nba/opponentstats/21/1/fgpct/1-1'
        );
		const $ = cheerio.load(data);
		const teamData = [];

		$('table.statscontent > tbody > tr > td').each((_idx, el) => {
			teamData.push($(el).text());
      });

    const teamOppStatObjs = [];
    let beg = 0;
    let end = 21;

    while(beg < teamData.length){
      const teamOppStatObjData = teamData.slice(beg, end);
      let teamOppStatObj = new TeamOppStats();

      teamOppStatObj.rank = Number(teamOppStatObjData[0]);
      teamOppStatObj.team = convertTeamName(teamOppStatObjData[1]);
      teamOppStatObj.games_played = Number(teamOppStatObjData[2]);
      teamOppStatObj.minutes_played = Number(teamOppStatObjData[3]);
      teamOppStatObj.points = Number(teamOppStatObjData[4]);
      teamOppStatObj.rebounds = Number(teamOppStatObjData[5]);
      teamOppStatObj.assists = Number(teamOppStatObjData[6]);
      teamOppStatObj.steals = Number(teamOppStatObjData[7]);
      teamOppStatObj.blocks = Number(teamOppStatObjData[8]);
      teamOppStatObj.turnovers = Number(teamOppStatObjData[9]);
      teamOppStatObj.personal_fouls = Number(teamOppStatObjData[10]);

      // Rebound Data
      teamOppStatObj.def_rebounds = Number(teamOppStatObjData[11]);
      teamOppStatObj.off_rebounds = Number(teamOppStatObjData[12]);
      teamOppStatObj.tot_rebounds = Number(teamOppStatObj.def_rebounds + teamOppStatObj.off_rebounds);

      // Field Goal Data
      let fieldGoalData = teamOppStatObjData[13].split('-');
      teamOppStatObj.field_goals_made = Number(fieldGoalData[0]);
      teamOppStatObj.field_goals_att = Number(fieldGoalData[1]);
      teamOppStatObj.field_goal_pct= Number(teamOppStatObjData[14]);

      // Three Point Data
      let threePtData = teamOppStatObjData[15].split('-');
      teamOppStatObj.three_pts_made = Number(threePtData[0]);
      teamOppStatObj.three_pts_att = Number(threePtData[1]);
      teamOppStatObj.three_pt_pct = Number(teamOppStatObjData[16]);

      // Calculate Two Point Data
      teamOppStatObj.two_pts_made = Number(teamOppStatObj.field_goals_made - teamOppStatObj.three_pts_made);
      teamOppStatObj.two_pts_att = Number(teamOppStatObj.field_goals_att - teamOppStatObj.three_pts_att);
      teamOppStatObj.two_pt_pct = Number(teamOppStatObj.two_pts_made/teamOppStatObj.two_pts_att);

      // Free Throw Data
      let ftData = teamOppStatObjData[17].split('-');
      teamOppStatObj.free_throws_made = Number(ftData[0]);
      teamOppStatObj.free_throws_att = Number(ftData[1]);
      teamOppStatObj.free_throw_pct = Number(teamOppStatObjData[18]);

      teamOppStatObj.eff = Number(teamOppStatObjData[19]);
      teamOppStatObj.deff = Number(teamOppStatObjData[20]);


      teamOppStatObjs.push(teamOppStatObj)
      beg += 21;
      end += 21;
    }

    return teamOppStatObjs;
	} catch (error) {
		throw error;
	}
};

router.use((req, res) => {
  getTeamData().then(team_data => res.send(team_data));
})

module.exports = router;
