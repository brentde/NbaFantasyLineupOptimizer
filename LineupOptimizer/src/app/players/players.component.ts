import { HomeService } from './../home/home.service';
import { PlayerData } from './../shared/models/PlayerData';
import { TeamConversionService } from './../shared/services/team-conversion.service';
import { DkData } from '../shared/models/DkData';
import { TeamOppStats } from '../shared/models/TeamOppStats';
import { Component, OnInit, ViewChild, Output, EventEmitter} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatTabGroup, MatTreeModule} from '@angular/material';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class PlayersComponent implements OnInit {

  @ViewChild(MatTabGroup, {static: false}) tabGroup: MatTabGroup;
  public loadingSubject: Subject<boolean> = new Subject<boolean>();

  selected: boolean = false;

  cur_index: number = 0;
  Total_Cost: number = 0;
  Total_Fntsy_Pts: number = 0;
  selectionDisplayedColumns: string[] = ["L_Name", "L_Team", "L_Exp_Fant_Pts", "L_Salary", "Remove_Btn"]
  dropDownColumns = ['Name', 'Team', 'Price', 'Exp Fantasy Val'];

  
  //*************
  // Table Data
  //************

  pgDataSource: PlayerData[];
  sgDataSource: PlayerData[];
  sfDataSource: PlayerData[];
  pfDataSource: PlayerData[];
  cDataSource: PlayerData[];
  gDataSource: PlayerData[];
  fDataSource: PlayerData[];
  utilDataSource: PlayerData[];
  selectionTableDataSource: PlayerData[];
  expandedElement: PlayerData | null;

  // All Player Statistics
  public Players: Map<string, PlayerData> = new Map<string, PlayerData>();

  // All Team Defensive Stat Data
  public Teams: Map<string, TeamOppStats> = new Map<string, TeamOppStats>();

  // Matchup Info
  public MatchUps: Map<string, string> = new Map<string, string>();

  // Sll DK Data
  public DK: Map<string, DkData> = new Map<string, DkData>();

  // This Map holds data on team stat totals which are used to determine how much 
  // of the teams overall stats a specific player contributes to
  public Team_Totals: Map<string, TeamOppStats> = new Map<string, TeamOppStats>();

  // **********************************************
  // Draftkings Categories for Display Purposes
  // **********************************************

  public dispPG: Map<string, PlayerData> = new Map<string, PlayerData>();
  public dispSG: Map<string, PlayerData> = new Map<string, PlayerData>();
  public dispSF: Map<string, PlayerData> = new Map<string, PlayerData>();
  public dispPF: Map<string, PlayerData> = new Map<string, PlayerData>();
  public dispC: Map<string, PlayerData> = new Map<string, PlayerData>();
  public dispG: Map<string, PlayerData> = new Map<string, PlayerData>();
  public dispF: Map<string, PlayerData> = new Map<string, PlayerData>();
  public dispUTIL: Map<string, PlayerData> = new Map<string, PlayerData>();

  // **********************************************
  // Draftkings Categories for Lineup Manipulation
  // **********************************************

  public  PG: Map<string, PlayerData> = new Map<string, PlayerData>();
  public  SG: Map<string, PlayerData> = new Map<string, PlayerData>();
  public  SF: Map<string, PlayerData> = new Map<string, PlayerData>();
  public  PF: Map<string, PlayerData> = new Map<string, PlayerData>();
  public  C: Map<string, PlayerData> = new Map<string, PlayerData>();
  public  G: Map<string, PlayerData> = new Map<string, PlayerData>();
  public  F: Map<string, PlayerData> = new Map<string, PlayerData>();
  public  UTIL: Map<string, PlayerData> = new Map<string, PlayerData>();

  // Key: Expected Fantasy Points, Value: Array of Players

  public Lineup: Map<string, PlayerData> = new Map<string, PlayerData>();
  
  constructor(private homeService: HomeService,
    private TeamConversionService: TeamConversionService) { }

  ngOnInit() {
    this.getData();
    this.clearLineup();
    this.emitLoadingEventToChild(true);
  }

  public emitLoadingEventToChild(status: boolean): void {
    this.loadingSubject.next(status);
  }

  // **************************
  // Retrieve and set all data
  // **************************

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

  // ************************
  // Get Injured Players
  // ************************

  private getInjuredPlayers(): void {
    this.homeService.getInjuredPlayersData().subscribe(inj_players => {
      let injPlayers: string[] = inj_players;

      // If a player is injured, remove the player for the list
      injPlayers.forEach(player => {
        this.Players.delete(player);
      })
    })
  } // getInjuredPlayers

  // ************************
  // Set Team Totals
  // ************************

  private setTeamTotals(): void{
    // Iterate though Players read in from bbref
    this.Players.forEach(player => {
      let team_totals: TeamOppStats;

      // If team exist, get team and keep adding stats to totals
      if(this.Team_Totals.has(player.team)){
        team_totals = this.Team_Totals.get(player.team);
      } else {
        team_totals = new TeamOppStats();
      }

      // Accumulate team stats
      team_totals.steals += player.steals;
      team_totals.blocks += player.blocks;
      team_totals.tot_rebounds += player.tot_rbds;
      team_totals.turnovers += player.turnovers;
      team_totals.assists += player.assists;
      
      // set or update team total stats
      this.Team_Totals.set(player.team, team_totals)
    })
  } 

  // ************************
  // Get Team Data
  // ************************

  private getTeamData(): void {
    this.homeService.getTeamData().subscribe(team_data => {
          team_data.forEach(team => {
            this.Teams.set(team.team, team);
          });

          this.getDkData();
      });
  }

  // ************************
  // Get DK Data
  // ************************

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
          let team1:string = this.TeamConversionService.convertTeamName(DKArr[i + 6].split('@')[0]);
          let team2:string = this.TeamConversionService.convertTeamName(DKArr[i + 6].split('@')[1].split(' ')[0]);

          if(!this.MatchUps.has(team1) && !this.MatchUps.has(team2)){
            this.MatchUps.set(team1, team2);
            this.MatchUps.set(team2, team1);
          }
        }

        dk_data.Game_info = DKArr[i + 6];
        dk_data.Team = this.TeamConversionService.convertTeamName(DKArr[i + 7]);
        dk_data.Avg_fantasy_ppg = Number(DKArr[i + 8]);

        if(dk_data.Name !== undefined){
          this.DK.set(dk_data.Name, dk_data);
        }

        i += 8;
      }

      this.calcFantasyVal();
    });
  }

  // ************************************************
  // Calculate Player Expected Fantasy Value
  // ************************************************

  private calcFantasyVal(): void {
    let Opp_Averages: TeamOppStats = new TeamOppStats();
    this.setOppAverages(Opp_Averages);

    this.Players.forEach(player => {
      let bonusProgress: number = 0;

      let opponent: TeamOppStats = this.Teams.get(this.MatchUps.get(player.team));

      if(opponent !== undefined){

        // Calculate 3pt Value
        player.three_pts_exp  = Number((player.three_pts_att * (player.three_pts_pct + ((opponent.three_pt_pct - Opp_Averages.three_pt_pct) / 100))).toFixed(2));
        // Calculate 2pt Value
        player.two_pts_exp = Number((player.two_pts_att * (player.two_pts_pct + ((opponent.two_pt_pct - Opp_Averages.two_pt_pct) / 100))).toFixed(2));
      

        if((player.three_pts_exp + player.two_pts_exp) > 10.0){
          bonusProgress += 1;
        }

        // Calculate Assist Value
        let assistPct: number = player.assists/this.Team_Totals.get(player.team).assists;
        player.assists_exp = Number((player.assists + assistPct * (opponent.assists - Opp_Averages.assists)).toFixed(2));

        if(player.assists_exp >= 10.0){
          bonusProgress += 1;
        }

        // Calculate Rebound Value
        let reboundPct: number = player.tot_rbds/Number(this.Team_Totals.get(player.team).tot_rebounds);
        player.rbs_exp = Number((player.tot_rbds + reboundPct * (opponent.tot_rebounds - Opp_Averages.tot_rebounds)).toFixed(2));

        if(player.rbs_exp >= 10.0){
          bonusProgress += 1;
        }

        // Calculate Steal Value
        let stealPct: number = player.steals/Number(this.Team_Totals.get(player.team).steals);
        player.steals_exp = Number((player.steals + stealPct * (opponent.steals - Opp_Averages.steals)).toFixed(2));


        if(player.steals_exp  >= 10.0){
          bonusProgress += 1;
        }

        // Calculate Block Value
        let blockPct: number = player.blocks/Number(this.Team_Totals.get(player.team).blocks);
        player.blocks_exp = Number((player.blocks + blockPct * (opponent.blocks - Opp_Averages.blocks)).toFixed(2));


        if(player.blocks_exp  >= 10.0){
          bonusProgress += 1;
        }

        // Calculate Turnover Value
        let turnoverPct: number = player.turnovers/Number(this.Team_Totals.get(player.team).turnovers);
        player.turnovers_exp = Number((player.turnovers + turnoverPct * (opponent.turnovers - Opp_Averages.turnovers)).toFixed(2));

        let expFantasyPts: number = (player.two_pts_exp * 2) + player.three_pts_exp * 3.5 +  player.assists_exp  * 1.5 + 
                                    player.blocks_exp * 2.0 + player.rbs_exp * 1.25 +  player.steals_exp * 2.0 -  player.turnovers_exp  * 0.5;

        if(bonusProgress >= 2){
          expFantasyPts += 1.5;
        }

        if(bonusProgress >= 3){
          expFantasyPts += 3.0;
        }

        player.exp_fv = Number(expFantasyPts.toFixed(2));

        if(this.DK.has(player.player)){
          player.price = this.DK.get(player.player).Salary;
          player.val_ratio = Number((player.exp_fv/player.price * 1000).toFixed(2));
        }
      }
    })

    this.sortPlayers();
  }

   // ************************
  // Set Opponent Averages
  // ************************

  private setOppAverages(Opp_Averages: TeamOppStats): void{
    this.Teams.forEach(team => {
      Opp_Averages.three_pt_pct += Number(team.three_pt_pct);
      Opp_Averages.two_pt_pct += Number(team.two_pt_pct);
      Opp_Averages.tot_rebounds += Number(team.tot_rebounds);
      Opp_Averages.steals += Number(team.steals);
      Opp_Averages.turnovers += Number(team.turnovers);
      Opp_Averages.assists += Number(team.assists);
      Opp_Averages.blocks += Number(team.blocks);
    })

    Opp_Averages.three_pt_pct = Number(Opp_Averages.three_pt_pct)/30;
    Opp_Averages.two_pt_pct = Number(Opp_Averages.two_pt_pct)/30;
    Opp_Averages.tot_rebounds = Number(Opp_Averages.tot_rebounds)/30;
    Opp_Averages.steals = Number(Opp_Averages.steals)/30;
    Opp_Averages.turnovers = Number(Opp_Averages.turnovers)/30;
    Opp_Averages.assists = Number(Opp_Averages.assists)/30;
    Opp_Averages.blocks = Number(Opp_Averages.blocks)/30;
  } 

  // ******************************
  // Sort Players Into Categories
  // ******************************

  public sortPlayers(): void {
    this.Players.forEach(player => {   
        let DK_Player: DkData = this.DK.get(player.player);
        if(player.exp_fv > 0){
        if(DK_Player !== undefined){
          if(DK_Player.Salary >= 3200){
            let positions: string[] = DK_Player.Roster_position.split('/')

            positions.forEach(position => {
              this.insertIntoCategMap(position, player);
            })
          }
        }
      }
    })

    this.refreshDataSource();
    this.refreshLineup();
  }

  // Create Copy of Player with updated category position and status

  private createNewPlayer(player: PlayerData, position: string): PlayerData {
    let ret_player: PlayerData = JSON.parse(JSON.stringify(player));
    ret_player.position = position;
    ret_player.active = 'Y';
    return ret_player;
  }

  // *****************************************************
  // All Players get sorted into the appropriate category
  // *****************************************************
  
  public insertIntoCategMap(category: string, player: PlayerData){
    if(category === 'PG'){
        this.dispPG.set(player.player, this.createNewPlayer(player, category));
        this.dispG.set(player.player, this.createNewPlayer(player, 'G'));
      } else if(category === 'SG'){
        this.dispSG.set(player.player, this.createNewPlayer(player, category));
        this.dispG.set(player.player, this.createNewPlayer(player, 'G'));
    } else if(category === 'SF'){
        this.dispSF.set(player.player, this.createNewPlayer(player, category));
        this.dispF.set(player.player, this.createNewPlayer(player, 'F'));
    } else if(category === 'PF'){
        this.dispPF.set(player.player, this.createNewPlayer(player, category));
        this.dispF.set(player.player, this.createNewPlayer(player, 'F'));
    } else if(category === 'C'){
        this.dispC.set(player.player, this.createNewPlayer(player, category));
    };

    this.dispUTIL.set(player.player, this.createNewPlayer(player, 'UTIL'));
  } 
  
  public clearLineup() {
    let positions = ['PG', 'SG', 'SF', 'PF', 'C', 'G', 'F', 'UTIL'];

    positions.forEach(position => {
      let player: PlayerData = new PlayerData();
      player.position = position;

      if(this.Lineup.has(position) && this.Lineup.get(position).player != '')
        this.togglePlayerStatus(this.Lineup.get(position), 'Y');

      this.Lineup.set(position, player);
    })

    this.refreshDataSource();
    this.updateTotals();
  }

  public removePlayer(player: PlayerData){
    let def_player: PlayerData = new PlayerData()
    this.togglePlayerStatus(player, 'Y');
    this.Lineup.set(player.position, def_player);
    this.refreshDataSource();
    this.updateTotals();
  }


  // **********************
  // Select Lineups
  // *********************

  public selectLineup(){
     
   this.trimCategories();

    for(const [key, _sg] of this.SG.entries()){
      for(const [key, _pg] of this.PG.entries()){
        for(const [key, _sf] of this.SF.entries()){
          for(const [key, _pf] of this.PF.entries()){
            for(const [key, _c] of this.C.entries()){
              for(const [key, _g] of this.G.entries()){
                for(const [key, _f] of this.F.entries()){
                  for(const [key, _util] of this.UTIL.entries()){
                    let lineup: PlayerData[] = [_pg, _sg, _sf, _pf, _c, _g, _f, _util];
                    let positions: string[] = ['PG', 'SG', 'SF', 'PF', 'C', 'G', 'F', 'UTIL'];
  
                    if(this.getSalSum(lineup) <= 50000){
                      if(this.lineupIsUnique(lineup)){
                        if(this.getExpFantValSum(lineup) > this.getLineupSum()){  
                          for(let i = 0; i < positions.length; i++)
                            this.Lineup.set(positions[i], lineup[i]);
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

    this.refreshLineup();
    this.updateTotals();
  } // Select Lineups

  /*
  *  Function trimpCategories()
  *  Checks to see if a player has already been selected for each category
  *  If not, fill the category map with n number of players
  *  These maps will then by iterated through to find the best possible line up
  * with remaining players.
  */

 public trimCategories(): void {
  let players_left = 0; 
  let salary_filter = 0;
  let optimValue = 7;

  Array.from(this.Lineup.values()).filter(player => {
    if(player.player === ''){
      players_left++;
    }
  })

  salary_filter = ((50000 - this.getSalSum(Array.from(this.Lineup.values())))/players_left) + 2000 - (2000 * ((8-players_left)/8));
  optimValue = 7 + (8 - players_left);
  salary_filter = 7500;

  if(!this.Lineup.has('PG') || (this.Lineup.has('PG') && this.Lineup.get('PG').player === '')){ 
    let _pgs: PlayerData[] = Array.from(this.dispPG.values()).filter((player) => player.active === 'Y' && player.price < salary_filter 
                                                                    && player.val_ratio > 4.0).sort((a,b) => (a.exp_fv < b.exp_fv) ? 1 : -1);


    let playerMap: Map<string, PlayerData> = new Map<string, PlayerData>();

    for(let i = 0; i < optimValue; i++){
      playerMap.set(_pgs[i].player, _pgs[i]);
    }

    this.PG = playerMap;
  } else {
    this.PG = new Map<string, PlayerData>([[this.Lineup.get('PG').player, this.Lineup.get('PG')]])
  }

  if(!this.Lineup.has('SG') || (this.Lineup.has('SG') && this.Lineup.get('SG').player === '')){
    let _sgs: PlayerData[] = Array.from(this.dispSG.values()).filter((player) => player.active === 'Y' 
                                                                      && player.price < salary_filter 
                                                                      && player.val_ratio > 4.0)
                                                                      .sort((a,b) => (a.exp_fv < b.exp_fv) ? 1 : -1);

    let playerMap: Map<string, PlayerData> = new Map<string, PlayerData>();

    for(let i = 0; i < optimValue; i++){
      playerMap.set(_sgs[i].player, _sgs[i]);
    }

    this.SG = playerMap;
  } else {
    this.SG = new Map<string, PlayerData>([[this.Lineup.get('SG').player, this.Lineup.get('SG')]])
  }

  if(!this.Lineup.has('SF') || (this.Lineup.has('SF') && this.Lineup.get('SF').player === '')){
    let _sfs: PlayerData[] = Array.from(this.dispSF.values()).filter((player) => player.active === 'Y' 
                                                                      && player.price < salary_filter 
                                                                      && player.val_ratio > 4.0)
                                                                      .sort((a,b) => (a.exp_fv < b.exp_fv) ? 1 : -1);

    let playerMap: Map<string, PlayerData> = new Map<string, PlayerData>();

    for(let i = 0; i < optimValue; i++){
      playerMap.set(_sfs[i].player, _sfs[i]);
    }

    this.SF = playerMap;
  } else {
    this.SF = new Map<string, PlayerData>([[this.Lineup.get('SF').player, this.Lineup.get('SF')]])
  }

  if(!this.Lineup.has('PF') || (this.Lineup.has('PF') && this.Lineup.get('PF').player === '')){
    let _pfs: PlayerData[] = Array.from(this.dispPF.values()).filter((player) => player.active === 'Y' 
                                                                    && player.price < salary_filter 
                                                                    && player.val_ratio > 4.0)
                                                                    .sort((a,b) => (a.exp_fv < b.exp_fv) ? 1 : -1);
    let playerMap: Map<string, PlayerData> = new Map<string, PlayerData>();

    for(let i = 0; i < optimValue; i++){
      playerMap.set(_pfs[i].player, _pfs[i]);
    }

    this.PF = playerMap;
  } else {
    this.PF = new Map<string, PlayerData>([[this.Lineup.get('PF').player, this.Lineup.get('PF')]])
  }

  if(!this.Lineup.has('C') || (this.Lineup.has('C') && this.Lineup.get('C').player === '')){
    let _cs: PlayerData[] = Array.from(this.dispC.values()).filter((player) => player.active === 'Y' 
                                                                  && player.price <= salary_filter 
                                                                  && player.val_ratio > 4.0)
                                                                  .sort((a,b) => (a.exp_fv < b.exp_fv) ? 1 : -1);

    let playerMap: Map<string, PlayerData> = new Map<string, PlayerData>();

    for(let i = 0; i < optimValue; i++){
      playerMap.set(_cs[i].player, _cs[i]);
    }

    this.C = playerMap;
  } else {
    this.C = new Map<string, PlayerData>([[this.Lineup.get('C').player, this.Lineup.get('C')]])
  }

  if(!this.Lineup.has('G') || (this.Lineup.has('G') && this.Lineup.get('G').player === '')){
    let _gs: PlayerData[] = Array.from(this.dispG.values()).filter((player) => player.active === 'Y' 
                                                                    && player.price <= salary_filter 
                                                                    && player.val_ratio > 4.0)
                                                                    .sort((a,b) => (a.exp_fv < b.exp_fv) ? 1 : -1);

    let playerMap: Map<string, PlayerData> = new Map<string, PlayerData>();

    for(let i = 0; i < optimValue; i++){
      playerMap.set(_gs[i].player, _gs[i]);
    }

    this.G = playerMap;
  } else {
    this.G = new Map<string, PlayerData>([[this.Lineup.get('G').player, this.Lineup.get('G')]])
  }

  if(!this.Lineup.has('F') || (this.Lineup.has('F') && this.Lineup.get('F').player === '')){
    let _fs: PlayerData[] = Array.from(this.dispF.values()).filter((player) => player.active === 'Y' 
                                                                    && player.price <= salary_filter
                                                                    && player.val_ratio > 4.0)
                                                                    .sort((a,b) => (a.exp_fv < b.exp_fv) ? 1 : -1);

    let playerMap: Map<string, PlayerData> = new Map<string, PlayerData>();

    for(let i = 0; i < optimValue; i++){
      playerMap.set(_fs[i].player, _fs[i]);
    }

    this.F = playerMap;
  } else {
    this.F = new Map<string, PlayerData>([[this.Lineup.get('F').player, this.Lineup.get('F')]])
  }

  if(!this.Lineup.has('UTIL') || (this.Lineup.has('UTIL') && this.Lineup.get('UTIL').player === '')){
    let _utils: PlayerData[] = Array.from(this.dispUTIL.values()).filter((player) => player.active === 'Y' 
                                                                    && player.price < salary_filter 
                                                                    && player.val_ratio > 4.0)
                                                                    .sort((a,b) => (a.exp_fv < b.exp_fv) ? 1 : -1);

    let playerMap: Map<string, PlayerData> = new Map<string, PlayerData>();

    for(let i = 0; i < optimValue; i++){
      playerMap.set(_utils[i].player, _utils[i]);
    }

    this.UTIL = playerMap;
  } else {
    this.UTIL = new Map<string, PlayerData>([[this.Lineup.get('UTIL').player, this.Lineup.get('UTIL')]])
  }

}

public refreshDataSource(): void {
  this.emitLoadingEventToChild(true);
  this.pgDataSource = Array.from(this.dispPG.values()).filter(player => player.active === 'Y');
  this.sgDataSource  = Array.from(this.dispSG.values()).filter(player => player.active === 'Y');
  this.sfDataSource  = Array.from(this.dispSF.values()).filter(player => player.active === 'Y');
  this.pfDataSource  = Array.from(this.dispPF.values()).filter(player => player.active === 'Y');
  this.cDataSource  = Array.from(this.dispC.values()).filter(player => player.active === 'Y');
  this.gDataSource  = Array.from(this.dispG.values()).filter(player => player.active === 'Y');
  this.fDataSource = Array.from(this.dispF.values()).filter(player => player.active === 'Y');
  this.utilDataSource  = Array.from(this.dispUTIL.values()).filter(player => player.active === 'Y');
  this.refreshLineup();
  this.emitLoadingEventToChild(false);
}

public refreshLineup(): void {
  this.selectionTableDataSource =  Array.from(this.Lineup.values());
}

public lineupAdd(player_data: any): void{
  let player: PlayerData = player_data.player;

  if(this.Lineup.size < 9){
    // If position is filled, re-add player to display list
    if(this.Lineup.has(player.position)){
      if(this.Lineup.get(player.position).player !== ''){
        this.togglePlayerStatus(this.Lineup.get(player.position), 'Y');
      }
    }

    // set new player at position & update table totals
    this.Lineup.set(player.position, player);
    this.updateTotals();

    // remove player from tables
    this.togglePlayerStatus(player, 'N');
    
    // refresh data source
    this.refreshDataSource();

    // prevent scroll bug with expansion panel
    this.selected = false;
    
    // Move mat-tab to next category
    if(this.tabGroup.selectedIndex != 7){
      this.tabGroup.selectedIndex += 1;
    } 
  }
}

  public togglePlayerStatus(player: PlayerData, active: string): void {
    if(this.dispSG.has(player.player))
      this.dispSG.get(player.player).active = active;

    if(this.dispPG.has(player.player))
      this.dispPG.get(player.player).active = active;

    if(this.dispSF.has(player.player))
      this.dispSF.get(player.player).active = active;

    if(this.dispPF.has(player.player))
      this.dispPF.get(player.player).active = active;

    if(this.dispC.has(player.player))
      this.dispC.get(player.player).active = active;

    if(this.dispG.has(player.player))
      this.dispG.get(player.player).active = active;

    if(this.dispF.has(player.player))
      this.dispF.get(player.player).active = active;

    this.dispUTIL.get(player.player).active = active;
  }

  private getLineupSum(): number {
    let sum: number = 0;

    for(const [key, player] of this.Lineup.entries()){
      sum += player.exp_fv;
    }

    return sum;
  }

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

  private lineupIsUnique(players: PlayerData[]): boolean {
    for(let i: number = 0; i < players.length; i++){
      for(let j: number = 0; j < players.length; j++){
        if((players[i].player === players[j].player) && (j !== i)){
          return false;
        }
      }
    }

    return true;
  }

  private updateTotals(){
    this.Total_Cost = this.getSalSum(Array.from(this.Lineup.values()));
    this.Total_Fntsy_Pts = Number(this.getLineupSum().toFixed(2));
  }
}
