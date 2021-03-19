const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const router = express.Router();

const getStarters = async () => {
  try {
    const { data } = await axios.get(
      'https://www.rotowire.com/daily/nba/value-report.php'
        );
    const $ = cheerio.load(data);
    const activeLineups = [];

    $('div.webix_cell').each((_idx, el) => {
      activeLineups.push($(el).text())
        });

    return activeLineups;
  } catch (error) {
    throw error;
  }
};

router.use((req, res) => {
  getStarters().then(starters => res.send(starters));
})

module.exports = router;
