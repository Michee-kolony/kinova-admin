import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  
  private articleUrl = "https://backend-kinova.onrender.com/article/";

  constructor(private http: HttpClient) { }

  getArticles(): Observable<any[]>{
   return  this.http.get<any[]>(this.articleUrl);
  }

}
