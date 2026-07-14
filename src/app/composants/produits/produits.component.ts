// produits.component.ts
import { Component, OnInit } from '@angular/core';
import { ArticleService } from '../../services/article.service';

@Component({
  selector: 'app-produits',
  templateUrl: './produits.component.html',
  styleUrl: './produits.component.css'
})
export class ProduitsComponent implements OnInit {

  articles: any[] = [];
  filteredArticles: any[] = [];
  categories: any[] = [];
  selectedCategory: string = 'all';
  searchTerm: string = '';
  isLoading: boolean = true;
  sortOrder: string = 'recent';
  errorMessage: string = '';

  constructor(private articleService: ArticleService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    console.log('Chargement des articles...');
    
    // Charger les articles
    this.articleService.getArticles().subscribe({
      next: (articles) => {
        console.log('Articles reçus:', articles);
        console.log('Nombre d\'articles:', articles?.length || 0);
        
        if (articles && articles.length > 0) {
          // Trier par date la plus récente
          this.articles = articles.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          console.log('📋 Articles triés:', this.articles);
        } else {
          console.warn('⚠️ Aucun article reçu du backend');
          this.articles = [];
        }
        
        // Charger les catégories
        this.loadCategories();
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des articles:', error);
        this.errorMessage = 'Impossible de charger les articles. Veuillez réessayer.';
        this.isLoading = false;
        this.articles = [];
        this.filteredArticles = [];
      }
    });
  }

  loadCategories(): void {
    console.log('🔄 Chargement des catégories...');
    
    this.articleService.getCategories().subscribe({
      next: (categories) => {
        console.log('Catégories reçues:', categories);
        this.categories = categories || [];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des catégories:', error);
        // On continue même sans catégories
        this.categories = [];
        this.applyFilters();
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    console.log('🔍 Application des filtres...');
    console.log('📦 Articles disponibles:', this.articles.length);
    
    let filtered = [...this.articles];

    // Filtre par catégorie
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(article => 
        article.categorie === this.selectedCategory
      );
      console.log(`📂 Filtre catégorie "${this.selectedCategory}": ${filtered.length} articles`);
    }

    // Filtre par recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(article =>
        article.nom?.toLowerCase().includes(term) ||
        article.description?.toLowerCase().includes(term) ||
        article.categorie?.toLowerCase().includes(term) ||
        article.vendeurNom?.toLowerCase().includes(term)
      );
      console.log(`🔎 Recherche "${this.searchTerm}": ${filtered.length} articles`);
    }

    // Tri
    switch(this.sortOrder) {
      case 'price-asc':
        filtered.sort((a, b) => (a.prixFinal || 0) - (b.prixFinal || 0));
        break;
      case 'price-desc':
        filtered.sort((a, b) => (b.prixFinal || 0) - (a.prixFinal || 0));
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    this.filteredArticles = filtered;
    console.log('✅ Résultat final:', this.filteredArticles.length, 'articles');
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  getCategoryCount(category: string): number {
    if (category === 'all') {
      return this.articles.length;
    }
    return this.articles.filter(article => article.categorie === category).length;
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }

  onSortChange(order: string): void {
    this.sortOrder = order;
    this.applyFilters();
  }

  getImageUrl(images: string[]): string {
    return images && images.length > 0 ? images[0] : 'https://picsum.photos/seed/default/400/300';
  }

  getCategoryClass(categorie: string): string {
    const categoryMap: {[key: string]: string} = {
      'Electronique': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Vêtement': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Chaussure': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Montre': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Musique': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Perruque': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Sport': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'Livre': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Jouet': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      'Electrique': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
    };
    return categoryMap[categorie] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }

  getGenreIcon(genre: string): string {
    const iconMap: {[key: string]: string} = {
      'Homme': '👨',
      'Femme': '👩',
      'Enfants': '👶',
      'Mixte': '👥'
    };
    return iconMap[genre] || '👤';
  }

  getCategoryIcon(categorie: string): string {
    const iconMap: {[key: string]: string} = {
      'Electronique': '💻',
      'Vêtement': '👕',
      'Chaussure': '👟',
      'Montre': '⌚',
      'Musique': '🎵',
      'Perruque': '💇',
      'Sport': '⚽',
      'Livre': '📚',
      'Jouet': '🧸',
      'Electrique': '🔌'
    };
    return iconMap[categorie] || '📦';
  }

  getReductionColor(reduction: number): string {
    if (reduction >= 50) return 'bg-red-600';
    if (reduction >= 30) return 'bg-orange-500';
    if (reduction >= 15) return 'bg-yellow-500';
    return 'bg-blue-500';
  }

  isNewArticle(createdAt: string): boolean {
    const date = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }

  getFirstImage(images: string[]): string {
    return images && images.length > 0 ? images[0] : 'https://picsum.photos/seed/default/400/300';
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.sortOrder = 'recent';
    this.applyFilters();
  }

  // Méthode pour supprimer un produit (temporaire avec alert)
  deleteProduct(articleId: string, articleName: string): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le produit "${articleName}" ?`)) {
      alert(`Produit "${articleName}" supprimé avec succès ! (ID: ${articleId})`);
      // TODO: Appeler le service de suppression
      // this.articleService.deleteArticle(articleId).subscribe({...});
    }
  }

  // Méthode pour modifier un produit
  editProduct(articleId: string): void {
    alert(`Modification du produit (ID: ${articleId}) - Fonctionnalité à venir`);
    // TODO: Rediriger vers la page d'édition
  }

  
}