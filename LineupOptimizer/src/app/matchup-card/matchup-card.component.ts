import { MatchupDialogComponent } from './matchup-dialog/matchup-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Matchup } from './../shared/models/Matchup';
import { Component, OnInit, Input} from '@angular/core';



@Component({
  selector: 'app-matchup-card',
  templateUrl: './matchup-card.component.html',
  styleUrls: ['./matchup-card.component.scss']
})
export class MatchupCardComponent implements OnInit {
  @Input() matchup: Matchup; 

  constructor(private dialog: MatDialog) { }

  ngOnInit() {};

  public openDialog(): void {
      this.dialog.open(MatchupDialogComponent, {
        width: '700px',
        height: '650px',
        data: {matchup: this.matchup}
      }).afterClosed().subscribe(() => {})
  }

}
