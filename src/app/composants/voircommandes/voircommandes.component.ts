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
  idLivreur: string | null;
  statutLivraison: string;
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

  // Refresh automatique
  private refreshInterval: any = null;
  private readonly REFRESH_INTERVAL = 30000;

  paiementStatusMap: { [key: string]: { label: string, class: string } } = {
    'PAYE': { label: 'Payé', class: 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30' },
    'EN_ATTENTE': { label: 'En attente', class: 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30' },
    'ECHEC': { label: 'Échoué', class: 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30' },
    'REMBOURSE': { label: 'Remboursé', class: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30' },
    'EN_COURS': { label: 'En cours', class: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30' },
    'ACCEPTE': { label: 'Accepté', class: 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30' },
    'ANNULE': { label: 'Annulé', class: 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30' }
  };

  // Statut de livraison global de la commande (4 états de l'enum backend)
  statutLivraisonCommandeMap: { [key: string]: { label: string, class: string } } = {
    'EN_ATTENTE': { label: 'En attente', class: 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30' },
    'EN_COURS_PREPARATION': { label: 'En préparation', class: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30' },
    'EN_COURS_LIVRAISON': { label: 'En livraison', class: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30' },
    'LIVRE': { label: 'Livré', class: 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30' }
  };

  statutsLivraisonDisponibles: string[] = [
    'EN_ATTENTE',
    'EN_COURS_PREPARATION',
    'EN_COURS_LIVRAISON',
    'LIVRE'
  ];

  isUpdatingLivraison: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commandesService: CommandesService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
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
   * Met à jour le statut de livraison global de la commande (4 états)
   */
  updateCommandeStatutLivraison(newStatus: string): void {
    if (!this.commande || this.isUpdatingLivraison || this.commande.statutLivraison === newStatus) {
      return;
    }

    const oldStatus = this.commande.statutLivraison;
    this.isUpdatingLivraison = true;

    // Mise à jour optimiste de l'UI
    this.commande.statutLivraison = newStatus;

    this.commandesService.updateStatutLivraison(this.commandeId, newStatus).subscribe({
      next: () => {
        this.isUpdatingLivraison = false;
        this.showMessage(`✅ Statut de livraison mis à jour : ${this.getStatutLivraisonCommande(newStatus).label}`, 'success');
      },
      error: (error) => {
        console.error('❌ Erreur mise à jour statut livraison commande:', error);

        // Restaurer l'ancien statut en cas d'erreur
        if (this.commande) {
          this.commande.statutLivraison = oldStatus;
        }
        this.isUpdatingLivraison = false;

        const errorMsg = error.error?.message || error.message || 'Impossible de mettre à jour le statut de livraison.';
        this.showMessage('❌ ' + errorMsg, 'error');
      }
    });
  }

  getStatutLivraisonCommande(status: string): any {
    return this.statutLivraisonCommandeMap[status] || { label: status || 'Inconnu', class: 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border border-gray-500/30' };
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

  getPaiementStatus(status: string): any {
    return this.paiementStatusMap[status] || { label: status || 'Inconnu', class: 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border border-gray-500/30' };
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