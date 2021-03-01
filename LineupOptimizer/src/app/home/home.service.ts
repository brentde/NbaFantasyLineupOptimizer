import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private http: HttpClient) { }

  public getPlayerData(): Observable<any> {
    return this.http.get('api/player-data');
  };

  public getTeamData(): Observable<any> {
    return this.http.get('api/team-opp-data');
  };

  public getInjuredPlayersData(): Observable<any> {
    return this.http.get('api/injury-status');
  };

  public getDkData(): Observable<string>{
    return this.http.get('assets/shared/csv_files/dk_data.csv', {responseType: 'text'});
  };


  // Need to get data for nba team defense by position
}
