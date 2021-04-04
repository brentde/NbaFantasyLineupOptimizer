import { PlayerService } from './../../shared/services/player.service';
import { Player } from './../../shared/models/Player';
import { MongodbService } from './../../shared/services/mongodb.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Matchup } from './../../shared/models/Matchup';
import { AfterViewInit, Component, OnInit, Inject, ViewChild } from '@angular/core';
import {  MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material';


@Component({
  selector: 'app-matchup-dialog',
  templateUrl: './matchup-dialog.component.html',
  styleUrls: ['./matchup-dialog.component.scss']
})
export class MatchupDialogComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort, {static: false}) sort: MatSort;

  public matchup: Matchup;
  public awayTeamDataSource: MatTableDataSource<Player>;
  public homeTeamDataSource: MatTableDataSource<Player>;
  public Loading: boolean = false;
  public displayedColumns: string[] = ["Name", "Position", "Salary", "Add_Btn"];


  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
                private dialogRef: MatDialogRef<MatchupDialogComponent>,
                private mongo: MongodbService,
                private playerService: PlayerService) { 
                this.matchup = this.data.matchup;
              }

  ngOnInit(){
    this.getPlayersByTeam();
  }

  ngAfterViewInit() {
    // this.getPlayersByTeam();
  }

  public dialogClose(){
    this.dialogRef.close("Success");
  }

  public getPlayersByTeam(): void {
    this.Loading = true;

    this.mongo.getPlayersByTeam(this.matchup.away).subscribe(players => {
        this.awayTeamDataSource = new MatTableDataSource(players);
        this.awayTeamDataSource.sort = this.sort;
     
        this.mongo.getPlayersByTeam(this.matchup.home).subscribe(players => {
          this.homeTeamDataSource = new MatTableDataSource(players);
          // this.homeTeamDataSource.sort = this.sort;

          this.Loading = false;
        })
    })
  }

  public addPlayer(player: Player){
    this.playerService.addPlayer(player);
    this.dialogRef.close("Success");
  }
}
