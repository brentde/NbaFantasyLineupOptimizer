import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TeamConversionService {

  constructor() {}

  public convertTeamName(teamName: string): string{
    if(teamName === 'SA'){
      return 'SAS';
    } else if(teamName === 'GS'){
      return 'GSW';
    } else if(teamName === 'CHA'){
      return 'CHO'; 
    } else if(teamName === 'NO'){
      return 'NOP';
    } else if(teamName === 'NK'){
      return 'NYK';
    } else if(teamName === 'TOR'){
      return 'TOR';
    } else {
      return teamName;
    }
  }
}
