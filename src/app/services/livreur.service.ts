import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LivreurService {

  private urlLivreur = "https://kinova-backend.tech/livreur";

  constructor(private http: HttpClient) {}

  // Récupérer tous les livreurs
  getLivreurs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.urlLivreur}/`);
  }

  // Inscrire un nouveau livreur (multipart/form-data avec photo)
  registerLivreur(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.urlLivreur}/register`, formData);
  }

  // Supprimer un livreur
  deleteLivreur(id: string): Observable<any> {
    return this.http.delete<any>(`${this.urlLivreur}/${id}`);
  }
}
