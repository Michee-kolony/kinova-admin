import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminComponent } from './composants/admin/admin.component';
import { DashboardComponent } from './composants/dashboard/dashboard.component';
import { LoginComponent } from './composants/login/login.component';
import { CommandesComponent } from './composants/commandes/commandes.component';
import { ArticlesComponent } from './composants/articles/articles.component';
import {FormsModule} from "@angular/forms";
import { ClientsComponent } from './composants/clients/clients.component';
import { VendeursComponent } from './composants/vendeurs/vendeurs.component';
import { SettingsComponent } from './composants/settings/settings.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CategorieComponent } from './composants/categorie/categorie.component';
import { ReclamationsComponent } from './composants/reclamations/reclamations.component';
import { DetailarticleComponent } from './composants/detailarticle/detailarticle.component';
import { ProduitsComponent } from './composants/produits/produits.component';
import { ProduitDetailsComponent } from './composants/produit-details/produit-details.component';
import { ClientDetailsComponent } from './composants/client-details/client-details.component';
import { KinovaComponent } from './client/kinova/kinova.component';
import { HomeComponent } from './client/home/home.component';
import { NavbarComponent } from './client/navbar/navbar.component';
import { FooterComponent } from './client/footer/footer.component';

@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    DashboardComponent,
    LoginComponent,
    CommandesComponent,
    ArticlesComponent,
    ClientsComponent,
    VendeursComponent,
    SettingsComponent,
    CategorieComponent,
    ReclamationsComponent,
    DetailarticleComponent,
    ProduitsComponent,
    ProduitDetailsComponent,
    ClientDetailsComponent,
    KinovaComponent,
    HomeComponent,
    NavbarComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
