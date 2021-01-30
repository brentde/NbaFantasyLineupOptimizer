const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const PlayerData = require('../models/PlayerData')
const router = express.Router();

const getPlayerData = async () => {
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
      let player = new PlayerData();

      player.player = playerArr[0];

      player.position = playerArr[1];
      player.age = Number(playerArr[2]);

      player.team = playerArr[3];
      player.games_played = Number(playerArr[4]);

      player.games_started = Number(playerArr[5]);
      player.minutes_played = Number(playerArr[6]);

      player.field_goals_made = Number(playerArr[7]);
      player.field_goals_att = Number(playerArr[8]);

      player.field_goals_pct = Number(playerArr[9]);
      player.three_pts_made = Number(playerArr[10]);

      player.three_pts_att = Number(playerArr[11]);
      player.three_pts_pct = Number(playerArr[12]);

      player.two_pts_made = Number(playerArr[13]);
      player.two_pts_att = Number(playerArr[14]);

      player.two_pts_pct = Number(playerArr[15]);
      player.eff_fg_pct = Number(playerArr[16]);

      player.ft_made = Number(playerArr[17]);
      player.ft_att = Number(playerArr[18]);

      player.ft_pct = Number(playerArr[19]);
      player.off_rbds = Number(playerArr[20]);

      player.def_rbds = Number(playerArr[21]);
      player.tot_rbds = Number(playerArr[22]);

      player.assists = Number(playerArr[23]);
      player.steals = Number(playerArr[24]);

      player.blocks = Number(playerArr[25]);
      player.turnovers = Number(playerArr[26]);

      player.pers_fouls = Number(playerArr[27]);
      player.points = Number(playerArr[28]);

      Players.push(player);
      beg += 29;
      end += 29;
    }

    return Players;
	} catch (error) {
		throw error;
	}
};

router.use((req, res) => {
  getPlayerData().then(player_data => res.send(player_data));
})

module.exports = router;
