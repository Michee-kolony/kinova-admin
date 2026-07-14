import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  
  private articleUrl = "https://backend-kinova.onrender.com/article/";
  private apiUrl = "https://backend-kinova.onrender.com/categorie/";

  constructor(private http: HttpClient) { }

  getArticles(): Observable<any[]> {
    return this.http.get<any[]>(this.articleUrl);
  }

  // Récupérer un article par son _id
  getArticleById(id: string): Observable<any> {
    return this.http.get<any>(`${this.articleUrl}${id}`);
  }

  // ✅ CORRECTION : Supprimer le "/articles/" en trop
  deleteArticle(id: string): Observable<any> {
    return this.http.delete(`${this.articleUrl}${id}`);
    // OU selon l'API : return this.http.delete(`${this.articleUrl}delete/${id}`);
  }

  // Récupérer toutes les catégories
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }
}