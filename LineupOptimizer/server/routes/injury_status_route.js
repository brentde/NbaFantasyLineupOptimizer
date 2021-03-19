const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const router = express.Router();

const getInjuryStatus = async () => {
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

router.use((req, res) => {
  getInjuryStatus().then(players => res.send(players));
})

module.exports = router;
