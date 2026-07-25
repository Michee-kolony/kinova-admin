import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VendeurService {

  private urlVendeur = "https://kinova-backend.tech/vendeur";

  constructor(private http: HttpClient) {}

  // Méthode pour récupérer tous les vendeurs
  getVendeurs(): Observable<any[]> {
    return this.http.get<any[]>(this.urlVendeur);
  }

  // Méthode pour récupérer un vendeur par son ID
  getVendeurById(id: string): Observable<any> {
    return this.http.get<any>(`${this.urlVendeur}/${id}`);
  }

  // Méthode pour créer un nouveau vendeur
  createVendeur(vendeurData: any): Observable<any> {
    return this.http.post<any>(this.urlVendeur, vendeurData);
  }

  // Méthode pour mettre à jour un vendeur
  updateVendeur(id: string, vendeurData: any): Observable<any> {
    return this.http.put<any>(`${this.urlVendeur}/${id}`, vendeurData);
  }

  // Méthode pour supprimer un vendeur
  deleteVendeur(id: string): Observable<any> {
    return this.http.delete<any>(`${this.urlVendeur}/${id}`);
  }

  // Méthode pour vérifier un vendeur - Version 1
  verifyVendeur(id: string): Observable<any> {
    // Essayer avec PATCH
    return this.http.patch<any>(`${this.urlVendeur}/${id}/verify`, {});
  }

  // Méthode pour vérifier un vendeur - Version 2 (si l'API utilise PUT)
  verifyVendeurPut(id: string): Observable<any> {
    return this.http.put<any>(`${this.urlVendeur}/${id}/verify`, { isVerified: true });
  }

  // Méthode pour vérifier un vendeur - Version 3 (si l'API utilise POST)
  verifyVendeurPost(id: string): Observable<any> {
    return this.http.post<any>(`${this.urlVendeur}/${id}/verify`, {});
  }

  // Méthode pour vérifier un vendeur - Version 4 (mise à jour directe)
  verifyVendeurUpdate(id: string): Observable<any> {
    return this.http.patch<any>(`${this.urlVendeur}/${id}`, { isVerified: true });
  }
}