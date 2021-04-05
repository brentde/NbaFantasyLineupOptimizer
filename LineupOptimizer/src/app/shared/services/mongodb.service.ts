import { PlayerHistoryRecord } from './../models/PlayerHistoryRecord';
import { Matchup } from './../models/Matchup';
import { Team } from './../models/Team';
import { Player } from './../models/Player';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class MongodbService {
  private readonly apiEndpoint = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  public getPlayers(): Observable<Player[]> {
    return this.http.get<Player[]>(`${this.apiEndpoint}/get-players`);
  };

  public getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.apiEndpoint}/get-teams`);
  };

  public getMatchups(): Observable<Matchup[]> {
    return this.http.get<Matchup[]>(`${this.apiEndpoint}/get-matchups`);
  }

  public getPlayersByTeam(team: string): Observable<Player[]> {
    return this.http.get<Player[]>(`${this.apiEndpoint}/get-players-by-team/${team}`);
  }

  public getPlayerRecords(id: string): Observable<PlayerHistoryRecord[]> {
    return this.http.get<PlayerHistoryRecord[]>(`${this.apiEndpoint}/get-player-history`, {
      params: {"id": id}
    });
  }
}
