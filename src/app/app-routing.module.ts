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
import { ReclamationsComponent } from './composants/reclamations/reclamations.component';
import { DetailarticleComponent } from './composants/detailarticle/detailarticle.component';
import { ProduitsComponent } from './composants/produits/produits.component';
import { ProduitDetailsComponent } from './composants/produit-details/produit-details.component';
import { ClientDetailsComponent } from './composants/client-details/client-details.component';

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
      {path:'categorie', component: CategorieComponent},
      {path:'reclamations', component: ReclamationsComponent},
      {path:'details/:id', component: DetailarticleComponent},
      {path:'produits', component: ProduitsComponent},
      {path:'produit-details/:id', component: ProduitDetailsComponent},
      {path:'client-details/:id', component: ClientDetailsComponent}

      ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
