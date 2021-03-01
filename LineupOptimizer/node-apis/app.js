const express = require('express')
const player_data_route = require('./routes/player_data_route')
const team_data_route = require('./routes/team_data_route')
const active_lineups_route = require('./routes/active_lineups_route')
const injury_status_route = require('./routes/injury_status_route')
const dk_data_route = require('./routes/dk_data')
const https = require('https')

const app = express()

app.get('/player-data', player_data_route);
app.get('/team-opp-data', team_data_route);
app.get('/active-lineups', active_lineups_route);
app.get('/injury-status', injury_status_route);
app.get('/dk-data', dk_data_route);

app.listen(3000, (req, res) => {
  console.log("Listening on port 3000");
})
