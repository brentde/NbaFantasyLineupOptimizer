const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const Player = require('../models/Player')
const router = express.Router();
const fetch = require('node-fetch')

function convertTeamName(name) {
  if(name === 'BRK'){
    return "BKN";
  } 

  return name;
}

const getPlayerData = async () => {
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
  
        player.Name = playerArr[0];
    
        playerIds.has(player.player) ? player.Id = playerIds.get(player.Name) : player.Id = 0;
  
        player.Position = playerArr[1];
        player.Age = Number(playerArr[2]);
  
        player.Team = convertTeamName(playerArr[3]);
        player.Team_logo = `assets/shared/team_logo/${player.Team}.png`
        
        player.Games_played = Number(playerArr[4]);
  
        player.Games_started = Number(playerArr[5]);
        player.Minutes_played = Number(playerArr[6]);
  
        player.FG_made = Number(playerArr[7]);
        player.FG_att = Number(playerArr[8]);
  
        player.FG_pct = Number(playerArr[9]);
        player.Three_made = Number(playerArr[10]);
  
        player.Three_att = Number(playerArr[11]);
        player.Three_pct = Number(playerArr[12]);
  
        player.Two_made = Number(playerArr[13]);
        player.Two_att = Number(playerArr[14]);
  
        player.Two_pct = Number(playerArr[15]);
        player.Eff_fg_pct = Number(playerArr[16]);
  
        player.FT_made = Number(playerArr[17]);
        player.FT_att = Number(playerArr[18]);
  
        player.FT_pct = Number(playerArr[19]);
        player.Off_rbds = Number(playerArr[20]);
  
        player.Def_rbds = Number(playerArr[21]);
        player.Tot_rbds = Number(playerArr[22]);
  
        player.Assists = Number(playerArr[23]);
        player.Steals = Number(playerArr[24]);
  
        player.Blocks = Number(playerArr[25]);
        player.Turnovers = Number(playerArr[26]);
  
        player.PF = Number(playerArr[27]);
        player.Points = Number(playerArr[28]);

        player.Exp_fv = 0.0;
        player.Price = 0;
        player.Ratio = 0.0;
        player.Active = 'N';
        player.Injured = 'N';
  
        Players.push(player);
        beg += 29;
        end += 29;
      }
  
      return Players;
    } catch (error) {
      throw error;
    }
};


exports.getPlayerData = getPlayerData;
