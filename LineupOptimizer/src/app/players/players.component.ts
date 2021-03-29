import { MongodbService } from './../shared/services/mongodb.service';
import { Component, OnInit, ViewChild, Output, EventEmitter} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatTabGroup } from '@angular/material';
import { Subject } from 'rxjs';
import { Player } from '../shared/models/Player';
import { Matchup } from '../shared/models/Matchup';
import { Team } from './../shared/models/Team';


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
  totalCost: number = 0;
  totalFntsyPts: number = 0;
  selectionDisplayedColumns: string[] = ["L_Name", "L_Team", "L_Exp_Fant_Pts", "L_Salary", "Remove_Btn"]
  dropDownColumns = ['Name', 'Team', 'Price', 'Exp Fantasy Val'];

  //*************
  // Table Data
  //************

  pgDataSource: Player[];
  sgDataSource: Player[];
  sfDataSource: Player[];
  pfDataSource: Player[];
  cDataSource: Player[];
  gDataSource: Player[];
  fDataSource: Player[];
  utilDataSource: Player[];
  selectionTableDataSource: Player[];

  // **********************************************
  // Draftkings Categories for Display Purposes
  // **********************************************

  public dispPG: Map<string, Player> = new Map<string, Player>();
  public dispSG: Map<string, Player> = new Map<string, Player>();
  public dispSF: Map<string, Player> = new Map<string, Player>();
  public dispPF: Map<string, Player> = new Map<string, Player>();
  public dispC: Map<string, Player> = new Map<string, Player>();
  public dispG: Map<string, Player> = new Map<string, Player>();
  public dispF: Map<string, Player> = new Map<string, Player>();
  public dispUTIL: Map<string, Player> = new Map<string, Player>();

  // **********************************************
  // Draftkings Categories for Lineup Manipulation
  // **********************************************

  public PG: Map<string, Player> = new Map<string, Player>();
  public SG: Map<string, Player> = new Map<string, Player>();
  public SF: Map<string, Player> = new Map<string, Player>();
  public PF: Map<string, Player> = new Map<string, Player>();
  public C: Map<string, Player> = new Map<string, Player>();
  public G: Map<string, Player> = new Map<string, Player>();
  public F: Map<string, Player> = new Map<string, Player>();
  public UTIL: Map<string, Player> = new Map<string, Player>();

  // Key: Expected Fantasy Points, Value: Array of Players

  // public Lineup: Map<string, PlayerData> = new Map<string, PlayerData>();
  public lineup: Map<string, Player> = new Map<string, Player>();

  public players: Player[] = [];
  public teams: Map<string, Team> = new Map<string, Team>();
  public matchups: Map<string, Matchup> = new Map<string, Matchup>();
  
  constructor(private mongoService: MongodbService){}

  ngOnInit() {
    this.getAllData();
    this.clearLineup();
    this.emitLoadingEventToChild(true);
  }

  public getAllData() {
    this.mongoService.getTeams().subscribe(teams => {
      // set teams map 
      teams.forEach(team => {
        this.teams.set(team.name, team);
      })

      // set matchups map
      this.mongoService.getMatchups().subscribe(matchups => {
        
        matchups.forEach(matchup => {
          // May need to add away team to this is all, but that will complicate the top bar display
          this.matchups.set(matchup.home, matchup);  
        })

          // get players and calculate value
        this.mongoService.getPlayers().subscribe(players => {
          players.forEach(player => {
            this.calcFV(player);
          })

          this.refreshDataSource();
        })
      })
    })
  }

  public emitLoadingEventToChild(status: boolean): void {
    this.loadingSubject.next(status);
  }

  private calcFV(player: Player): void {
    let averages: Team = this.getOppAverages();
 
    let bonusProgress: number = 0;
    let oppTeam: Team;

    if(this.matchups.get(player.team)){
      // Player is part of the home team, so get away team stats
      oppTeam = this.teams.get(this.matchups.get(player.team).away);
    } else {

      // Player is from the away team, get home team stats
      for(const [key, matchup] of this.matchups.entries()){
        if(matchup.away == player.team){
          oppTeam = this.teams.get(matchup.home);
        }
      }
    }

      // Calculate 3pt Value
      player.threesExp  = Number((player.threesAtt * (player.threePct + ((oppTeam.threePct - averages.threePct) / 100))).toFixed(2));
      // Calculate 2pt Value
      player.twosExp  = Number((player.twosAtt * (player.twoPct + ((oppTeam.twoPct - averages.twoPct) / 100))).toFixed(2));
    
      if((player.threesExp + player.twosExp + player.ftMade) > 10.0){
        bonusProgress += 1;
      }

      // Calculate Assist Value
      let assistPct: number = player.assists/this.teams.get(player.team).assists;
      player.assistsExp = Number((player.assists + assistPct * (oppTeam.assists - averages.assists)).toFixed(2));

      if(player.assistsExp >= 10.0){
        bonusProgress += 1;
      }

      // Calculate Rebound Value
      let reboundPct: number = player.totRbds/Number(this.teams.get(player.team).totRbds);
      player.rbdsExp = Number((player.totRbds + reboundPct * (oppTeam.totRbds - averages.totRbds)).toFixed(2));

      if(player.rbdsExp >= 10.0){
        bonusProgress += 1;
      }

      // Calculate Steal Value
      let stealPct: number = player.steals/Number(this.teams.get(player.team).steals);
      player.stealsExp = Number((player.steals + stealPct * (oppTeam.steals - averages.steals)).toFixed(2));


      if(player.stealsExp  >= 10.0){
        bonusProgress += 1;
      }

      // Calculate Block Value
      let blockPct: number = player.blocks/Number(this.teams.get(player.team).blocks);
      player.blocksExp = Number((player.blocks + blockPct * (oppTeam.blocks - averages.blocks)).toFixed(2));


      if(player.blocksExp  >= 10.0){
        bonusProgress += 1;
      }

      // Calculate Turnover Value
      let turnoverPct: number = player.turnovers/Number(this.teams.get(player.team).turnovers);
      player.turnoversExp = Number((player.turnovers + turnoverPct * (oppTeam.turnovers - averages.turnovers)).toFixed(2));

      let expFantasyPts: number = (player.twosExp * 2) + player.threesExp * 3.5 +  player.assistsExp  * 1.5 + player.ftMade + 
                                  player.blocksExp * 2.0 + player.rbdsExp * 1.25 +  player.stealsExp * 2.0 -  (player.turnoversExp + player.pf)  * 0.5;

      if(bonusProgress >= 2){
        expFantasyPts += 1.5;
      }

      if(bonusProgress >= 3){
        expFantasyPts += 3.0;
      }

      player.expFv = Number(expFantasyPts.toFixed(2));
      player.ratio = Number(((player.expFv/player.price) * 1000).toFixed(2));

      this.insertIntoCatMap(player);  
  }

  private insertIntoCatMap(player: Player){
      if(player.position == 'PG') this.dispPG.set(player.name, player);
      if(player.position == 'SG') this.dispSG.set(player.name, player);
      if(player.position == 'SF') this.dispSF.set(player.name, player);
      if(player.position == 'PF') this.dispPF.set(player.name, player);
      if(player.position == 'C') this.dispC.set(player.name, player);
      if(player.position == 'G') this.dispG.set(player.name, player);
      if(player.position == 'F') this.dispF.set(player.name, player);
      if(player.position == 'UTIL') this.dispUTIL.set(player.name, player);
  }

  private getOppAverages(): Team {
    let averages: Team = new Team();

    this.teams.forEach(team => {
      averages.threePct += Number(team.threePct); 
      averages.twoPct += Number(team.twoPct);
      averages.totRbds += Number(team.totRbds); 
      averages.steals += Number(team.steals);
      averages.turnovers += Number(team.turnovers);
      averages.assists += Number(team.assists);
      averages.blocks += Number(team.blocks);
    })

    averages.threePct = Number(averages.threePct/30);
    averages.twoPct = Number(averages.twoPct/30);
    averages.totRbds = Number(averages.totRbds/30);
    averages.steals = Number(averages.steals/30);
    averages.turnovers = Number(averages.turnovers/30);
    averages.assists = Number(averages.assists/30);
    averages.blocks = Number(averages.blocks/30);

    return averages;
  } 

  public clearLineup() {
    let positions = ['PG', 'SG', 'SF', 'PF', 'C', 'G', 'F', 'UTIL'];

    positions.forEach(position => {
      let player: Player = new Player();
      player.position = position;

      if(this.lineup.has(position) && this.lineup.get(position).name != '')
        this.togglePlayerStatus(this.lineup.get(position), 'Y');

      this.lineup.set(position, player);
    })

    this.refreshDataSource();
    this.updateTotals();
  }

  public removePlayer(player: Player){
    // create default player for table
    let defPlayer: Player = new Player()

    // toggle player status show they show up in selectable players
    this.togglePlayerStatus(player, 'Y');

    // set lineup position to default (empty)
    this.lineup.set(player.position, defPlayer);

    // refresh
    this.refreshDataSource();

    // update total
    this.updateTotals();
  }

  // **********************
  // Select Lineups
  // **********************

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
                     let lineup: Player[] = [_pg, _sg, _sf, _pf, _c, _g, _f, _util];
                     let positions: string[] = ['PG', 'SG', 'SF', 'PF', 'C', 'G', 'F', 'UTIL'];
   
                     if(this.getSalSum(lineup) <= 50000){
                       if(this.lineupIsUnique(lineup)){
                         if(this.getExpFantValSum(lineup) > this.getLineupSum()){  
                           for(let i = 0; i < positions.length; i++)
                             this.lineup.set(positions[i], lineup[i]);
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

  Array.from(this.lineup.values()).filter(player => {
    if(player.name === ''){
      players_left++;
    }
  })

  salary_filter = ((50000 - this.getSalSum(Array.from(this.lineup.values())))/players_left) + 2000 - (2000 * ((8-players_left)/8));
  optimValue = 7 + (8 - players_left);
  salary_filter = 7500;

  if(!this.lineup.has('PG') || (this.lineup.has('PG') && this.lineup.get('PG').name === '')){ 
    let _pgs: Player[] = Array.from(this.dispPG.values()).filter((player) => player.active === 'Y' && player.price < salary_filter 
                                                                    && player.ratio > 4.0).sort((a,b) => (a.expFv < b.expFv) ? 1 : -1);


    let playerMap: Map<string, Player> = new Map<string, Player>();

    for(let i = 0; i < optimValue; i++){
      playerMap.set(_pgs[i].name, _pgs[i]);
    }

    this.PG = playerMap;
  } else {
    this.PG = new Map<string, Player>([[this.lineup.get('PG').name, this.lineup.get('PG')]])
  }

  if(!this.lineup.has('SG') || (this.lineup.has('SG') && this.lineup.get('SG').name === '')){
    let _sgs: Player[] = Array.from(this.dispSG.values()).filter((player) => player.active === 'Y' 
                                                                      && player.price < salary_filter 
                                                                      && player.ratio > 4.0)
                                                                      .sort((a,b) => (a.expFv < b.expFv) ? 1 : -1);

    let playerMap: Map<string, Player> = new Map<string, Player>();

    for(let i = 0; i < optimValue; i++){
      playerMap.set(_sgs[i].name, _sgs[i]);
    }

    this.SG = playerMap;
  } else {
    this.SG = new Map<string, Player>([[this.lineup.get('SG').name, this.lineup.get('SG')]])
  }

  if(!this.lineup.has('SF') || (this.lineup.has('SF') && this.lineup.get('SF').name === '')){
    let _sfs: Player[] = Array.from(this.dispSF.values()).filter((player) => player.active === 'Y' 
                                                                      && player.price < salary_filter 
                                                                      && player.ratio > 4.0)
                                                                      .sort((a,b) => (a.expFv < b.expFv) ? 1 : -1);

    let playerMap: Map<string, Player> = new Map<string, Player>();

    for(let i = 0; i < optimValue; i++){
      playerMap.set(_sfs[i].name, _sfs[i]);
    }

    this.SF = playerMap;
  } else {
    this.SF = new Map<string, Player>([[this.lineup.get('SF').name, this.lineup.get('SF')]])
  }

  if(!this.lineup.has('PF') || (this.lineup.has('PF') && this.lineup.get('PF').name === '')){
    let _pfs: Player[] = Array.from(this.dispPF.values()).filter((player) => player.active === 'Y' 
                                                                    && player.price < salary_filter 
                                                                    && player.ratio > 4.0)
                                                                    .sort((a,b) => (a.expFv < b.expFv) ? 1 : -1);
    let playerMap: Map<string, Player> = new Map<string, Player>();

    for(let i = 0; i < optimValue; i++){
      playerMap.set(_pfs[i].name, _pfs[i]);
    }

    this.PF = playerMap;
  } else {
    this.PF = new Map<string, Player>([[this.lineup.get('PF').name, this.lineup.get('PF')]])
  }

  if(!this.lineup.has('C') || (this.lineup.has('C') && this.lineup.get('C').name === '')){
    let _cs: Player[] = Array.from(this.dispC.values()).filter((player) => player.active === 'Y' 
                                                                  && player.price <= salary_filter 
                                                                  && player.ratio > 4.0)
                                                                  .sort((a,b) => (a.expFv < b.expFv) ? 1 : -1);

    let playerMap: Map<string, Player> = new Map<string, Player>();

    for(let i = 0; i < optimValue; i++){
      playerMap.set(_cs[i].name, _cs[i]);
    }

    this.C = playerMap;
  } else {
    this.C = new Map<string, Player>([[this.lineup.get('C').name, this.lineup.get('C')]])
  }

  if(!this.lineup.has('G') || (this.lineup.has('G') && this.lineup.get('G').name === '')){
    let _gs: Player[] = Array.from(this.dispG.values()).filter((player) => player.active === 'Y' 
                                                                    && player.price <= salary_filter 
                                                                    && player.ratio > 4.0)
                                                                    .sort((a,b) => (a.expFv < b.expFv) ? 1 : -1);

    let playerMap: Map<string, Player> = new Map<string, Player>();

    for(let i = 0; i < optimValue; i++){
      playerMap.set(_gs[i].name, _gs[i]);
    }

    this.G = playerMap;
  } else {
    this.G = new Map<string, Player>([[this.lineup.get('G').name, this.lineup.get('G')]])
  }

  if(!this.lineup.has('F') || (this.lineup.has('F') && this.lineup.get('F').name === '')){
    let _fs: Player[] = Array.from(this.dispF.values()).filter((player) => player.active === 'Y' 
                                                                    && player.price <= salary_filter
                                                                    && player.ratio > 4.0)
                                                                    .sort((a,b) => (a.expFv < b.expFv) ? 1 : -1);

    let playerMap: Map<string, Player> = new Map<string, Player>();

    for(let i = 0; i < optimValue; i++){
      playerMap.set(_fs[i].name, _fs[i]);
    }

    this.F = playerMap;
  } else {
    this.F = new Map<string, Player>([[this.lineup.get('F').name, this.lineup.get('F')]])
  }

  if(!this.lineup.has('UTIL') || (this.lineup.has('UTIL') && this.lineup.get('UTIL').name === '')){
    let _utils: Player[] = Array.from(this.dispUTIL.values()).filter((player) => player.active === 'Y' 
                                                                    && player.price < salary_filter 
                                                                    && player.ratio > 4.0)
                                                                    .sort((a,b) => (a.expFv < b.expFv) ? 1 : -1);

    let playerMap: Map<string, Player> = new Map<string, Player>();

    for(let i = 0; i < optimValue; i++){
      playerMap.set(_utils[i].name, _utils[i]);
    }

    this.UTIL = playerMap;
  } else {
    this.UTIL = new Map<string, Player>([[this.lineup.get('UTIL').name, this.lineup.get('UTIL')]])
  }

}


public refreshDataSource(): void {
  this.emitLoadingEventToChild(true);
  this.pgDataSource = Array.from(this.dispPG.values()).filter(player => player.active === 'Y');
  this.sgDataSource  = Array.from(this.dispSG.values()).filter(player => player.active  ===  'Y');
  this.sfDataSource  = Array.from(this.dispSF.values()).filter(player => player.active  ===  'Y');
  this.pfDataSource  = Array.from(this.dispPF.values()).filter(player => player.active  ===  'Y');
  this.cDataSource  = Array.from(this.dispC.values()).filter(player => player.active  ===  'Y');
  this.gDataSource  = Array.from(this.dispG.values()).filter(player => player.active  ===  'Y');
  this.fDataSource = Array.from(this.dispF.values()).filter(player => player.active  ===  'Y');
  this.utilDataSource  = Array.from(this.dispUTIL.values()).filter(player => player.active  ===  'Y');
  this.refreshLineup();
  this.emitLoadingEventToChild(false);
}

public refreshLineup(): void {
  this.selectionTableDataSource =  Array.from(this.lineup.values());
}


public lineupAdd(playerData: any): void{
  let player: Player = playerData.player;

  if(this.lineup.size < 9){
    // If position is filled, re-add player to display list
    if(this.lineup.has(player.position)){
      if(this.lineup.get(player.position).name !== ''){
        this.togglePlayerStatus(this.lineup.get(player.position), 'Y');
      }
    }

    // set new player at position & update table totals
    this.lineup.set(player.position, player);
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

  public togglePlayerStatus(player: Player, active: string): void {
    if(this.dispSG.has(player.name))  this.dispSG.get(player.name).active = active;
    if(this.dispPG.has(player.name))  this.dispPG.get(player.name).active = active;
    if(this.dispSF.has(player.name))  this.dispSF.get(player.name).active = active;
    if(this.dispPF.has(player.name))  this.dispPF.get(player.name).active = active;
    if(this.dispC.has(player.name))   this.dispC.get(player.name).active = active;
    if(this.dispG.has(player.name))   this.dispG.get(player.name).active = active;
    if(this.dispF.has(player.name))   this.dispF.get(player.name).active = active;
    this.dispUTIL.get(player.name).active = active;
  }

  private getLineupSum(): number {
    let sum: number = 0;

    for(const [key, player] of this.lineup.entries()){
      sum += player.expFv;
    }

    return sum;
  }

  private getExpFantValSum(players: Player[]): number{
    let total: number = 0;

    players.forEach(player => {
      total += player.expFv;
    })

    return total;
  }

  private getSalSum(players: Player[]): number{
    let total: number = 0;

    players.forEach(player => {
      total += player.price;
    })

    return total;
  }

  private lineupIsUnique(players: Player[]): boolean {
    for(let i: number = 0; i < players.length; i++){
      for(let j: number = 0; j < players.length; j++){
        if((players[i].name === players[j].name) && (j !== i)){
          return false;
        }
      }
    }

    return true;
  }

  private updateTotals(){
    this.totalCost = this.getSalSum(Array.from(this.lineup.values()));
    this.totalFntsyPts = Number(this.getLineupSum().toFixed(2));
  }
}
