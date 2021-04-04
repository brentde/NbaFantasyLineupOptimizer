import { Matchup } from '../../shared/models/Matchup';
import { MongodbService } from '../../shared/services/mongodb.service';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent implements OnInit {

  public matchUps: Matchup[] = [];

  constructor(private mongo: MongodbService) {

    // write function which checks on load if scroll event has been triggered
    // If trigged show left/right arrows

    // arrows have an on click event which scrolls for you
   }

  ngOnInit() {
    this.getMatchups();
  }

  private getMatchups(): void {
     this.mongo.getMatchups().subscribe(matchups => {
       this.matchUps = matchups;
     })
  }
}
