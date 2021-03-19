const player_data_route = require('./routes/player_data_route');
const team_data_route = require('./routes/team_data_route');
const active_lineups_route = require('./routes/active_lineups_route');
const injury_status_route = require('./routes/injury_status_route');
const dk_data_route = require('./routes/dk_data');
const config = require('./config/config');
const express = require('express');
const app = express()
const dbService = require('./db.service');
const { refreshPlayerData, refreshTeamData, updateInjuries, updateDkData, getPlayer, getAllActiveByPosition, getTeam, getMatchups } = require('./mongoCRUD')


// MongoDB Connect
dbService.connect().then(() => {
    new Promise((resolve, reject) => {
     // Listen on port
     app.listen(config.port, (req, res) => {
      console.log(`Listening on port ${config.port}`);
      resolve();
    })
  }).then(() => {

    // Refresh player data on Sunday
    if(new Date().getDay() === 7){
      refreshPlayerData().then(() => {
        refreshTeamData().then(() => {
           updateDkData().then(() => {
            updateInjuries().then(() => {})
          })
        })
      })
    } else {
      updateDkData().then(() => {
        updateInjuries().then(() => {})
      })
    }
  })
})
.catch((err) => {
  console.log("Error: ", err);
  process.exit(1);  
})

// **************
// Angular APIs
// **************

app.get('/player-data', player_data_route);
app.get('/team-opp-data', team_data_route);
app.get('/active-lineups', active_lineups_route);
app.get('/injury-status', injury_status_route);
app.get('/dk-data', dk_data_route);
app.get('/get-player', (req, res) => {
    getPlayer(req.query.id).then(player => {
      res.send(player);
    })
})
app.get('/get-all-active-by-position', (req, res) => {
  getAllActiveByPosition(req.query.position).then(players => {
    res.send(players);
  })
})
app.get('/get-team', (req, res) => {
  getTeam(req.query.id).then(team => {
    res.send(team);
  })
})
app.get('get-matchups', (req, res) => {
  getMatchups().then(matchups => {
    res.send(matchups);
  })
})

// Close DB connection and exit app gracefully
function cleanup(){
  dbService.cleanup().then(() => {
    process.exit(0);
  });
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);




