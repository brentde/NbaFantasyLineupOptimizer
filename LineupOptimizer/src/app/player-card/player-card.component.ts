import { Component, OnInit, Inject } from '@angular/core';
import { PlayerData } from '../shared/models/PlayerData';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

export interface PlayerDialog {
  player: PlayerData;
}

@Component({
  selector: 'app-player-card',
  templateUrl: './player-card.component.html',
  styleUrls: ['./player-card.component.scss']
})

export class PlayerCardComponent implements OnInit {
  public playerDataSource: PlayerData [] = []; 
  displayedColumns: string[] = ["Team", "3P", "2P", "Rebounds", "Assists", "Steals", "Blocks", "Turnovers"]

  constructor( @Inject(MAT_DIALOG_DATA) public data: PlayerDialog,
              private dialogRef: MatDialogRef<PlayerCardComponent>,
              private sanitizer: DomSanitizer) {
              
  }

  ngOnInit() {
    this.playerDataSource.push(this.data.player);
    this.setPlayerPhoto();
  }

  public dialogClose(){
    this.dialogRef.close("Success");
  }

  private setPlayerPhoto(): void {
    // this.playerDataSource[0].photo = this.sanitizer.bypassSecurityTrustUrl(this.playerDataSource[0].photoUrl);
  }

}

