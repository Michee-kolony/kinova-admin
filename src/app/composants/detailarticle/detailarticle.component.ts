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
    vendeurTelephone: '',
    stock: '',
    couleurs: '',
    tailles: ''
  };

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
          this.imagePrincipale = this.article.images?.[0] || '';
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement:', err);
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
      nom: this.article.nom || '',
      prix: this.article.prix || '',
      reduction: this.article.reduction || 0,
      categorie: this.article.categorie || '',
      genre: this.article.genre || 'Homme',
      description: this.article.description || '',
      vendeurNom: this.article.vendeurNom || '',
      vendeurTelephone: this.article.vendeurTelephone || '',
      stock: this.article.stock || '',
      couleurs: this.article.couleurs?.join(', ') || '',
      tailles: this.article.tailles?.join(', ') || ''
    };

    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  updateArticle() {
    this.loadingUpdate = true;

    const id = this.article._id;

    // Préparer les données
    const updateData: any = {
      nom: this.formData.nom,
      prix: parseFloat(this.formData.prix) || 0,
      reduction: parseFloat(this.formData.reduction) || 0,
      categorie: this.formData.categorie,
      genre: this.formData.genre,
      description: this.formData.description,
      vendeurNom: this.formData.vendeurNom,
      vendeurTelephone: this.formData.vendeurTelephone,
      stock: parseInt(this.formData.stock) || 0,
      couleurs: this.formData.couleurs.split(',').map((c: string) => c.trim()).filter((c: string) => c),
      tailles: this.formData.tailles.split(',').map((t: string) => t.trim()).filter((t: string) => t)
    };

    // Garder les images existantes
    updateData.images = this.article.images;

    this.http.put(this.articleUrl + id, updateData).subscribe({
      next: (res: any) => {
        this.loadingUpdate = false;
        this.showModal = false;
        this.loadArticle();
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour:', err);
        this.loadingUpdate = false;
        alert('Erreur lors de la modification. Veuillez réessayer.');
      }
    });
  }
}