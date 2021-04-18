import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MongodbService } from './../shared/services/mongodb.service';
import { Team } from './../shared/models/Team';
import { Component, OnInit, Inject } from '@angular/core';
import { EChartsOption, graphic } from 'echarts';


export interface TeamDialogData {
  team: string;
}


@Component({
  selector: 'app-team-card',
  templateUrl: './team-card.component.html',
  styleUrls: ['./team-card.component.scss']
})
export class TeamCardComponent implements OnInit {
  private teams: Team[] = [];
  public team: Team;
  public photoPath: string;
  public Loading: boolean = true;

  public chartOptions: EChartsOption;
  public ppg: number[] = [];
  public apg: number[] = [];
  public rpg: number[] = [];
  public bpg: number[] = [];
  public spg: number[] = [];
  public to: number[] = [];
  public teamNames: string[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: TeamDialogData,
              private dialogRef: MatDialogRef<TeamCardComponent>,
              private mongo: MongodbService) {
                this.getTeams(data.team);
               }

  ngOnInit() {}

  private getTeams(teamName: string): void {
    this.mongo.getTeams().subscribe(teams => {
      this.teams = teams;
      
      teams.forEach(team => {
        if(team.name === teamName){
            this.team = team;
            this.photoPath = `../../assets/shared/team_logos/${this.team.name.toLowerCase()}.png`;
        } else {
          this.teamNames.push(team.name);
          this.ppg.push(team.points);
          this.apg.push(team.assists);
          this.rpg.push(team.totRbds);
          this.spg.push(team.steals);
          this.bpg.push(team.blocks);
          this.to.push(team.turnovers);
        }
      })

      this.Loading = false;
    })
  }

  public closeDialog(): void {
    this.dialogRef.close("Success");
  }

    public setChartOptions(title: string, data: number[]|string[]): EChartsOption {
      return this.chartOptions = {
        title: {
          left: 'center',
          text: `${this.team.name} ${title}`,
        },
        xAxis: {
          type: 'category',
          data: this.teamNames,
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            data: data,
            type: 'line',
            itemStyle: {
              color: 'rgb(255, 70, 131)'
            },
            areaStyle: {
                color: new graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgb(255, 158, 68)'
                }, {
                    offset: 1,
                    color: 'rgb(255, 70, 131)'
                }])
            },
          },
          
        ],
      };
    }
}
