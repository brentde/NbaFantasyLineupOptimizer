import { PlayerService } from './../../shared/services/player.service';
import { Player } from './../../shared/models/Player';
import { MongodbService } from './../../shared/services/mongodb.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Matchup } from './../../shared/models/Matchup';
import { Component, OnInit, Inject } from '@angular/core';




@Component({
  selector: 'app-matchup-dialog',
  templateUrl: './matchup-dialog.component.html',
  styleUrls: ['./matchup-dialog.component.scss']
})
export class MatchupDialogComponent implements OnInit {
  public matchup: Matchup;
  public awayTeamDataSource: Player[];
  public homeTeamDataSource: Player[];
  public Loading: boolean = false;
  public displayedColumns: string[] = ["Name", "Position", "Salary", "Add_Btn"];


  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
                private dialogRef: MatDialogRef<MatchupDialogComponent>,
                private mongo: MongodbService,
                private playerService: PlayerService) { 
                this.matchup = this.data.matchup;
              }

  ngOnInit() {
    this.getPlayersByTeam();
  }

  public dialogClose(){
    this.dialogRef.close("Success");
  }

  public getPlayersByTeam(): void {
    this.Loading = true;

    this.mongo.getPlayersByTeam(this.matchup.away).subscribe(players => {
        this.awayTeamDataSource = players;
        this.mongo.getPlayersByTeam(this.matchup.home).subscribe(players => {
          this.homeTeamDataSource = players;
          this.Loading = false;
        })
    })
  }

  public addPlayer(player: Player){
    // let newPlayer = new Player();
    // newPlayer = JSON.parse(JSON.stringify(player));

    this.playerService.addPlayer(player);
    this.dialogRef.close("Success");
  }
}
