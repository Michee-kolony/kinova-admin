import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.css'
})
export class ArticlesComponent implements OnInit {
  private articleUrl = "https://kinova-backend.tech/article/";
  private categorieUrl = "https://kinova-backend.tech/categorie/";

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

  // Couleurs disponibles
  availableColors: string[] = [
    '#FF0000', '#FF6B6B', '#FFA500', '#FFD700', '#FFFF00', 
    '#90EE90', '#008000', '#00CED1', '#0000FF', '#4B0082',
    '#800080', '#FF1493', '#FF69B4', '#C0C0C0', '#808080',
    '#000000', '#FFFFFF', '#8B4513', '#D2691E', '#F5F5DC'
  ];
  
  // Presets de tailles
  sizePresets: { [key: string]: string[] } = {
    'vetement': ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    'chaussure_femme': ['35', '36', '37', '38', '39', '40', '41', '42'],
    'chaussure_homme': ['39', '40', '41', '42', '43', '44', '45', '46'],
    'chaussure_enfant': ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35'],
    'accessoire': ['Taille unique']
  };

  // Tailles actuellement affichées
  currentSizes: string[] = [];

  articleData = {
    nom: '',
    prix: 0,
    reduction: 0,
    categorie: '',
    genre: '',
    description: '',
    images: [] as string[],
    stock: 0,
    couleurs: [] as string[],
    tailles: [] as string[],
    vendeurId: '',
    vendeurNom: '',
    vendeurTelephone: ''
  };

  constructor(public themeService: ThemeService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUser();
    this.getCategories();
    this.loadArticles();
    this.currentSizes = this.sizePresets['vetement'];
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

    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(article => 
        article.categorie === this.selectedCategory
      );
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(article =>
        article.nom.toLowerCase().includes(term) ||
        article.description.toLowerCase().includes(term) ||
        article.categorie.toLowerCase().includes(term)
      );
    }

    if (this.genreFilter) {
      filtered = filtered.filter(article => 
        article.genre === this.genreFilter
      );
    }

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
      stock: 0,
      couleurs: [],
      tailles: [],
      vendeurId: this.articleData.vendeurId,
      vendeurNom: this.articleData.vendeurNom,
      vendeurTelephone: this.articleData.vendeurTelephone
    };
  }

  // Gestion des couleurs
  toggleColor(color: string): void {
    const index = this.articleData.couleurs.indexOf(color);
    if (index > -1) {
      this.articleData.couleurs.splice(index, 1);
    } else {
      this.articleData.couleurs.push(color);
    }
  }

  isColorSelected(color: string): boolean {
    return this.articleData.couleurs.includes(color);
  }

  addColor(color: string): void {
    const trimmedColor = color.trim();
    if (trimmedColor && !this.articleData.couleurs.includes(trimmedColor)) {
      this.articleData.couleurs.push(trimmedColor);
    }
  }

  removeColor(color: string): void {
    const index = this.articleData.couleurs.indexOf(color);
    if (index > -1) {
      this.articleData.couleurs.splice(index, 1);
    }
  }

  // Gestion des tailles
  applySizePreset(preset: string): void {
    if (this.sizePresets[preset]) {
      this.articleData.tailles = [...this.sizePresets[preset]];
      this.currentSizes = this.sizePresets[preset];
    }
  }

  toggleSize(size: string): void {
    const index = this.articleData.tailles.indexOf(size);
    if (index > -1) {
      this.articleData.tailles.splice(index, 1);
    } else {
      this.articleData.tailles.push(size);
    }
  }

  isSizeSelected(size: string): boolean {
    return this.articleData.tailles.includes(size);
  }

  addSize(size: string): void {
    const trimmedSize = size.trim();
    if (trimmedSize && !this.articleData.tailles.includes(trimmedSize)) {
      this.articleData.tailles.push(trimmedSize);
    }
  }

  removeSize(size: string): void {
    const index = this.articleData.tailles.indexOf(size);
    if (index > -1) {
      this.articleData.tailles.splice(index, 1);
    }
  }

  saveArticle(): void {
    // Validation des champs obligatoires
    if (!this.articleData.nom || !this.articleData.prix || !this.articleData.categorie || !this.articleData.description) {
      this.showError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Créer FormData pour l'envoi
    const formData = new FormData();
    
    // Champs texte
    formData.append('nom', this.articleData.nom);
    formData.append('prix', this.articleData.prix.toString());
    formData.append('reduction', this.articleData.reduction.toString());
    formData.append('categorie', this.articleData.categorie);
    formData.append('genre', this.articleData.genre);
    formData.append('description', this.articleData.description);
    formData.append('stock', this.articleData.stock.toString());
    formData.append('vendeurId', this.articleData.vendeurId);
    formData.append('vendeurNom', this.articleData.vendeurNom);
    formData.append('vendeurTelephone', this.articleData.vendeurTelephone);
    
    // Les tableaux en JSON
    formData.append('couleurs', JSON.stringify(this.articleData.couleurs));
    formData.append('tailles', JSON.stringify(this.articleData.tailles));

    // Ajouter les fichiers images
    this.selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    // Debug simplifié
    console.log('📤 Envoi des données:');
    console.log('  - Nom:', this.articleData.nom);
    console.log('  - Prix:', this.articleData.prix);
    console.log('  - Catégorie:', this.articleData.categorie);
    console.log('  - Genre:', this.articleData.genre);
    console.log('  - Stock:', this.articleData.stock);
    console.log('  - Couleurs:', this.articleData.couleurs);
    console.log('  - Tailles:', this.articleData.tailles);
    console.log('  - Images:', this.selectedFiles.length, 'fichier(s)');
    this.selectedFiles.forEach((file, index) => {
      console.log(`    - Image ${index + 1}: ${file.name} (${file.size} bytes)`);
    });

    // Envoyer en multipart/form-data
    this.http.post<any>(this.articleUrl, formData).subscribe({
      next: (response) => {
        console.log('✅ Réponse du serveur:', response);
        this.showSuccess('Article publié avec succès !');
        this.loadArticles();
        this.closeModal();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Erreur complète:', error);
        if (error.error) {
          console.error('Détails de l\'erreur backend:', error.error);
          if (typeof error.error === 'string') {
            this.showError('Erreur: ' + error.error);
          } else if (error.error.message) {
            this.showError('Erreur: ' + error.error.message);
          } else {
            this.showError('Erreur serveur (500). Vérifiez la configuration.');
          }
        } else {
          this.showError('Erreur lors de la publication');
        }
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
      error: (error) => {
        console.error('Erreur de suppression:', error);
        this.showError('Erreur lors de la suppression');
        this.isLoading = false;
        this.closeDeleteModal();
      }
    });
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Limiter à 3 fichiers
    this.selectedFiles = Array.from(files as File[]).slice(0, 3);
    this.articleData.images = [];

    // Afficher les aperçus
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