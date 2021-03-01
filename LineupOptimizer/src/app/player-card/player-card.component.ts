import { Component, OnInit, Input } from '@angular/core';
import { PlayerData } from '../shared/models/PlayerData';

@Component({
  selector: 'app-player-card',
  templateUrl: './player-card.component.html',
  styleUrls: ['./player-card.component.scss']
})

export class PlayerCardComponent implements OnInit {

  @Input() player: PlayerData;

  constructor() {}

  ngOnInit() {}

}
