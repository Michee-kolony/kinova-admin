import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import * as L from 'leaflet';
import { ThemeService } from '../../services/theme.service';
import { HttpClient } from '@angular/common/http';
import { AdminService } from '../../services/admin.service';
import { ClientService } from '../../services/client.service';
import { ArticleService } from '../../services/article.service';
import { VendeurService } from '../../services/vendeur.service';
import { CommandesService } from '../../services/commandes.service';
import { LivraisonService } from '../../services/livraison.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  user: any;
  token: string | null = null;

  today: Date = new Date();
  totalAdmin = 0;
  totalClient = 0;
  totalArticle = 0;
  totalemesArticles = 0;
  totalVendeurs = 0; // Ajout de la variable pour les vendeurs
  totalCommandes = 0;
  totalCommandesLivrees = 0;
  totalCommandesNonLivrees = 0;
  recentOrders: any[] = [];
  ordersLoading = true;
  ordersError: string | null = null;

  // ===== Suivi temps réel des livreurs en cours de livraison (carte Leaflet + adresses TomTom) =====
  @ViewChild('livraisonsMap') mapContainer!: ElementRef<HTMLDivElement>;

  livraisonsEnCours: any[] = [];
  adressesLivreurs: { [numeroCommande: string]: string } = {};
  isLoadingLivraisons: boolean = false;
  livraisonsError: string = '';

  private map: L.Map | null = null;
  private themeObserver: MutationObserver | null = null;
  private markers: { [numeroCommande: string]: L.Marker } = {};
  private livraisonsInterval: any = null;
  private readonly LIVRAISONS_REFRESH_INTERVAL = 8000;

  private readonly PHOTO_PLACEHOLDER = 'https://ui-avatars.com/api/?name=Livreur&background=ffbf00&color=1a1a1a&size=64';

  constructor(
    public themeService: ThemeService,
    private admin: AdminService,
    private client: ClientService,
    private article: ArticleService,
    private vendeur: VendeurService,
    private commandesService: CommandesService,
    private livraisonService: LivraisonService
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

  ngAfterViewInit(): void {
    this.initMap();
    this.loadLivraisonsEnCours();
    this.livraisonsInterval = setInterval(
      () => this.loadLivraisonsEnCours(),
      this.LIVRAISONS_REFRESH_INTERVAL
    );
  }

  ngOnDestroy(): void {
    if (this.livraisonsInterval) {
      clearInterval(this.livraisonsInterval);
    }
    this.themeObserver?.disconnect();
    this.map?.remove();
  }

  // ===== Carte Leaflet =====

  initMap(): void {
    if (!this.mapContainer) return;

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [-4.325, 15.322], // Kinshasa
      zoom: 12
    });

    // Tuiles OpenStreetMap : gratuites, sans clé requise
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(this.map);

    this.applyMapTheme();

    // La carte suit le thème clair/sombre du dashboard
    this.themeObserver = new MutationObserver(() => this.applyMapTheme());
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  // Inverse les couleurs des tuiles en mode sombre (pas de service de tuiles
  // sombres gratuit et sans clé fiable, donc filtre CSS sur les tuiles claires)
  private applyMapTheme(): void {
    const tilePane = this.map?.getPane('tilePane');
    if (!tilePane) return;

    tilePane.style.filter = this.themeService.isDark()
      ? 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)'
      : '';
  }

  loadLivraisonsEnCours(): void {
    this.isLoadingLivraisons = true;
    this.livraisonsError = '';

    this.livraisonService.getLivraisonsEnCours().subscribe({
      next: (response) => {
        this.livraisonsEnCours = response?.livraisons || [];
        this.updateMarkers(this.livraisonsEnCours);
        this.resolveAdresses(this.livraisonsEnCours);
        this.isLoadingLivraisons = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des livraisons en cours:', error);
        this.livraisonsError = 'Impossible de charger les livraisons en cours.';
        this.isLoadingLivraisons = false;
      }
    });
  }

  private updateMarkers(livraisons: any[]): void {
    if (!this.map) return;

    const numerosActifs = new Set(livraisons.map(livraison => livraison.numeroCommande));

    // Retirer les marqueurs des livraisons qui ne sont plus en cours
    Object.keys(this.markers).forEach(numero => {
      if (!numerosActifs.has(numero)) {
        this.map!.removeLayer(this.markers[numero]);
        delete this.markers[numero];
      }
    });

    livraisons.forEach(livraison => {
      if (!livraison.position) return;

      const latLng: L.LatLngExpression = [livraison.position.latitude, livraison.position.longitude];
      const marqueurExistant = this.markers[livraison.numeroCommande];

      if (marqueurExistant) {
        marqueurExistant.setLatLng(latLng);
        marqueurExistant.setPopupContent(this.buildPopupContent(livraison));
      } else {
        this.markers[livraison.numeroCommande] = L.marker(latLng, { icon: this.buildLivreurIcon(livraison.photoLivreur) })
          .addTo(this.map!)
          .bindPopup(this.buildPopupContent(livraison));
      }
    });
  }

  // Marqueur personnalisé : photo du livreur avec un badge moto
  private buildLivreurIcon(photoUrl: string): L.DivIcon {
    const photo = photoUrl || this.PHOTO_PLACEHOLDER;

    return L.divIcon({
      className: '',
      html: `
        <div style="position:relative;width:44px;height:44px;">
          <img src="${photo}" onerror="this.src='${this.PHOTO_PLACEHOLDER}'"
            style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:3px solid #ffbf00;box-shadow:0 2px 6px rgba(0,0,0,0.5);display:block;">
          <div style="position:absolute;bottom:-2px;right:-2px;width:18px;height:18px;border-radius:50%;background:#ffbf00;border:2px solid #fff;display:flex;align-items:center;justify-content:center;">
            <i class="fas fa-motorcycle" style="font-size:9px;color:#1a1a1a;"></i>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 44],
      popupAnchor: [0, -44]
    });
  }

  // Contenu de la popup : infos du livreur + de la commande qu'il livre
  private buildPopupContent(livraison: any): string {
    const adresseActuelle = this.adressesLivreurs[livraison.numeroCommande] || 'Localisation en cours...';
    const adresseLivraison = this.formatAdresseLivraison(livraison.adresseLivraison);

    return `
      <div style="min-width:220px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <img src="${livraison.photoLivreur || this.PHOTO_PLACEHOLDER}" onerror="this.src='${this.PHOTO_PLACEHOLDER}'"
            style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid #ffbf00;">
          <div>
            <div style="font-weight:600;">${livraison.nomLivreur || 'Livreur'}</div>
            <div style="font-size:12px;color:#6b7280;">${livraison.telephoneLivreur || ''}</div>
          </div>
        </div>
        <div style="font-size:12px;line-height:1.6;">
          <div><strong>Commande :</strong> #${livraison.numeroCommande}</div>
          <div><strong>Client :</strong> ${livraison.emailUtilisateur || 'N/A'}</div>
          <div><strong>Adresse de livraison :</strong> ${adresseLivraison}</div>
          <div><strong>Position actuelle :</strong> ${adresseActuelle}</div>
        </div>
      </div>
    `;
  }

  private formatAdresseLivraison(adresse: any): string {
    if (!adresse) return 'Non renseignée';
    if (typeof adresse === 'string') return adresse;

    const parts = [adresse.rue || adresse.adresse, adresse.commune, adresse.ville].filter(Boolean);
    return parts.length ? parts.join(', ') : 'Non renseignée';
  }

  // ===== Adresses lisibles via TomTom (géocodage inversé) =====

  private resolveAdresses(livraisons: any[]): void {
    livraisons.forEach(livraison => {
      if (!livraison.position || this.adressesLivreurs[livraison.numeroCommande]) return;

      this.livraisonService.reverseGeocode(livraison.position.latitude, livraison.position.longitude).subscribe({
        next: (result) => {
          const adresse = result?.addresses?.[0]?.address?.freeformAddress;
          if (adresse) {
            this.adressesLivreurs[livraison.numeroCommande] = adresse;

            const marqueur = this.markers[livraison.numeroCommande];
            if (marqueur) {
              marqueur.setPopupContent(this.buildPopupContent(livraison));
            }
          }
        },
        error: () => {
          // Adresse en bonus d'affichage uniquement : on ignore silencieusement l'échec
        }
      });
    });
  }

  centrerSurLivreur(livraison: any): void {
    if (!this.map || !livraison.position) return;

    this.map.setView([livraison.position.latitude, livraison.position.longitude], 15);
    this.markers[livraison.numeroCommande]?.openPopup();
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
          this.totalCommandesLivrees = 0;
          this.totalCommandesNonLivrees = 0;
          this.recentOrders = [];
          this.ordersError = 'Aucune commande trouvee';
          this.ordersLoading = false;
          return;
        }

        this.totalCommandes = commandes.length;
        this.totalCommandesLivrees = commandes.filter(
          (order: any) => order.statutLivraison === 'LIVRE'
        ).length;
        this.totalCommandesNonLivrees = commandes.filter(
          (order: any) => order.statutLivraison !== 'LIVRE'
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
        this.totalCommandesLivrees = 0;
        this.totalCommandesNonLivrees = 0;
        this.ordersError = 'Impossible de charger les commandes recentes.';
        this.ordersLoading = false;
      }
    });
  }

  private transformOrder(order: any, index: number): any {
    const firstArticle = order.articles?.[0];
    const livraisonStatusMap: { [key: string]: string } = {
      EN_ATTENTE: 'En attente',
      EN_COURS_PREPARATION: 'En préparation',
      EN_COURS_LIVRAISON: 'En livraison',
      LIVRE: 'Livré'
    };
    const livraisonStatusClassMap: { [key: string]: string } = {
      EN_ATTENTE: 'pending',
      EN_COURS_PREPARATION: 'processing',
      EN_COURS_LIVRAISON: 'shipped',
      LIVRE: 'delivered'
    };

    return {
      id: order._id || index,
      numeroCommande: order.numeroCommande || 'N/A',
      product: firstArticle?.nom || 'Article inconnu',
      price: this.formatPrice(order.montantAPayer || 0),
      image: firstArticle?.images?.[0] || 'https://picsum.photos/seed/1/60/60',
      status: livraisonStatusMap[order.statutLivraison] || order.statutLivraison || 'En attente',
      statusClass: livraisonStatusClassMap[order.statutLivraison] || 'pending',
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