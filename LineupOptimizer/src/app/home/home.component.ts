import { PlayerData } from './../shared/models/PlayerData';
import { TeamConversionService } from './../shared/services/team-conversion.service';
import { DkData } from '../shared/models/DkData';
import { TeamOppStats } from '../shared/models/TeamOppStats';
import { HomeService } from './home.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public uniqueCount: number = 0;
  public Players: Map<string, PlayerData> = new Map<string, PlayerData>();
  public sortedPlayers: Map<string, PlayerData>;
  public Teams: Map<string, TeamOppStats> = new Map<string, TeamOppStats>();
  public MatchUps: Map<string, string> = new Map<string, string>();
  public DK: Map<string, DkData> = new Map<string, DkData>();

  public Team_Totals: Map<string, TeamOppStats> = new Map<string, TeamOppStats>();
  private Opp_Averages: TeamOppStats = new TeamOppStats();

  // ***********************
  // Draftkings Categories
  // ***********************

  public PG: Map<string, PlayerData> = new Map<string, PlayerData>();
  public SG: Map<string, PlayerData> = new Map<string, PlayerData>();
  public SF: Map<string, PlayerData> = new Map<string, PlayerData>();
  public PF: Map<string, PlayerData> = new Map<string, PlayerData>();
  public C: Map<string, PlayerData> = new Map<string, PlayerData>();
  public G: Map<string, PlayerData> = new Map<string, PlayerData>();
  public F: Map<string, PlayerData> = new Map<string, PlayerData>();
  public UTIL: Map<string, PlayerData> = new Map<string, PlayerData>();

  // Key: Expected Fantasy Points, Value: Array of Players

  public Lineups: Map<number, PlayerData[]> = new Map<number, PlayerData[]>();
  public Lineup: Map<string, PlayerData> = new Map<string, PlayerData>();

  constructor(private homeService: HomeService,
              private TeamConversionService: TeamConversionService) { }

  ngOnInit() {
      this.getData();
  }

  public sortPlayers(): void {
    this.sortedPlayers = new Map<string, PlayerData>([...this.Players.entries()].sort((a, b) => b[1].val_ratio - a[1].val_ratio));

    this.sortedPlayers.forEach(value => {
        let DK_Player: DkData = this.DK.get(value.player);
        if(DK_Player !== undefined){
          if(DK_Player.Salary > 3300){
            let positions: string[] = DK_Player.Roster_position.split('/')

            positions.forEach(position => {
              this.insertIntoCategMap(position, value);
            })
          }
        }
    })
  }

  // I could change this so that it places all players into the appropriate categories
  // then if I need to select a lineup, I trim each dataset to contain the top 7 values

  // public insertIntoCategMap(category: string, player: PlayerData, optimization_value: number){
  //   if(category === 'PG'){
  //     if(this.PG.size < optimization_value){
  //       this.PG.set(player.player, player);
  //     }

  //     if(this.G.size < optimization_value){
  //       this.G.set(player.player, player);
  //     }

  //     if(this.UTIL.size < optimization_value){
  //       this.UTIL.set(player.player, player);
  //     }
  //   } else if(category === 'SG'){
  //     if(this.SG.size < optimization_value){
  //       this.SG.set(player.player, player);
  //     }

  //     if(this.G.size < optimization_value){
  //       this.G.set(player.player, player);
  //     }

  //     if(this.UTIL.size < optimization_value){
  //       this.UTIL.set(player.player, player);
  //     }
  //   } else if(category === 'SF'){
  //     if(this.SF.size < optimization_value){
  //       this.SF.set(player.player, player);
  //     }

  //     if(this.F.size < optimization_value){
  //       this.F.set(player.player, player);
  //     }

  //     if(this.UTIL.size < optimization_value){
  //       this.UTIL.set(player.player, player);
  //     }
  //   } else if(category === 'PF'){
  //     if(this.PF.size < optimization_value){
  //       this.PF.set(player.player, player);
  //     }

  //     if(this.F.size < optimization_value){
  //       this.F.set(player.player, player);
  //     }

  //     if(this.UTIL.size < optimization_value){
  //       this.UTIL.set(player.player, player);
  //     }
  //   } else if(category === 'C'){
  //     if(this.C.size < optimization_value){
  //       this.C.set(player.player, player);
  //     }

  //     if(this.UTIL.size < optimization_value){
  //       this.UTIL.set(player.player, player);
  //     }
  //   };
  // }

  public insertIntoCategMap(category: string, player: PlayerData){
      if(category === 'PG'){
          this.PG.set(player.player, player);
          this.G.set(player.player, player);
        } else if(category === 'SG'){
          this.SG.set(player.player, player);
          this.G.set(player.player, player);
      } else if(category === 'SF'){
          this.SF.set(player.player, player);
          this.F.set(player.player, player);
      } else if(category === 'PF'){
          this.PF.set(player.player, player);
          this.F.set(player.player, player);
      } else if(category === 'C'){
          this.C.set(player.player, player);
      };

      this.UTIL.set(player.player, player);
    } // insertIntoCategMap

  private getExpFantValSum(players: PlayerData[]): number{
    let total: number = 0;

    players.forEach(player => {
      total += player.exp_fv;
    })

    return total;
  }

  private getSalSum(players: PlayerData[]): number{
    let total: number = 0;

    players.forEach(player => {
      total += player.price;
    })

    return total;
  }

  private isUnique(players: PlayerData[]): boolean {
    for(let i: number = 0; i < players.length; i++){
      for(let j: number = 0; j < players.length; j++){
        if((players[i].player === players[j].player) && (j !== i)){
          return false;
        }
      }
    }

    return true;
  }

  private printLineups(): void{
    let sortedLineups = new Map<number, PlayerData[]>([...this.Lineups.entries()].sort((a, b) => this.getExpFantValSum(b[1]) - this.getExpFantValSum(a[1])));
    let top_three: number = 0;

    sortedLineups.forEach(lineup => {
      top_three++;

      if(top_three <= 3){
        console.log(`Lineup Expected Fantasy Value: ${this.getExpFantValSum(lineup)}`);
        console.log(`Lineup Price: ${this.getSalSum(lineup)}`);

        lineup.forEach(player => {
          console.log(`Name: ${player.player}, Exp Val: ${player.exp_fv}`);
        })
      }
    })
  }

  // The problem with this is by trimming the maps, I'm losing all of my previously calculated data

  public trimCategories(optimValue: number): void {
    if(!this.Lineup.has('PG')){
      let iter = this.PG.values();
      let playerMap: Map<string, PlayerData> = new Map<string, PlayerData>();

      for(let i = 0; i < optimValue; i++){
        playerMap.set(iter.next().value.player, iter.next().value);
      }

      this.PG = playerMap;
    }

    if(!this.Lineup.has('SG')){

    }

    if(!this.Lineup.has('SF')){

    }

    if(!this.Lineup.has('PF')){

    }

    if(!this.Lineup.has('C')){

    }

    if(!this.Lineup.has('G')){

    }

    if(!this.Lineup.has('F')){

    }

    if(!this.Lineup.has('UTIL')){

    }
  }

  // call selectLineups to automatially select a lineup for you
  public selectLineups(optimization_value: number){
    this.trimCategories();
    let lowest: number = 500;

    for(const [key, _sg] of this.SG.entries()){
      for(const [key, _pg] of this.PG.entries()){
        for(const [key, _sf] of this.SF.entries()){
          for(const [key, _pf] of this.PF.entries()){
            for(const [key, _c] of this.C.entries()){
              for(const [key, _g] of this.G.entries()){
                for(const [key, _f] of this.F.entries()){
                  for(const [key, _util] of this.UTIL.entries()){
                    let lineup: PlayerData[] = [];
                    lineup.push(_pg);
                    lineup.push(_sg);
                    lineup.push(_sf);
                    lineup.push(_pf);
                    lineup.push(_c);
                    lineup.push(_g);
                    lineup.push(_f);
                    lineup.push(_util);

                    if(this.getSalSum(lineup) <= 50000){
                      if(this.isUnique(lineup)){
                        if(!this.Lineups.has(this.getExpFantValSum(lineup))){
                          this.Lineups.set(this.getExpFantValSum(lineup), lineup);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    this.printLineups();
  } // Select Lineups

  private getData(): void {
    this.homeService.getPlayerData().subscribe(playerData => {
        playerData.forEach(player => {
          this.Players.set(player.player, player);
        });

        this.getInjuredPlayers();
        this.setTeamTotals();
        this.getTeamData();
    });
  }

  private getTeamData(): void {
    this.homeService.getTeamData().subscribe(team_data => {
          team_data.forEach(team => {
            this.Teams.set(team.team, team);
          });

          this.setOppAverages();
      });
  }

  private getDkData(): void {
    this.homeService.getDkData().subscribe(data => {

      let DKArr: string[] = data.split(',');
      let i: number = 0;

      while(i <= DKArr.length - 1){
        let dk_data: DkData = new DkData();

        dk_data.Position = DKArr[i];
        dk_data.Name_id = DKArr[i + 1];
        dk_data.Name = DKArr[i + 2];
        dk_data.Id = Number(DKArr[i + 3]);
        dk_data.Roster_position = DKArr[i + 4];
        dk_data.Salary = Number(DKArr[i + 5]);

        // Get Matchups

        if(DKArr[i + 6] !== undefined){
          let team1:string = DKArr[i + 6].split('@')[0];
          let team2:string = DKArr[i + 6].split('@')[1].split(' ')[0];

          if(!this.MatchUps.has(team1) && !this.MatchUps.has(team2)){
            if(team1 === 'SA'){
              team1 = 'SAS'
            }
            if(team2 === 'SA'){
              team2 = 'SAS'
            }

            if(team1 === 'GS'){
              team1 = 'GSW'
            }

            if(team2 === 'GS'){
              team2 = 'GSW'
            }

            if(team1 === 'NO'){
              team1 = 'NOP'
            }
            if(team2 === 'NO'){
              team2 = 'NOP'
            }

            if(team1 === 'NY'){
              team1 = 'NKY'
            }
            if(team2 === 'NY'){
              team2 = 'NYK'
            }

            this.MatchUps.set(team1, team2);
            this.MatchUps.set(team2, team1);
          }
        }

        dk_data.Game_info = DKArr[i + 6];
        dk_data.Team = DKArr[i + 7];
        dk_data.Avg_fantasy_ppg = Number(DKArr[i + 8]);

        if(dk_data.Name !== undefined){
          this.DK.set(dk_data.Name, dk_data);
        }

        i += 8;
      }

      this.calcFantasyVal();
    });
  }

  private calcFantasyVal(): void {
    let tot: number = 0;


    this.Players.forEach(player => {
      let bonusProgress: number = 0;

      let opponent: TeamOppStats = this.Teams.get(this.MatchUps.get(player.team));

      if(opponent !== undefined){

        // Calculate 3pt Value
        let exp3ptVal: number = ((player.three_pts_att * (player.three_pts_pct + ((opponent.three_pt_pct - this.Opp_Averages.three_pt_pct) / 100))) * 3.5)
        // Calculate 2pt Value
        let exp2ptVal: number = ((player.two_pts_att * (player.two_pts_pct + ((opponent.two_pt_pct - this.Opp_Averages.two_pt_pct) / 100))) * 2.0)
        if(((exp3ptVal/3.5) + (exp2ptVal/2.0)) > 10.0){
          bonusProgress += 1;
        }

        // Calculate Assist Value
        let assistPct: number = player.assists/this.Team_Totals.get(player.team).assists;
        let expAssistVal: number = (player.assists + assistPct * (opponent.assists - this.Opp_Averages.assists)) * 1.5;

        if((expAssistVal/1.5) >= 10.0){
          bonusProgress += 1;
        }
        // Calculate Rebound Value
        let reboundPct: number = player.tot_rbds/Number(this.Team_Totals.get(player.team).tot_rebounds);
        let expReboundVal: number = (player.tot_rbds + reboundPct * (opponent.tot_rebounds - this.Opp_Averages.tot_rebounds)) * 1.25;

        if((expReboundVal/1.25) >= 10.0){
          bonusProgress += 1;
        }

        // Calculate Steal Value
        let stealPct: number = player.steals/Number(this.Team_Totals.get(player.team).steals);
        let expStealVal: number = (player.steals + stealPct * (opponent.steals - this.Opp_Averages.steals)) * 2;


        if((expStealVal/2) >= 10.0){
          bonusProgress += 1;
        }

        // Calculate Block Value
        let blockPct: number = player.blocks/Number(this.Team_Totals.get(player.team).blocks);
        let expBlockVal: number = (player.blocks + blockPct * (opponent.blocks - this.Opp_Averages.blocks)) * 2;


        if((expBlockVal/2) >= 10.0){
          bonusProgress += 1;
        }

        // Calculate Turnover Value
        let turnoverPct: number = player.turnovers/Number(this.Team_Totals.get(player.team).turnovers);
        let expTurnoverVal: number = (player.turnovers + turnoverPct * (opponent.turnovers - this.Opp_Averages.turnovers)) * 0.5;

        let expFantasyPts: number = exp2ptVal + exp3ptVal + expAssistVal + expBlockVal + expReboundVal + expStealVal - expTurnoverVal;

        if(bonusProgress >= 2){
          expFantasyPts += 1.5;
        }

        if(bonusProgress >= 3){
          expFantasyPts += 3.0;
        }

        player.exp_fv = Number(expFantasyPts.toFixed(2));

        if(this.DK.has(player.player)){
          player.price = this.DK.get(player.player).Salary;
          player.val_ratio = (player.exp_fv/player.price * 1000);
        }
      }
    })
  }

  private setOppAverages(): void{
    this.Teams.forEach(team => {
      this.Opp_Averages.three_pt_pct += Number(team.three_pt_pct);
      this.Opp_Averages.two_pt_pct += Number(team.two_pt_pct);
      this.Opp_Averages.tot_rebounds += Number(team.tot_rebounds);
      this.Opp_Averages.steals += Number(team.steals);
      this.Opp_Averages.turnovers += Number(team.turnovers);
      this.Opp_Averages.assists += Number(team.assists);
      this.Opp_Averages.blocks += Number(team.blocks);
    })

    this.Opp_Averages.three_pt_pct = Number(this.Opp_Averages.three_pt_pct)/30;
    this.Opp_Averages.two_pt_pct = Number(this.Opp_Averages.two_pt_pct)/30;
    this.Opp_Averages.tot_rebounds = Number(this.Opp_Averages.tot_rebounds)/30;
    this.Opp_Averages.steals = Number(this.Opp_Averages.steals)/30;
    this.Opp_Averages.turnovers = Number(this.Opp_Averages.turnovers)/30;
    this.Opp_Averages.assists = Number(this.Opp_Averages.assists)/30;
    this.Opp_Averages.blocks = Number(this.Opp_Averages.blocks)/30;

    this.getDkData();
  } // Set Opp Averages

  private setTeamTotals(): void{
    this.Players.forEach(player => {
      if(!this.Team_Totals.has(player.team)){
        let team_totals: TeamOppStats = new TeamOppStats();

        this.Players.forEach(avg_player => {
            if(avg_player.team === player.team){
              team_totals.steals += avg_player.steals;
              team_totals.blocks += avg_player.blocks;
              team_totals.tot_rebounds += avg_player.tot_rbds;
              team_totals.turnovers += avg_player.turnovers;
              team_totals.assists += avg_player.assists;
            }
         })

        this.Team_Totals.set(player.team, team_totals)
      }
    })
  } // Set Team Totals

  private getInjuredPlayers(): void {
    this.homeService.getInjuredPlayersData().subscribe(inj_players => {
      let injPlayers: string[] = inj_players;

      injPlayers.forEach(player => {
        this.Players.delete(player);
      })
    })
  } // getInjuredPlayers

}
