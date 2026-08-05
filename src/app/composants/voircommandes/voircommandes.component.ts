// voircommandes.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommandesService } from '../../services/commandes.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-voircommandes',
  templateUrl: './voircommandes.component.html',
  styleUrl: './voircommandes.component.css'
})
export class VoircommandesComponent implements OnInit {
  commande: any = null;
  loading: boolean = true;
  error: string | null = null;
  commandeId: string = '';

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
    'ECHOUE': { label: 'Échoué', class: 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30' },
    'REMBOURSE': { label: 'Remboursé', class: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30' }
  };

  livraisonStatusMap: { [key: string]: { label: string, class: string } } = {
    'NON_LIVRE': { label: 'Non livré', class: 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30' },
    'EN_COURS': { label: 'En cours', class: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30' },
    'LIVRE': { label: 'Livré', class: 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30' },
    'RETOURNE': { label: 'Retourné', class: 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30' }
  };

  constructor(
    private route: ActivatedRoute,
    private commandesService: CommandesService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.commandeId = params['id'];
      if (this.commandeId) {
        this.loadCommande();
      } else {
        this.error = 'ID de commande non trouvé';
        this.loading = false;
      }
    });
  }

  loadCommande(): void {
    this.loading = true;
    this.error = null;

    this.commandesService.getCommandeById(this.commandeId).subscribe({
      next: (response) => {
        console.log('Commande reçue:', response);
        if (response && response.commande) {
          this.commande = response.commande;
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

  formatPrice(amount: number, currency: string = 'CDF'): string {
    if (!amount) return '0,00 €';
    const formatter = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency === 'CDF' ? 'CDF' : 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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