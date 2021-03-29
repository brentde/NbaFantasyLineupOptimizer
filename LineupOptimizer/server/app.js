const config = require('./config/config');
const express = require('express');
const app = express()
const dbService = require('./db.service');
const { refreshPlayerData, refreshTeamData, updateInjuries, updateDkData, 
        getMatchups, getPlayers, getTeams, getPlayersByTeam } = require('./mongoCRUD')


// MongoDB Connect
dbService.connect().then(() => {
    new Promise((resolve, reject) => {
     // Listen on port
     app.listen(config.port, (req, res) => {
      console.log(`Listening on port ${config.port}`);
      resolve();
    })
  }).then(() => {
    console.log("Synchronizing MongoDB. This may take a minute....")
    // Refresh player data on Sunday
    if(new Date().getDay() === 7){
      refreshPlayerData().then(() => {
        refreshTeamData().then(() => {
           updateDkData().then(() => {
            updateInjuries().then(() => {
              console.log("Synchronization complete!")
            })
          })
        })
      })
    } else {
      updateDkData().then(() => {
        updateInjuries().then(() => {
          console.log("Synchronization Complete!");
        })
      })
     }
  })
})
.catch((err) => {
  console.log("Error: ", err);
  process.exit(1);  
})


// app.get('/get-player', (req, res) => {
//     getPlayer(req.query.id).then(player => {
//       res.send(player);
//     })
// })

// app.get('/get-all-active-by-position', (req, res) => {
//   getAllActiveByPosition(req.query.position).then(players => {
//     res.send(players);
//   })
// })

// app.get('/get-team', (req, res) => {
//   getTeam(req.query.id).then(team => {
//     res.send(team);
//   })
// })

app.get('/get-players', (req, res) => {
  getPlayers().then(players => {
    res.send(players);
  })
})

app.get('/get-matchups', (req, res) => {
  getMatchups().then(matchups => {
    res.send(matchups);
  })
})

app.get('/get-teams', (req, res) => {
  getTeams().then(teams => {
    res.send(teams);
  })
})

app.get('/get-players-by-team/:team', (req, res) => {
  getPlayersByTeam(req.params.team).then(players => {
    res.send(players);
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




