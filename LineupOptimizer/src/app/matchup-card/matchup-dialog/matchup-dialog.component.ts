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

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private dialogRef: MatDialogRef<MatchupDialogComponent>) { 
                this.matchup = this.data.matchup;
              }

  ngOnInit() {
      
  }

  public dialogClose(){
    this.dialogRef.close("Success");
  }

}
