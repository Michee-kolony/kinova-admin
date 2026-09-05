import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LivraisonService {

  private urlLivraison = "https://kinova-backend.tech/livraison";

  // Clé TomTom : utilisée uniquement pour résoudre l'adresse lisible
  // d'un livreur en cours de livraison (géocodage inversé)
  private tomtomApiKey = "JuhuALSLTDH1gJxn9gA3oFd0VZEUALr9";

  constructor(private http: HttpClient) {}

  // Récupérer toutes les livraisons en cours avec la position live des livreurs
  getLivraisonsEnCours(): Observable<any> {
    return this.http.get<any>(`${this.urlLivraison}/admin/en-cours`);
  }

  // Résoudre une position (lat/lng) en adresse lisible via TomTom
  reverseGeocode(latitude: number, longitude: number): Observable<any> {
    return this.http.get<any>(
      `https://api.tomtom.com/search/2/reverseGeocode/${latitude},${longitude}.json`,
      { params: { key: this.tomtomApiKey } }
    );
  }
}
