import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommandesService {

  private urlCommande = "https://kinova-backend.tech/commandes/admin";

  constructor(
    private http: HttpClient
  ) {}

  // Récupérer toutes les commandes pour l'administration
  getToutesLesCommandes(): Observable<any> {

    return this.http.get<any>(
      this.urlCommande
    );

  }


  // Récupérer une commande par son ID
  getCommandeById(id: string): Observable<any> {

    return this.http.get<any>(
      `${this.urlCommande}/${id}`
    );

  }


  // Modifier une commande
  modifierCommande(id: string, data: any): Observable<any> {

    return this.http.put<any>(
      `${this.urlCommande}/${id}`,
      data
    );

  }

  // Affecter un livreur à une commande
  affecterLivreur(id: string, idLivreur: string): Observable<any> {

    return this.http.put<any>(
      `${this.urlCommande}/${id}/livreur`,
      { idLivreur }
    );

  }

  // Modifier le statut de livraison global d'une commande
  updateStatutLivraison(id: string, statutLivraison: string): Observable<any> {

    return this.http.put<any>(
      `${this.urlCommande}/${id}/statut-livraison`,
      { statutLivraison }
    );

  }

}