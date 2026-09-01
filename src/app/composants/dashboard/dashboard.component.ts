import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { HttpClient } from '@angular/common/http';
import { AdminService } from '../../services/admin.service';
import { ClientService } from '../../services/client.service';
import { ArticleService } from '../../services/article.service';
import { VendeurService } from '../../services/vendeur.service';
import { CommandesService } from '../../services/commandes.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  user: any;
  token: string | null = null;

  today: Date = new Date();
  totalAdmin = 0;
  totalClient = 0;
  totalArticle = 0;
  totalemesArticles = 0;
  totalVendeurs = 0; // Ajout de la variable pour les vendeurs
  totalCommandes = 0;
  totalArticlesLivres = 0;
  totalArticlesNonLivres = 0;
  recentOrders: any[] = [];
  ordersLoading = true;
  ordersError: string | null = null;

  constructor(
    public themeService: ThemeService,
    private admin: AdminService,
    private client: ClientService,
    private article: ArticleService,
    private vendeur: VendeurService,
    private commandesService: CommandesService
  ) {}

  
  ngOnInit(): void {
    this.loadAdmins();
    this.loadClients();
    this.loadArticles();
    this.loadmesArticles();
    this.loadVendeurs(); // Appel de la méthode pour charger les vendeurs
    this.loadRecentOrders();

    this.token = localStorage.getItem('auth_token');

    // Récupérer les informations de l'utilisateur
    const userData = localStorage.getItem('user_data');

    if (userData) {
      this.user = JSON.parse(userData);
      console.log(this.user);
    }
  }

  loadAdmins() {
    this.admin.getAdmins().subscribe(admin => {
      this.totalAdmin = admin.length;
    });
  }

  loadClients() {
    this.client.getClients().subscribe(client => {
      this.totalClient = client.length;
    });
  }

  loadArticles() {
    this.article.getArticles().subscribe(article => {
      this.totalArticle = article.length;
    });
  }

  loadmesArticles() {
    this.article.getArticles().subscribe((articles: any[]) => {
      this.totalArticle = articles.length;
      this.totalemesArticles = articles.filter(article =>
        article.vendeurId === this.user.adminId
      ).length;
    });
  }

  // Nouvelle méthode pour charger les vendeurs
  loadVendeurs() {
    this.vendeur.getVendeurs().subscribe({
      next: (vendeurs) => {
        this.totalVendeurs = vendeurs.length;
        console.log('Total vendeurs:', this.totalVendeurs);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des vendeurs:', error);
        this.totalVendeurs = 0;
      }
    });
  }

  loadRecentOrders(): void {
    this.ordersLoading = true;
    this.ordersError = null;

    this.commandesService.getToutesLesCommandes().subscribe({
      next: (response) => {
        const commandes = Array.isArray(response) ? response : response?.commandes;

        if (!Array.isArray(commandes)) {
          this.totalCommandes = 0;
          this.totalArticlesLivres = 0;
          this.totalArticlesNonLivres = 0;
          this.recentOrders = [];
          this.ordersError = 'Aucune commande trouvee';
          this.ordersLoading = false;
          return;
        }

        this.totalCommandes = commandes.length;
        const articles = commandes.reduce(
          (allArticles: any[], order: any) => allArticles.concat(order.articles || []),
          []
        );
        this.totalArticlesLivres = articles.filter(
          (article: any) => article.statutLivraison === 'LIVRE'
        ).length;
        this.totalArticlesNonLivres = articles.filter(
          (article: any) => article.statutLivraison !== 'LIVRE'
        ).length;

        this.recentOrders = commandes
          .map((order: any, index: number) => this.transformOrder(order, index))
          .sort((first, second) => this.getOrderTimestamp(second) - this.getOrderTimestamp(first))
          .slice(0, 10);
        this.ordersLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes recentes:', error);
        this.totalCommandes = 0;
        this.totalArticlesLivres = 0;
        this.totalArticlesNonLivres = 0;
        this.ordersError = 'Impossible de charger les commandes recentes.';
        this.ordersLoading = false;
      }
    });
  }

  private transformOrder(order: any, index: number): any {
    const firstArticle = order.articles?.[0];
    const statusMap: { [key: string]: string } = {
      CONFIRMEE: 'Confirmee',
      EN_ATTENTE: 'En attente',
      EXPEDIEE: 'Expediee',
      LIVREE: 'Livree',
      ANNULEE: 'Annulee',
      PAYE: 'Payee'
    };
    const statusClassMap: { [key: string]: string } = {
      CONFIRMEE: 'processing',
      EN_ATTENTE: 'pending',
      EXPEDIEE: 'shipped',
      LIVREE: 'delivered',
      ANNULEE: 'cancelled',
      PAYE: 'processing'
    };

    return {
      id: order._id || index,
      product: firstArticle?.nom || 'Article inconnu',
      price: this.formatPrice(order.montantAPayer || 0),
      image: firstArticle?.images?.[0] || 'https://picsum.photos/seed/1/60/60',
      status: statusMap[order.statutCommande] || order.statutCommande || 'En attente',
      statusClass: statusClassMap[order.statutCommande] || 'pending',
      createdAt: order.createdAt
    };
  }

  private formatPrice(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  private getOrderTimestamp(order: any): number {
    const timestamp = new Date(order.createdAt).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }
}