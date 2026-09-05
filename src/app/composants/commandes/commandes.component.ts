import { Component, OnInit, OnDestroy } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { CommandesService } from '../../services/commandes.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-commandes',
  templateUrl: './commandes.component.html',
  styleUrl: './commandes.component.css'
})
export class CommandesComponent implements OnInit, OnDestroy {
  orders: any[] = [];
  filteredOrders: any[] = [];
  loading: boolean = true;
  error: string | null = null;
  searchTerm: string = '';
  sortBy: string = 'recent';
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalItems: number = 0;
  lastUpdate: Date = new Date();
  autoRefreshEnabled: boolean = true;
  
  private refreshSubscription: Subscription | null = null;
  private timeUpdateSubscription: Subscription | null = null;

  statusMap: { [key: string]: string } = {
    'CONFIRMEE': 'Confirmee',
    'EN_ATTENTE': 'En attente',
    'EXPEDIEE': 'Expediee',
    'LIVREE': 'Livree',
    'ANNULEE': 'Annulee',
    'PAYE': 'Payee'
  };

  statusClassMap: { [key: string]: string } = {
    'CONFIRMEE': 'status-badge-processing',
    'EN_ATTENTE': 'status-badge-pending',
    'EXPEDIEE': 'status-badge-shipped',
    'LIVREE': 'status-badge-delivered',
    'ANNULEE': 'status-badge-cancelled',
    'PAYE': 'status-badge-processing'
  };

  livraisonStatusMap: { [key: string]: string } = {
    'EN_ATTENTE': 'En attente',
    'EN_COURS_PREPARATION': 'En préparation',
    'EN_COURS_LIVRAISON': 'En livraison',
    'LIVRE': 'Livré'
  };

  livraisonStatusClassMap: { [key: string]: string } = {
    'EN_ATTENTE': 'status-badge-pending',
    'EN_COURS_PREPARATION': 'status-badge-processing',
    'EN_COURS_LIVRAISON': 'status-badge-shipped',
    'LIVRE': 'status-badge-delivered'
  };

  constructor(
    public themeService: ThemeService,
    private commandesService: CommandesService
  ) {}

  ngOnInit(): void {
    this.loadCommandes();
    this.startAutoRefresh();
    this.startTimeUpdate();
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    if (this.timeUpdateSubscription) {
      this.timeUpdateSubscription.unsubscribe();
    }
  }

  loadCommandes(): void {
    this.loading = true;
    this.error = null;
    
    this.commandesService.getToutesLesCommandes().subscribe({
      next: (response) => {
        console.log('Commandes recues:', response);
        this.processCommandes(response);
        this.loading = false;
        this.lastUpdate = new Date();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes:', error);
        this.error = 'Impossible de charger les commandes. Veuillez reessayer.';
        this.loading = false;
      }
    });
  }

  startAutoRefresh(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }

    this.refreshSubscription = interval(30000).subscribe(() => {
      if (this.autoRefreshEnabled) {
        console.log('Actualisation automatique des commandes');
        this.commandesService.getToutesLesCommandes().subscribe({
          next: (response) => {
            this.processCommandes(response);
            this.lastUpdate = new Date();
          },
          error: (error) => {
            console.error('Erreur lors de l\'actualisation automatique:', error);
          }
        });
      }
    });
  }

  startTimeUpdate(): void {
    this.timeUpdateSubscription = interval(60000).subscribe(() => {
      this.filteredOrders = [...this.filteredOrders];
    });
  }

  processCommandes(response: any): void {
    if (response && response.commandes && Array.isArray(response.commandes)) {
      this.orders = this.transformOrders(response.commandes);
      
      this.orders.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      this.totalItems = response.total || this.orders.length;
      this.applyFilters();
    } else {
      this.orders = [];
      this.filteredOrders = [];
      this.error = 'Aucune commande trouvee';
    }
  }

  transformOrders(apiOrders: any[]): any[] {
    return apiOrders.map((order, index) => {
      const firstArticle = order.articles && order.articles.length > 0 ? order.articles[0] : null;
      const totalArticles = order.articles ? order.articles.length : 0;
      
      return {
        _id: order._id || index,
        id: order._id || index,
        numeroCommande: order.numeroCommande || 'CMD-' + (index + 1),
        client: order.emailUtilisateur || 'Client inconnu',
        clientAvatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(order.emailUtilisateur || 'Client') + '&background=ffbf00&color=1a1a1a&size=32',
        product: firstArticle ? firstArticle.nom : 'Article inconnu',
        productImage: firstArticle && firstArticle.images && firstArticle.images.length > 0 
          ? firstArticle.images[0] 
          : 'https://picsum.photos/seed/1/40/40',
        price: this.formatPrice(order.montantAPayer || 0, 'USD'),
        vendor: firstArticle && firstArticle.vendeurNom ? firstArticle.vendeurNom : 'Vendeur inconnu',
        vendorAvatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(firstArticle?.vendeurNom || 'Vendeur') + '&background=ffbf00&color=1a1a1a&size=24',
        status: this.statusMap[order.statutCommande] || order.statutCommande || 'En attente',
        statusClass: this.statusClassMap[order.statutCommande] || 'status-badge-pending',
        livraisonStatus: this.livraisonStatusMap[order.statutLivraison] || order.statutLivraison || 'En attente',
        livraisonStatusClass: this.livraisonStatusClassMap[order.statutLivraison] || 'status-badge-pending',
        date: this.formatDate(order.createdAt),
        createdAt: order.createdAt,
        totalArticles: totalArticles,
        articles: order.articles || [],
        adresseLivraison: order.adresseLivraison || 'Non specifiee',
        modePaiement: order.modePaiement || 'Non specifie',
        rawData: order
      };
    });
  }

  formatPrice(amount: number, currency: string): string {
    if (!amount) return '0 USD';
    
    const formatter = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return formatter.format(amount);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTimeAgo(dateString: string): string {
    if (!dateString) return 'Date inconnue';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 0) {
      return 'Dans le futur';
    }
    
    if (diffInSeconds < 60) {
      return 'A l\'instant';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return 'Il y a ' + diffInMinutes + ' minute' + (diffInMinutes > 1 ? 's' : '');
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return 'Il y a ' + diffInHours + ' heure' + (diffInHours > 1 ? 's' : '');
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return 'Il y a ' + diffInDays + ' jour' + (diffInDays > 1 ? 's' : '');
    }
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return 'Il y a ' + diffInWeeks + ' semaine' + (diffInWeeks > 1 ? 's' : '');
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return 'Il y a ' + diffInMonths + ' mois';
    }
    
    const diffInYears = Math.floor(diffInDays / 365);
    return 'Il y a ' + diffInYears + ' an' + (diffInYears > 1 ? 's' : '');
  }

  applyFilters(): void {
    let filtered = [...this.orders];

    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(order => 
        order.numeroCommande.toLowerCase().includes(term) ||
        order.client.toLowerCase().includes(term) ||
        order.product.toLowerCase().includes(term) ||
        order.vendor.toLowerCase().includes(term)
      );
    }

    switch (this.sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'price-asc':
        filtered.sort((a, b) => this.extractPrice(a.price) - this.extractPrice(b.price));
        break;
      case 'price-desc':
        filtered.sort((a, b) => this.extractPrice(b.price) - this.extractPrice(a.price));
        break;
      default:
        break;
    }

    this.totalItems = filtered.length;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredOrders = filtered.slice(startIndex, endIndex);
  }

  extractPrice(priceString: string): number {
    const match = priceString.match(/([\d\s,\.]+)/);
    if (match) {
      return parseFloat(match[0].replace(/\s/g, '').replace(',', '.'));
    }
    return 0;
  }

  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.currentPage = 1;
    this.applyFilters();
  }

  onSortChange(event: any): void {
    this.sortBy = event.target.value;
    this.currentPage = 1;
    this.applyFilters();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.getTotalPages()) return;
    this.currentPage = page;
    this.applyFilters();
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  getDisplayedRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return 'Affichage ' + start + '-' + end + ' sur ' + this.totalItems + ' commandes';
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      let startPage = Math.max(2, this.currentPage - 1);
      let endPage = Math.min(totalPages - 1, this.currentPage + 1);
      
      if (this.currentPage <= 2) {
        endPage = 4;
      }
      if (this.currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
      }
      
      if (startPage > 2) {
        pages.push(-1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(i);
        }
      }
      
      if (endPage < totalPages - 1) {
        pages.push(-1);
      }
      pages.push(totalPages);
    }
    
    return pages;
  }

  toggleAutoRefresh(): void {
    this.autoRefreshEnabled = !this.autoRefreshEnabled;
    if (this.autoRefreshEnabled) {
      this.startAutoRefresh();
    }
  }

  refreshManually(): void {
    this.loadCommandes();
  }
}