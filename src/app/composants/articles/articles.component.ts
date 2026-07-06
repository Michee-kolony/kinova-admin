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
  filteredArticles: any[] = [];
  
  // Filtres
  searchTerm: string = '';
  selectedCategory: string = 'all';
  sortBy: string = 'date_desc';
  genreFilter: string = '';
  
  // Onglets
  categoryTabs: { label: string; value: string; icon: string }[] = [
    { label: 'Tous', value: 'all', icon: 'fas fa-th-list' }
  ];

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
      next: (data) => {
        this.categories = data;
        this.updateCategoryTabs();
      },
      error: () => this.showError('Impossible de charger les catégories')
    });
  }

  updateCategoryTabs(): void {
    // Ajouter les catégories existantes aux onglets
    this.categories.forEach(cat => {
      const catName = cat.nom || cat;
      if (!this.categoryTabs.find(tab => tab.value === catName)) {
        this.categoryTabs.push({
          label: catName,
          value: catName,
          icon: 'fas fa-tag'
        });
      }
    });
  }

  loadArticles(): void {
    this.isLoading = true;
    this.http.get<any[]>(this.articleUrl).subscribe({
      next: (data) => {
        this.articles = data
          .filter(article => article.vendeurId === this.articleData.vendeurId);
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.showError('Impossible de charger les articles');
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.articles];

    // Filtre par catégorie
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(article => 
        article.categorie === this.selectedCategory
      );
    }

    // Filtre par recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(article =>
        article.nom.toLowerCase().includes(term) ||
        article.description.toLowerCase().includes(term) ||
        article.categorie.toLowerCase().includes(term)
      );
    }

    // Filtre par genre
    if (this.genreFilter) {
      filtered = filtered.filter(article => 
        article.genre === this.genreFilter
      );
    }

    // Tri
    filtered = this.sortArticles(filtered);

    this.filteredArticles = filtered;
  }

  sortArticles(articles: any[]): any[] {
    switch (this.sortBy) {
      case 'date_desc':
        return articles.sort((a, b) => 
          new Date(b.createdAt || b.datePublication).getTime() - 
          new Date(a.createdAt || a.datePublication).getTime()
        );
      case 'date_asc':
        return articles.sort((a, b) => 
          new Date(a.createdAt || a.datePublication).getTime() - 
          new Date(b.createdAt || b.datePublication).getTime()
        );
      case 'prix_asc':
        return articles.sort((a, b) => 
          (a.prix - (a.prix * a.reduction / 100)) - 
          (b.prix - (b.prix * b.reduction / 100))
        );
      case 'prix_desc':
        return articles.sort((a, b) => 
          (b.prix - (b.prix * b.reduction / 100)) - 
          (a.prix - (a.prix * a.reduction / 100))
        );
      case 'vues_desc':
        return articles.sort((a, b) => (b.vues || 0) - (a.vues || 0));
      default:
        return articles;
    }
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  getCategoryCount(category: string): number {
    if (category === 'all') {
      return this.articles.length;
    }
    return this.articles.filter(article => article.categorie === category).length;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.genreFilter = '';
    this.sortBy = 'date_desc';
    this.applyFilters();
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
    
    formData.append('nom', this.articleData.nom);
    formData.append('prix', this.articleData.prix.toString());
    formData.append('reduction', this.articleData.reduction.toString());
    formData.append('categorie', this.articleData.categorie);
    formData.append('genre', this.articleData.genre);
    formData.append('description', this.articleData.description);
    formData.append('vendeurId', this.articleData.vendeurId);
    formData.append('vendeurNom', this.articleData.vendeurNom);
    formData.append('vendeurTelephone', this.articleData.vendeurTelephone);

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

  confirmDelete(article: any): void {
    this.articleToDelete = article;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.articleToDelete = null;
  }

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