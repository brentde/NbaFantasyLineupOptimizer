import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TeamConversionService {

  constructor() {}

  public convertTeamName(name: string): string{
    if(name === 'Houston Rockets'){
      return 'HOU';
    } else if(name === 'Oklahoma City Thunder'){
      return 'OKC';
    } else if(name === 'Miami Heat'){
      return 'MIA';
    } else if(name === 'Toronto Raptors'){
      return 'TOR';
    } else if(name === 'New York Knicks'){
      return 'NYK';
    } else if(name === 'Dallas Mavericks'){
      return 'DAL';
    } else if(name === 'New Orleans Pelicans'){
      return 'NOP';
    } else if(name === 'Indiana Pacers'){
      return 'IND';
    } else if(name === 'Memphis Grizzlies'){
      return 'MEM';
    } else if(name === 'Utah Jazz'){
      return 'UTA';
    } else if(name === 'Atlanta Hawks'){
      return 'ATL';
    } else if(name === 'Cleveland Cavaliers'){
      return 'CLE';
    } else if(name === 'San Antonio Spurs'){
      return 'SAS';
    } else if(name === 'Denver Nuggets'){
      return 'DEN';
    } else if(name === 'Portland Trail Blazers'){
      return 'POR';
    } else if(name === 'Phoenix Suns'){
      return 'PHO';
    } else if(name === 'Detroit Pistons'){
      return 'DET';
    } else if(name === 'Golden State Warriors'){
      return 'GSW';
    } else if(name === 'Los Angeles Lakers'){
      return 'LAL';
    } else if(name === 'Philadelphia 76ers'){
      return 'PHI';
    } else if(name === 'Los Angeles Clippers'){
      return 'LAC';
    } else if(name === 'Orlando Magic'){
      return 'ORL';
    } else if(name === 'Charlotte Hornets'){
      return 'CHA';
    } else if(name === 'Minnesota Timberwolves'){
      return 'MIN';
    } else if(name === 'Boston Celtics'){
      return 'BOS';
    } else if(name === 'Milwaukee Bucks'){
      return 'MIL';
    } else if(name === 'Brooklyn Nets'){
      return 'BRK';
    } else if(name === 'Chicago Bulls'){
      return 'CHI';
    } else if(name === 'Sacramento Kings'){
      return 'SAC';
    } else if(name === 'Washington Wizards'){
      return 'WAS';
    } else {
      return 'NO MATCH';
    }
  }
}
