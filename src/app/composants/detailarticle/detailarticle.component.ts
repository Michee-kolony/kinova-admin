import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-detailarticle',
  templateUrl: './detailarticle.component.html',
  styleUrl: './detailarticle.component.css',
})
export class DetailarticleComponent implements OnInit {

  private articleUrl = "https://backend-kinova.onrender.com/article/";

  article: any = null;

  imagePrincipale = '';

  loading = true;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.http.get<any>(this.articleUrl + id).subscribe({
        next: (data) => {
          this.article = data;
          this.imagePrincipale = this.article.images[0];
          this.loading = false;
        },
        error: (err) => {
          console.log(err);
          this.loading = false;
        }
      });
    }

  }

  changerImage(image: string) {
    this.imagePrincipale = image;
  }

}