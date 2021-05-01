/* MODULES */
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxEchartsModule } from 'ngx-echarts';
import { MatDialogModule } from '@angular/material/dialog';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule} from '@angular/material/card';
import { MatGridListModule} from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule }from '@angular/material';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {MatTooltipModule} from '@angular/material/tooltip';

/* COMPONENTS */
import { AppComponent } from './app.component';
import { TopBarComponent } from './structure/top-bar/top-bar.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { PlayersComponent } from './structure/players/players.component';
import { PlayerCardComponent } from './player-table/player-dialog/player-card.component';
import { TeamCardComponent } from './team-card/team-card.component';
import { PlayerTableComponent } from './player-table/player-table.component';
import { MatchupCardComponent } from './matchup-card/matchup-card.component';
import { MatchupDialogComponent } from './matchup-card/matchup-dialog/matchup-dialog.component';

/* DIRECTIVES */
import { StatColorDirective } from './shared/directives/stat-color.directive'


@NgModule({
  declarations: [
    AppComponent,
    TopBarComponent,
    PlayersComponent,
    PlayerCardComponent,
    TeamCardComponent,
    StatColorDirective,
    PlayerTableComponent,
    MatchupCardComponent,
    MatchupDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatTabsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCardModule,
    MatGridListModule,
    MatButtonModule,
    MatDialogModule,
    MatSortModule,
    MatTooltipModule,
    MatProgressBarModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    })
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [ PlayerCardComponent, 
                     MatchupDialogComponent,
                     TeamCardComponent 
  ]
})
export class AppModule { }
