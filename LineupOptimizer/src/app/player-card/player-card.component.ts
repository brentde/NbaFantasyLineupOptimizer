import { PlayerHistoryRecord } from './../shared/models/PlayerHistoryRecord';
import { MongodbService } from './../shared/services/mongodb.service';
import { Player } from './../shared/models/Player';
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { EChartsOption, graphic } from 'echarts';


export interface PlayerDialog {
  player: Player;
}

@Component({
  selector: 'app-player-card',
  templateUrl: './player-card.component.html',
  styleUrls: ['./player-card.component.scss']
})

export class PlayerCardComponent implements OnInit {

  public player: Player; 
  public playerHistoryRecords: PlayerHistoryRecord[] = [];
  public chartOptions: EChartsOption;
  public ppg: number[] = [];
  public apg: number[] = [];
  public rpg: number[] = [];
  public bpg: number[] = [];
  public spg: number[] = [];
  public to: number[] = [];
  public dates: string[] = [];

  constructor( @Inject(MAT_DIALOG_DATA) public data: PlayerDialog,
              private dialogRef: MatDialogRef<PlayerCardComponent>,
              private sanitizer: DomSanitizer,
              private mongo: MongodbService) {
              this.player = this.data.player;
              this.player.photo = this.sanitizer.bypassSecurityTrustUrl(this.player.photoUrl);
              this.getPlayerRecords();
  }

  ngOnInit() {}

  public dialogClose(){
    this.dialogRef.close("Success");
  }

  private getPlayerRecords(): void {
    this.mongo.getPlayerRecords(this.data.player.bbrefId).subscribe(records => {
      this.playerHistoryRecords = records;
      this.setDataArrays();
    })
  }

  private setDataArrays(): void {
    this.playerHistoryRecords.forEach(record => {
      this.dates.push(record.date);
      this.ppg.push(record.pts);
      this.apg.push(record.ast);
      this.rpg.push(record.trb);
      this.bpg.push(record.blk);
      this.spg.push(record.stl);
      this.to.push(record.tov);
    })
  }

  public setChartOptions(title: string, data: number[]): EChartsOption {
    return this.chartOptions = {
      title: {
        left: 'center',
        text: `${this.player.name} ${title}`,
      },
      xAxis: {
        type: 'category',
        data: this.dates,
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

