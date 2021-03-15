import { Observable, Subscription } from 'rxjs';
import { PlayerCardComponent } from './../../../player-card/player-card.component';
import { PlayerData } from './../../models/PlayerData';
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-player-table',
  templateUrl: './player-table.component.html',
  styleUrls: ['./player-table.component.scss']
})
export class PlayerTableComponent implements OnInit {

  @Input() dataSource: PlayerData[];
  @Input() loadingEvent: Observable<any>;
  @Output() addPlayerEvent = new EventEmitter<any>();

  public Loading: boolean = true;
  
  public displayedColumns: string[] = ["Name", "Team", "Exp_Fant_Pts", "Salary", "Value", "Add_Btn"]

  private loadingEventSubscription: Subscription; 

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
    this.loadingEventSubscription = this.loadingEvent.subscribe(loading => {
      this.Loading = loading; 
    })
  }

  ngOnDestory(){
    this.loadingEventSubscription.unsubscribe();
  }

  // **********************
  // Open Player Dialog
  // ***********************

  public openPlayerDialog(nba_player: PlayerData) {
    this.dialog.open(PlayerCardComponent, {
      width: '970px',
      height: '180px',
      data: {player: nba_player}
    }).afterClosed().subscribe(() => {})
  }

  public addPlayer(player: PlayerData){   
    this.addPlayerEvent.emit({player})
  }

  
}
