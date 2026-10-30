import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { TranslatePipe } from '@ngx-translate/core';
import { DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';

import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { InvestmentService, Activo } from './service/investment.service';
import { GroupService } from '../group/service/group.service';
import { MembersDialog, MembersDialogData } from '../group/components/members-dialog/members-dialog';
import { CreatePortfolioDialog } from './components/create-portfolio-dialog/create-portfolio-dialog';
import { CreateAssetDialog } from './components/create-asset-dialog/create-asset-dialog';

@Component({
  selector: 'app-investment',
  imports: [
    TranslatePipe,
    DecimalPipe,
    MatCardModule,
    MatIcon,
    MatTableModule,
    MatTabsModule,
    MatDialogModule,
    MatMenuModule,
    MatButtonModule,
  ],
  templateUrl: './investment.html',
  styleUrl: './investment.scss',
})
export class Investment implements OnInit {
  private readonly investmentService = inject(InvestmentService);
  private readonly groupService = inject(GroupService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  protected async openMembers(groupId?: string | null) {
    if (!groupId) {
      console.warn('No hay grupo asociado a este portafolio');
      return;
    }
    try {
      const usuarios = await this.groupService.getGroupMembersUsers(groupId);
      const members = (usuarios ?? []).map((u: any) => ({
        id: u.id,
        name: `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim() || u.username,
        email: u.email ?? '',
        role: 'MIEMBRO',
      }));
      const currentUserId = this.authService.profile().userId;
      const isAdmin = members.some(m => m.id === currentUserId && m.role === 'ADMIN');
      const group = { id: groupId, title: 'Miembros del grupo', description: '', role: isAdmin ? 'ADMIN' : 'MIEMBRO', members };
      const dialogRef = this.dialog.open(MembersDialog, {
        width: '480px',
        maxWidth: '95vw',
        data: { group } as MembersDialogData,
      });
      dialogRef.afterClosed().subscribe(() => {
        this.groupService.reloadGroups();
        this.investmentService.reloadPortfolios();
      });
    } catch (err) {
      console.error('Error cargando miembros:', err);
    }
  }

  portfolios = this.investmentService.portfolios;
  displayedColumns: string[] = ['id', 'name', 'description', 'money'];

  ngOnInit(): void {
    this.investmentService.reloadPortfolios();
  }

  activosFor(portfolioId: string): Activo[] {
    return this.investmentService.activosFor(portfolioId);
  }

  protected openFormInvestment() {
    const dialogRef = this.dialog.open(CreatePortfolioDialog, {
      width: '480px',
      maxWidth: '95vw',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.investmentService.reloadPortfolios();
      }
    });
  }

  protected openFormAsset(portfolioId: string) {
    const dialogRef = this.dialog.open(CreateAssetDialog, {
      width: '480px',
      maxWidth: '95vw',
      disableClose: true,
      data: { portfolioId },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.investmentService.reloadPortfolios();
      }
    });
  }

  protected async deletePortfolio(id: string) {
    await this.investmentService.deletePortfolio(id);
    this.investmentService.reloadPortfolios();
  }
}
