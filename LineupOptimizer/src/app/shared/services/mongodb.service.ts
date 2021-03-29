import { Matchup } from './../models/Matchup';
import { Team } from './../models/Team';
import { Player } from './../models/Player';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MongodbService {

  constructor(private http: HttpClient) { }

  public getPlayers(): Observable<Player[]> {
    return this.http.get<Player[]>('api/get-players');
  };

  public getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>('api/get-teams');
  };

  public getMatchups(): Observable<Matchup[]> {
    return this.http.get<Matchup[]>('/api/get-matchups');
  }

  public getPlayersByTeam(team: string): Observable<Player[]> {
    return this.http.get<Player[]>(`/api/get-players-by-team/${team}`);
  }
}
