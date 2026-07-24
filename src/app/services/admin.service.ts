import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private urlgetadmin = "https://kinova-backend.tech/auth";
  private urlcreateadmin = "https://kinova-backend.tech/auth/register";

  constructor(private http: HttpClient) { }

  // Récupérer tous les administrateurs
  getAdmins(): Observable<any[]> {
    return this.http.get<any[]>(this.urlgetadmin);
  }

   // Enregistrer un administrateur
  createAdmin(admin: any): Observable<any> {
    return this.http.post<any>(this.urlcreateadmin, admin);
  }

    // Supprimer un administrateur
  deleteAdmin(id: string): Observable<any> {
    return this.http.delete<any>(`${this.urlgetadmin}/${id}`);
  }

}