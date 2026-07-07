import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  // URL de l'API
  private apiUrl = 'https://backend-kinova.onrender.com/client';

  constructor(
    private http: HttpClient,
  ) { }


  getClients(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl);
  }


}
