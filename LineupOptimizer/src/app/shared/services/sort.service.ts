import { Player } from './../models/Player';
import { MatTableDataSource, MatSort } from '@angular/material';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SortService {

  constructor() { }

  sortData(sort: MatSort, dataSource: MatTableDataSource<Player>) {
    const data = dataSource.data.slice();
   
    if (!sort.active || sort.direction === '') {
      dataSource.data = data;
      return;
    }

    dataSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'Name': return this.compare(a.name, b.name, isAsc);
        case 'Team': return this.compare(a.team, b.team, isAsc);
        case 'Exp_Fant_Pts': return this.compare(a.expFv, b.expFv, isAsc);
        case 'Salary': return this.compare(a.price, b.price, isAsc);
        case 'Value': return this.compare(a.ratio, b.ratio, isAsc);
        case 'Position': return this.compare(a.position, b.position, isAsc);
        default: return 0;
      }
    });
  }

  public compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

}
