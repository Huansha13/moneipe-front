import {Component, inject} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {MatFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {MatTabChangeEvent, MatTabsModule} from '@angular/material/tabs';
import {MatTooltip} from '@angular/material/tooltip';

export interface PeriodicElement {
  id: number;
  name: string;
  description: string;
  money: number;
  currencyType: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {id: 1, name: 'Hydrogen', description: 'The lightest element', money: 100, currencyType: 'USD'},
  {id: 2, name: 'Helium', description: 'A noble gas', money: 200, currencyType: 'USD'},
  {id: 3, name: 'Lithium', description: 'A soft metal', money: 300, currencyType: 'USD'},
  {id: 4, name: 'Beryllium', description: 'A hard metal', money: 400, currencyType: 'USD'},
  {id: 5, name: 'Boron', description: 'A metalloid', money: 500, currencyType: 'USD'},
  {id: 6, name: 'Carbon', description: 'A nonmetal', money: 600, currencyType: 'USD'},
  {id: 7, name: 'Nitrogen', description: 'A diatomic gas', money: 700, currencyType: 'USD'},
  {id: 8, name: 'Oxygen', description: 'A diatomic gas', money: 800, currencyType: 'USD'},
  {id: 9, name: 'Fluorine', description: 'A halogen', money: 900, currencyType: 'USD'},
  {id: 10, name: 'Neon', description: 'A noble gas', money: 1000, currencyType: 'USD'},
];

interface InvestmentTab {
  id: number;
  name: string;
  total: number;
  fecha: string;
  dataSource: PeriodicElement[];
}

@Component({
  selector: 'app-investment',
  imports: [
    TranslatePipe,
    DecimalPipe,
    MatFabButton,
    MatIcon,
    MatTableModule,
    MatTabsModule,
    MatTooltip
  ],
  templateUrl: './investment.html',
  styleUrl: './investment.scss',
})
export class Investment {
  private readonly translate = inject(TranslateService);

  dataTab: InvestmentTab[] = [
    {
      id: 1,
      name: this.translate.instant('INVESTMENTS.TAB_AJI'),
      total: 1000,
      fecha: '2023-01-01',
      dataSource: []
    },
    {
      id: 2,
      name: this.translate.instant('INVESTMENTS.TAB_CANA'),
      total: 2000,
      fecha: '2023-01-01',
      dataSource: []
    },
    {
      id: 3,
      name: this.translate.instant('INVESTMENTS.TAB_MAIZ'),
      total: 3000,
      fecha: '2023-01-01',
      dataSource: []
    }
  ];

  displayedColumns: string[] = ['id', 'name', 'description', 'money'];

  protected openFormInvestment() {
    // logica para abrir el formulario de inversión
  }

  protected onTabFocusChange(index: MatTabChangeEvent) {
    let tab = this.dataTab[index.index];
    if (tab) {
      tab.dataSource = ELEMENT_DATA;
    }
  }
}
