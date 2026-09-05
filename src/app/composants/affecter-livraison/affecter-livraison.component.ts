import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { CommandesService } from '../../services/commandes.service';
import { LivreurService } from '../../services/livreur.service';

@Component({
  selector: 'app-affecter-livraison',
  templateUrl: './affecter-livraison.component.html',
  styleUrl: './affecter-livraison.component.css'
})
export class AffecterLivraisonComponent implements OnInit {

  commandes: any[] = [];
  filteredCommandes: any[] = [];
  livreurs: any[] = [];
  livreursById: { [key: string]: any } = {};

  isLoading: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';

  searchTerm: string = '';
  activeFilter: 'non_affectees' | 'affectees' | 'toutes' = 'non_affectees';

  statutLivraisonMap: { [key: string]: { label: string; class: string } } = {
    'EN_ATTENTE': { label: 'En attente', class: 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30' },
    'EN_COURS_PREPARATION': { label: 'En préparation', class: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30' },
    'EN_COURS_LIVRAISON': { label: 'En livraison', class: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30' },
    'LIVRE': { label: 'Livré', class: 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30' }
  };

  // Modale d'affectation
  isAssignModalOpen: boolean = false;
  commandeToAssign: any = null;
  selectedLivreurId: string = '';
  isAssigning: boolean = false;
  livreurSearchTerm: string = '';
  filteredLivreursForModal: any[] = [];

  constructor(
    public themeService: ThemeService,
    private commandesService: CommandesService,
    private livreurService: LivreurService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.livreurService.getLivreurs().subscribe({
      next: (livreurs) => {
        this.livreurs = livreurs || [];
        this.livreursById = {};
        this.livreurs.forEach(l => this.livreursById[l._id] = l);
        this.loadCommandes();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des livreurs:', error);
        this.loadCommandes();
      }
    });
  }

  loadCommandes(): void {
    this.commandesService.getToutesLesCommandes().subscribe({
      next: (response) => {
        const commandes = response?.commandes ?? (Array.isArray(response) ? response : []);

        this.commandes = commandes
          .filter((c: any) => c.statutCommande !== 'ANNULEE')
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes:', error);
        this.errorMessage = 'Impossible de charger les commandes. Veuillez réessayer.';
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    let list = [...this.commandes];

    if (this.activeFilter === 'non_affectees') {
      list = list.filter(c => !c.idLivreur);
    } else if (this.activeFilter === 'affectees') {
      list = list.filter(c => !!c.idLivreur);
    }

    const search = this.searchTerm.toLowerCase().trim();
    if (search) {
      list = list.filter(c =>
        (c.numeroCommande || '').toLowerCase().includes(search) ||
        (c.emailUtilisateur || '').toLowerCase().includes(search)
      );
    }

    this.filteredCommandes = list;
  }

  setFilter(filter: 'non_affectees' | 'affectees' | 'toutes'): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilter();
  }

  countNonAffectees(): number {
    return this.commandes.filter(c => !c.idLivreur).length;
  }

  countAffectees(): number {
    return this.commandes.filter(c => !!c.idLivreur).length;
  }

  getLivreurId(commande: any): string | null {
    if (!commande.idLivreur) return null;
    return typeof commande.idLivreur === 'object' ? commande.idLivreur._id : commande.idLivreur;
  }

  getLivreurAssigne(commande: any): any {
    const id = this.getLivreurId(commande);
    return id ? this.livreursById[id] : null;
  }

  getStatutLivraison(status: string): { label: string; class: string } {
    return this.statutLivraisonMap[status] || { label: status || 'Inconnu', class: 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border border-gray-500/30' };
  }

  getAdresse(commande: any): string {
    const adresse = commande.adresseLivraison;
    if (!adresse) return 'Adresse non renseignée';
    if (typeof adresse === 'string') return adresse;

    const parts = [adresse.rue || adresse.adresse, adresse.commune, adresse.ville].filter(Boolean);
    return parts.length ? parts.join(', ') : 'Adresse non renseignée';
  }

  getTotalArticles(commande: any): number {
    return commande.articles?.length || 0;
  }

  formatPrice(amount: number): string {
    if (!amount && amount !== 0) return '0,00 $';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // ===== Modale d'affectation =====

  openAssignModal(commande: any): void {
    this.commandeToAssign = commande;
    this.selectedLivreurId = this.getLivreurId(commande) || '';
    this.livreurSearchTerm = '';
    this.filteredLivreursForModal = [...this.livreurs];
    this.isAssignModalOpen = true;
  }

  closeAssignModal(): void {
    this.isAssignModalOpen = false;
    this.commandeToAssign = null;
    this.selectedLivreurId = '';
  }

  filterLivreursModal(): void {
    const search = this.livreurSearchTerm.toLowerCase().trim();
    this.filteredLivreursForModal = !search
      ? [...this.livreurs]
      : this.livreurs.filter(l =>
          (l.nom || '').toLowerCase().includes(search) ||
          (l.telephone || '').toLowerCase().includes(search)
        );
  }

  selectLivreur(livreur: any): void {
    this.selectedLivreurId = livreur._id;
  }

  confirmAssignment(): void {
    if (!this.commandeToAssign || !this.selectedLivreurId) {
      this.showError('Veuillez sélectionner un livreur');
      return;
    }

    this.isAssigning = true;
    this.errorMessage = '';

    // On affecte le livreur à la commande et on fait passer la livraison en cours
    this.commandesService.affecterLivreur(this.commandeToAssign._id, this.selectedLivreurId).subscribe({
      next: () => {
        const livreur = this.livreursById[this.selectedLivreurId];
        this.showSuccess(`Livraison affectée à ${livreur?.nom || 'ce livreur'} avec succès !`);
        this.isAssigning = false;
        this.closeAssignModal();
        this.loadCommandes();
      },
      error: (error) => {
        console.error('Erreur lors de l\'affectation du livreur:', error);
        if (error.error?.message) {
          this.showError('Erreur: ' + error.error.message);
        } else {
          this.showError('Erreur lors de l\'affectation du livreur. Veuillez réessayer.');
        }
        this.isAssigning = false;
      }
    });
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
}
