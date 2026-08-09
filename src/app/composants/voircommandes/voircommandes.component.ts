import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommandesService } from '../../services/commandes.service';
import { ThemeService } from '../../services/theme.service';

interface Article {
  articleId: string;
  nom: string;
  prix: number;
  reduction: number;
  prixreduit: number;
  prixFinal: number;
  quantite: number;
  statutLivraison: string;
  categorie: string;
  genre: string;
  description: string;
  images: string[];
  couleurChoisie: string;
  tailleChoisie: string;
  vendeurId: string;
  vendeurNom: string;
  vendeurTelephone: string;
}

interface Commande {
  _id: string;
  numeroCommande: string;
  utilisateurId: string;
  emailUtilisateur: string;
  articles: Article[];
  montantTotal: number;
  montantReduction: number;
  montantLivraison: number;
  montantAPayer: number;
  devise: string;
  codePromo: string | null;
  modePaiement: string;
  operateurPaiement: string;
  telephonePaiement: string;
  depositId: string | null;
  providerTransactionId: string | null;
  statutPaiement: string;
  statutCommande: string;
  adresseLivraison: string;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-voircommandes',
  templateUrl: './voircommandes.component.html',
  styleUrl: './voircommandes.component.css'
})
export class VoircommandesComponent implements OnInit, OnDestroy {
  commande: Commande | null = null;
  loading: boolean = true;
  error: string | null = null;
  commandeId: string = '';
  isUpdating: boolean = false;
  updatingArticleId: string | null = null;
  adminId: string = '';
  isAuthorized: boolean = false;

  // Refresh automatique
  private refreshInterval: any = null;
  private readonly REFRESH_INTERVAL = 30000;

  // Mapping des statuts
  statusMap: { [key: string]: { label: string, class: string } } = {
    'CONFIRMEE': { label: 'Confirmée', class: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30' },
    'EN_ATTENTE': { label: 'En attente', class: 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30' },
    'EXPEDIEE': { label: 'Expédiée', class: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30' },
    'LIVREE': { label: 'Livrée', class: 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30' },
    'ANNULEE': { label: 'Annulée', class: 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30' },
    'PAYE': { label: 'Payée', class: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30' }
  };

  paiementStatusMap: { [key: string]: { label: string, class: string } } = {
    'PAYE': { label: 'Payé', class: 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30' },
    'EN_ATTENTE': { label: 'En attente', class: 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30' },
    'ECHEC': { label: 'Échoué', class: 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30' },
    'REMBOURSE': { label: 'Remboursé', class: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30' },
    'EN_COURS': { label: 'En cours', class: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30' },
    'ACCEPTE': { label: 'Accepté', class: 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30' },
    'ANNULE': { label: 'Annulé', class: 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30' }
  };

  livraisonStatusMap: { [key: string]: { label: string, class: string } } = {
    'NON_LIVRE': { label: 'Non livré', class: 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30' },
    'LIVRE': { label: 'Livré', class: 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30' }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commandesService: CommandesService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID de l'administrateur connecté depuis localStorage
    this.loadAdminData();
    
    this.route.params.subscribe(params => {
      this.commandeId = params['id'];
      if (this.commandeId) {
        this.loadCommande();
        this.startAutoRefresh();
      } else {
        this.error = 'ID de commande non trouvé';
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  /**
   * Charger les données de l'administrateur depuis localStorage
   */
  loadAdminData(): void {
    try {
      // Essayer de récupérer depuis user_data d'abord
      const userDataStr = localStorage.getItem('user_data');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        this.adminId = userData.adminId || userData.id || userData._id || '';
        console.log('🆔 Admin ID (user_data):', this.adminId);
        return;
      }

      // Sinon essayer depuis user
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        this.adminId = user.adminId || user.id || user._id || '';
        console.log('🆔 Admin ID (user):', this.adminId);
        return;
      }

      // Sinon essayer depuis auth_token
      const tokenStr = localStorage.getItem('auth_token');
      if (tokenStr) {
        // Essayer de décoder le token JWT
        try {
          const tokenParts = tokenStr.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            this.adminId = payload.adminId || payload.id || payload._id || payload.sub || '';
            console.log('🆔 Admin ID (token):', this.adminId);
          }
        } catch (e) {
          console.error('Erreur décodage token:', e);
        }
      }

      if (!this.adminId) {
        console.warn('⚠️ Aucun ID administrateur trouvé dans localStorage');
      }
    } catch (error) {
      console.error('Erreur chargement données admin:', error);
    }
  }

  /**
   * Vérifie si l'article appartient à l'administrateur connecté
   */
  isAdminArticle(article: Article): boolean {
    if (!this.adminId || !article) return false;
    return String(article.vendeurId) === String(this.adminId);
  }

  startAutoRefresh(): void {
    this.stopAutoRefresh();
    this.refreshInterval = setInterval(() => {
      if (this.commandeId) {
        console.log('Auto-refresh des détails de la commande...');
        this.loadCommande();
      }
    }, this.REFRESH_INTERVAL);
  }

  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  loadCommande(): void {
    this.loading = true;
    this.error = null;

    this.commandesService.getCommandeById(this.commandeId).subscribe({
      next: (response) => {
        console.log('Commande reçue:', response);
        
        let commandeData: any = response;
        if (response && response.commande) {
          commandeData = response.commande;
        } else if (response && response.data) {
          commandeData = response.data;
        }

        if (commandeData && commandeData._id) {
          this.commande = commandeData;
          // Vérifier si l'admin a au moins un article dans cette commande
          this.checkAuthorization();
        } else {
          this.error = 'Commande non trouvée';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la commande:', error);
        this.error = 'Impossible de charger les détails de la commande. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  /**
   * Vérifie si l'administrateur a des articles dans cette commande
   */
  checkAuthorization(): void {
    if (!this.commande || !this.adminId) {
      this.isAuthorized = false;
      return;
    }

    // Vérifier si l'admin a au moins un article dans cette commande
    const hasAdminArticle = this.commande.articles.some(article => 
      String(article.vendeurId) === String(this.adminId)
    );

    this.isAuthorized = hasAdminArticle;
    
    if (!hasAdminArticle) {
      console.warn('⚠️ Aucun article de cet administrateur dans la commande');
    }
  }

  /**
   * Met à jour le statut de livraison d'un article
   */
  async updateArticleLivraisonStatus(article: Article, newStatus: string): Promise<void> {
    // Empêcher les doubles clics
    if (this.isUpdating || this.updatingArticleId === article.articleId) {
      return;
    }

    // Vérifier que l'admin est bien le propriétaire de l'article
    if (!this.isAdminArticle(article)) {
      this.showMessage('❌ Vous n\'êtes pas autorisé à modifier cet article', 'error');
      return;
    }

    const oldStatus = article.statutLivraison;
    this.isUpdating = true;
    this.updatingArticleId = article.articleId;

    // Mise à jour optimiste de l'UI
    article.statutLivraison = newStatus;

    try {
      // Format attendu par le backend : { articleId, statutLivraison, vendeurId }
      const updateData = {
        articleId: article.articleId,
        statutLivraison: newStatus,
        vendeurId: this.adminId // Envoyer l'ID de l'admin comme vendeurId
      };

      console.log('📤 Envoi requête de mise à jour:', updateData);

      // Utiliser la méthode modifierCommande existante
      this.commandesService.modifierCommande(this.commandeId, updateData).subscribe({
        next: (response) => {
          console.log('✅ Statut de livraison mis à jour avec succès:', response);
          this.isUpdating = false;
          this.updatingArticleId = null;
          
          // Recharger la commande pour avoir les données à jour
          this.loadCommande();
          
          const message = `✅ "${article.nom}" ${newStatus === 'LIVRE' ? 'livré' : 'non livré'} avec succès`;
          this.showMessage(message, 'success');
        },
        error: (error) => {
          console.error('❌ Erreur détaillée:', error);
          console.error('❌ Corps de l\'erreur:', error.error);
          
          // Restaurer l'ancien statut en cas d'erreur
          article.statutLivraison = oldStatus;
          this.isUpdating = false;
          this.updatingArticleId = null;
          
          // Récupérer le message d'erreur du backend
          let errorMsg = 'Impossible de mettre à jour le statut. ';
          if (error.error) {
            if (typeof error.error === 'string') {
              errorMsg += error.error;
            } else if (error.error.message) {
              errorMsg += error.error.message;
            } else if (error.message) {
              errorMsg += error.message;
            }
          } else if (error.message) {
            errorMsg += error.message;
          }
          
          this.showMessage('❌ ' + errorMsg, 'error');
        }
      });
    } catch (error: any) {
      console.error('❌ Erreur catch:', error);
      // Restaurer l'ancien statut
      article.statutLivraison = oldStatus;
      this.isUpdating = false;
      this.updatingArticleId = null;
      this.showMessage('❌ Erreur lors de la mise à jour', 'error');
    }
  }

  /**
   * Affiche un message de notification
   */
  showMessage(message: string, type: 'success' | 'error'): void {
    if (type === 'success') {
      console.log('✅ Succès:', message);
      this.error = null;
    } else {
      console.error('❌ Erreur:', message);
      this.error = message;
      // Cache l'erreur après 5 secondes
      setTimeout(() => {
        if (this.error === message) {
          this.error = null;
        }
      }, 5000);
    }
  }

  /**
   * Formate un prix en Dollars américains (USD)
   */
  formatPrice(amount: number, currency: string = 'USD'): string {
    if (!amount && amount !== 0) return '0,00 $';
    
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
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  getStatus(status: string): any {
    return this.statusMap[status] || { label: status || 'Inconnu', class: 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border border-gray-500/30' };
  }

  getPaiementStatus(status: string): any {
    return this.paiementStatusMap[status] || { label: status || 'Inconnu', class: 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border border-gray-500/30' };
  }

  getLivraisonStatus(status: string): any {
    return this.livraisonStatusMap[status] || { label: status || 'Inconnu', class: 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border border-gray-500/30' };
  }

  getTimeAgo(dateString: string): string {
    if (!dateString) return 'Date inconnue';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 0) return 'Dans le futur';
    if (diffInSeconds < 60) return 'À l\'instant';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `Il y a ${diffInWeeks} semaine${diffInWeeks > 1 ? 's' : ''}`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `Il y a ${diffInMonths} mois`;
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `Il y a ${diffInYears} an${diffInYears > 1 ? 's' : ''}`;
  }

  goBack(): void {
    window.history.back();
  }
}