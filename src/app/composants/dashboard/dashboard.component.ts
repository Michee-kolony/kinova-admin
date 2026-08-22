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

  /* Données des commandes récentes */
  /*
    {
      id: 1,
      product: 'iPhone 15 Pro Max',
      price: '1 299,99 €',
      image: 'https://picsum.photos/seed/1/60/60',
      status: 'Livrée',
      statusClass: 'delivered'
    },
    {
      id: 2,
      product: 'MacBook Pro 16"',
      price: '2 499,00 €',
      image: 'https://picsum.photos/seed/2/60/60',
      status: 'En traitement',
      statusClass: 'processing'
    },
    {
      id: 3,
      product: 'Samsung Galaxy S24 Ultra',
      price: '1 399,00 €',
      image: 'https://picsum.photos/seed/3/60/60',
      status: 'En attente',
      statusClass: 'pending'
    },
    {
      id: 4,
      product: 'AirPods Pro 2',
      price: '279,00 €',
      image: 'https://picsum.photos/seed/4/60/60',
      status: 'Livrée',
      statusClass: 'delivered'
    },
    {
      id: 5,
      product: 'iPad Pro 12.9"',
      price: '1 199,00 €',
      image: 'https://picsum.photos/seed/5/60/60',
      status: 'Expédiée',
      statusClass: 'shipped'
    },
    {
      id: 6,
      product: 'Apple Watch Series 9',
      price: '449,00 €',
      image: 'https://picsum.photos/seed/6/60/60',
      status: 'En traitement',
      statusClass: 'processing'
    },
    {
      id: 7,
      product: 'Dell XPS 13"',
      price: '1 899,00 €',
      image: 'https://picsum.photos/seed/7/60/60',
      status: 'En attente',
      statusClass: 'pending'
    },
    {
      id: 8,
      product: 'Sony WH-1000XM5',
      price: '399,00 €',
      image: 'https://picsum.photos/seed/8/60/60',
      status: 'Livrée',
      statusClass: 'delivered'
    },
    {
      id: 9,
      product: 'Canon EOS R6',
      price: '2 699,00 €',
      image: 'https://picsum.photos/seed/9/60/60',
      status: 'Expédiée',
      statusClass: 'shipped'
    },
    {
      id: 10,
      product: 'Nintendo Switch OLED',
      price: '349,00 €',
      image: 'https://picsum.photos/seed/10/60/60',
      status: 'En attente',
      statusClass: 'pending'
    }
  ]; */

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