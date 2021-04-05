import { PlayerService } from '../shared/services/player.service';
import { Observable, Subscription } from 'rxjs';
import { PlayerCardComponent } from './player-dialog/player-card.component';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Player } from '../shared/models/Player';



@Component({
  selector: 'app-player-table',
  templateUrl: './player-table.component.html',
  styleUrls: ['./player-table.component.scss']
})
export class PlayerTableComponent implements OnInit {

  @Input() dataSource: Player[];
  
  public Loading: boolean = true;
  
  public displayedColumns: string[] = ["Name", "Team", "Exp_Fant_Pts", "Salary", "Value", "Add_Btn"]

  private subscriptions: Subscription; 

  constructor(private dialog: MatDialog,
              private playerService: PlayerService) { }

              
  ngOnInit() {
    this.subscriptions = this.playerService.getLoadingMessage().subscribe(loading => {
      this.Loading = loading; 
    })
  }

  ngOnDestory(){
    this.subscriptions.unsubscribe();
  }

  public openPlayerDialog(nbaPlayer: Player) {
    this.dialog.open(PlayerCardComponent, {
      width: '900px',
      height: '350px',
      data: {player: nbaPlayer}
    }).afterClosed().subscribe(() => {})
  }

  public addPlayer(player: Player){   
    this.playerService.addPlayer(player);
  }
}
