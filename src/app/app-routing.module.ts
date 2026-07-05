import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './composants/admin/admin.component';
import { DashboardComponent } from './composants/dashboard/dashboard.component';
import { CommandesComponent } from './composants/commandes/commandes.component';
import { ArticlesComponent } from './composants/articles/articles.component';
import { ClientsComponent } from './composants/clients/clients.component';
import { VendeursComponent } from './composants/vendeurs/vendeurs.component';
import { LoginComponent } from './composants/login/login.component';
import { SettingsComponent } from './composants/settings/settings.component';
import { authGuard } from './guards/auth.guard';
import { CategorieComponent } from './composants/categorie/categorie.component';

const routes: Routes = [
  {path:'', redirectTo: 'login', pathMatch: 'full'},
  {path:'login', component: LoginComponent},
  {path:'admin', component: AdminComponent, canActivateChild: [authGuard],
    children:[
      {path:'', redirectTo: 'dashboard', pathMatch: 'full'},
      {path:'dashboard', component: DashboardComponent},
      {path:'commandes', component: CommandesComponent},
      {path:'mesarticles', component : ArticlesComponent},
      {path:'clientlist', component: ClientsComponent},
      {path:'vendeurlist', component: VendeursComponent},
      {path:'settings', component: SettingsComponent},
      {path:'categorie', component: CategorieComponent}  
      ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
