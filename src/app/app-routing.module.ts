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
import { KinovaComponent } from './client/kinova/kinova.component';
import { HomeComponent } from './client/home/home.component';
import { SupportComponent } from './client/support/support/support.component';
import { DetailsVendeurComponent } from './composants/details-vendeur/details-vendeur.component';
import { DecouvrirComponent } from './client/decouvrir/decouvrir.component';
import { VoircommandesComponent } from './composants/voircommandes/voircommandes.component';
import { TransactionComponent } from './composants/transaction/transaction.component';
import { HistoriqueTransactionComponent } from './composants/historique-transaction/historique-transaction.component';
import { LivreurComponent } from './composants/livreur/livreur.component';
import { AffecterLivraisonComponent } from './composants/affecter-livraison/affecter-livraison.component';

const routes: Routes = [
  {path:'', redirectTo: 'kinova', pathMatch: 'full'},
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
      {path:'client-details/:id', component: ClientDetailsComponent},
      {path:'vendeur-details/:id', component: DetailsVendeurComponent},
      {path:'voircommandes/:id', component: VoircommandesComponent},
      {path:'transaction', component: TransactionComponent},
      {path:'historique-transaction', component: HistoriqueTransactionComponent},
      {path:'livreurs', component: LivreurComponent},
      {path:'affecter-livraison', component: AffecterLivraisonComponent}

      ]
  },
  {path:'kinova', component: KinovaComponent,
    children:[
      {path:'', redirectTo:'home', pathMatch:'full'},
      {path:'home', component: HomeComponent},
      {path:'support', component: SupportComponent},
      {path:'decouvrir', component: DecouvrirComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
