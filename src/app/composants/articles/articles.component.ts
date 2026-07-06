import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.css'
})
export class ArticlesComponent implements OnInit {
  private articleUrl = "https://backend-kinova.onrender.com/article/";
  private categorieUrl = "https://backend-kinova.onrender.com/categorie/";

  categories: any[] = [];
  articles: any[] = [];
  isModalOpen = false;
  isDeleteModalOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedFiles: File[] = [];
  articleToDelete: any = null;

  articleData = {
    nom: '',
    prix: 0,
    reduction: 0,
    categorie: '',
    genre: '',
    description: '',
    images: [] as string[],
    vendeurId: '',
    vendeurNom: '',
    vendeurTelephone: ''
  };

  constructor(public themeService: ThemeService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUser();
    this.getCategories();
    this.loadArticles();
  }

  loadUser() {
    const data = localStorage.getItem('user_data');
    if (data) {
      const user = JSON.parse(data);
      this.articleData.vendeurId = user.adminId || user.id || '';
      this.articleData.vendeurNom = user.name || user.nom || '';
      this.articleData.vendeurTelephone = user.telephone || '';
    }
  }

  getCategories(): void {
    this.http.get<any[]>(this.categorieUrl).subscribe({
      next: (data) => this.categories = data,
      error: () => this.showError('Impossible de charger les catégories')
    });
  }

 loadArticles(): void {
  this.isLoading = true;

  this.http.get<any[]>(this.articleUrl).subscribe({
    next: (data) => {

      this.articles = data.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      this.isLoading = false;
    },
    error: () => {
      this.showError('Impossible de charger les articles');
      this.isLoading = false;
    }
  });
}
  openModal(): void {
    this.resetForm();
    this.selectedFiles = [];
    this.isModalOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
    this.selectedFiles = [];
  }

  resetForm(): void {
    this.articleData = {
      nom: '',
      prix: 0,
      reduction: 0,
      categorie: '',
      genre: '',
      description: '',
      images: [],
      vendeurId: this.articleData.vendeurId,
      vendeurNom: this.articleData.vendeurNom,
      vendeurTelephone: this.articleData.vendeurTelephone
    };
  }

  saveArticle(): void {
    if (!this.articleData.nom || !this.articleData.prix || !this.articleData.categorie || !this.articleData.description) {
      this.showError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.isLoading = true;
    const formData = new FormData();
    
    // Ajout des champs texte
    formData.append('nom', this.articleData.nom);
    formData.append('prix', this.articleData.prix.toString());
    formData.append('reduction', this.articleData.reduction.toString());
    formData.append('categorie', this.articleData.categorie);
    formData.append('genre', this.articleData.genre);
    formData.append('description', this.articleData.description);
    formData.append('vendeurId', this.articleData.vendeurId);
    formData.append('vendeurNom', this.articleData.vendeurNom);
    formData.append('vendeurTelephone', this.articleData.vendeurTelephone);

    // Ajout des images
    this.selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    this.http.post<any>(this.articleUrl, formData).subscribe({
      next: () => {
        this.showSuccess('Article publié avec succès !');
        this.loadArticles();
        this.closeModal();
        this.isLoading = false;
      },
      error: () => {
        this.showError('Erreur lors de la publication');
        this.isLoading = false;
      }
    });
  }

  // Ouvre la modale de confirmation de suppression
  confirmDelete(article: any): void {
    this.articleToDelete = article;
    this.isDeleteModalOpen = true;
  }

  // Ferme la modale de confirmation
  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.articleToDelete = null;
  }

  // Supprime l'article avec l'ID passé en paramètre
  deleteArticle(id: string): void {
    this.isLoading = true;
    this.http.delete(`${this.articleUrl}${id}`).subscribe({
      next: () => {
        this.showSuccess('Article supprimé avec succès');
        this.loadArticles();
        this.isLoading = false;
        this.closeDeleteModal();
      },
      error: () => {
        this.showError('Erreur lors de la suppression');
        this.isLoading = false;
        this.closeDeleteModal();
      }
    });
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    this.selectedFiles = Array.from(files as File[]).slice(0, 3);
    this.articleData.images = [];

    this.selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (this.articleData.images.length < 3) {
          this.articleData.images.push(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number): void {
    this.articleData.images.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }

  showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => this.errorMessage = '', 5000);
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 5000);
  }

  formatDate(date: Date | string): string {
    return date ? new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Date inconnue';
  }

  formatVues(vues: number): string {
    return vues >= 1000 ? (vues / 1000).toFixed(1) + 'k' : (vues || 0).toString();
  }

  getFirstImage(images: string[]): string {
    return images?.length ? images[0] : 'https://picsum.photos/seed/default/400/300';
  }

  
}