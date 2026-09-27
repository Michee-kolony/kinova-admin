import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-detailarticle',
  templateUrl: './detailarticle.component.html',
  styleUrl: './detailarticle.component.css',
})
export class DetailarticleComponent implements OnInit {

  private articleUrl = "https://kinova-backend.tech/article/";
  private categorieUrl = "https://kinova-backend.tech/categorie/";

  article: any = null;
  imagePrincipale = '';
  loading = true;

  // MODAL
  showModal = false;
  loadingUpdate = false;

  // CATÉGORIES (select)
  categories: any[] = [];
  loadingCategories = false;

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
    this.loadCategories();
  }

  loadCategories() {
    this.loadingCategories = true;

    this.http.get<any[]>(this.categorieUrl).subscribe({
      next: (data) => {
        this.categories = data.sort((a, b) => (a.nom || '').localeCompare(b.nom || ''));
        this.loadingCategories = false;
      },
      error: (err) => {
        console.error('Erreur chargement catégories:', err);
        this.loadingCategories = false;
      }
    });
  }

  categorieExiste(nom: string): boolean {
    return this.categories.some(cat => cat.nom === nom);
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

  get stockStatus(): { type: string; label: string } {
    const stock = Number(this.article?.stock);
    if (this.article?.stock === undefined || this.article?.stock === null || this.article?.stock === '') {
      return { type: 'unknown', label: 'Stock non spécifié' };
    }
    if (stock <= 0) return { type: 'out', label: 'Rupture de stock' };
    if (stock <= 5) return { type: 'low', label: 'Stock faible' };
    return { type: 'in', label: 'En stock' };
  }

  // Aperçu du prix final dans le formulaire
  get prixFinalApercu(): number {
    const prix = parseFloat(this.formData.prix) || 0;
    const reduction = Math.min(Math.max(parseFloat(this.formData.reduction) || 0, 0), 100);
    return prix * (1 - reduction / 100);
  }

  splitList(value: string): string[] {
    return (value || '').split(',').map(v => v.trim()).filter(v => v);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.showModal && !this.loadingUpdate) this.closeModal();
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