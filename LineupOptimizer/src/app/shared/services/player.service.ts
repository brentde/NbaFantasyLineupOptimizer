import { Player } from './../models/Player';
import { Subject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';



@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  private playerSubject: Subject<Player> = new Subject<Player>();
  private loadingSubject: Subject<boolean> = new Subject<boolean>();

  constructor() { }

  public updateLoading(status: boolean): void {
    this.loadingSubject.next(status);
  }

  public addPlayer(player: Player): void {
    this.playerSubject.next(player);
  }

  getMessage(): Observable<Player> {
    return this.playerSubject.asObservable();
  }

  getLoadingMessage(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }
}
