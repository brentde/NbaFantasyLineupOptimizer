import { Player } from './../models/Player';
import { Subject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';



@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  private playerSubject: Subject<Player> = new Subject<Player>();

  constructor() { }

  public addPlayer(player: Player): void {
    this.playerSubject.next(player);
  }

  getMessage(): Observable<Player> {
    return this.playerSubject.asObservable();
  }
}
