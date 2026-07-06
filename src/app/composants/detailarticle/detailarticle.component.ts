import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  // MODAL
  showModal = false;
  loadingUpdate = false;

  // FORM DATA
  formData: any = {
    nom: '',
    prix: '',
    reduction: '',
    categorie: '',
    genre: '',
    description: '',
    vendeurNom: '',
    vendeurTelephone: ''
  };

  newImages: File[] = [];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadArticle();
  }

  loadArticle() {
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

  openModal() {
    this.formData = {
      nom: this.article.nom,
      prix: this.article.prix,
      reduction: this.article.reduction,
      categorie: this.article.categorie,
      genre: this.article.genre,
      description: this.article.description,
      vendeurNom: this.article.vendeurNom,
      vendeurTelephone: this.article.vendeurTelephone
    };

    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.newImages = [];
  }

  onFileChange(event: any) {
    this.newImages = Array.from(event.target.files);
  }

  updateArticle() {
    this.loadingUpdate = true;

    const id = this.article._id;

    const formData = new FormData();

    Object.keys(this.formData).forEach(key => {
      formData.append(key, this.formData[key]);
    });

    this.newImages.forEach(file => {
      formData.append('images', file);
    });

    this.http.put(this.articleUrl + id, formData).subscribe({
      next: (res: any) => {
        this.loadingUpdate = false;
        this.showModal = false;
        this.loadArticle();
      },
      error: (err) => {
        console.log(err);
        this.loadingUpdate = false;
      }
    });
  }
}