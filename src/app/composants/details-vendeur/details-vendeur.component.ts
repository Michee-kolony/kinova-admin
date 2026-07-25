import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VendeurService } from '../../services/vendeur.service';
import { ArticleService } from '../../services/article.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-details-vendeur',
  templateUrl: './details-vendeur.component.html',
  styleUrl: './details-vendeur.component.css'
})
export class DetailsVendeurComponent implements OnInit {
  
  vendeur: any = null;
  vendeurArticles: any[] = [];
  isLoading: boolean = true;
  isLoadingArticles: boolean = true;
  isVerifying: boolean = false;
  isDeleting: boolean = false;
  errorMessage: string = '';
  vendeurId: string = '';

  // Pour les modales
  showVerifyModal: boolean = false;
  showDeleteModal: boolean = false;
  modalMessage: string = '';
  modalTitle: string = '';
  modalAction: string = '';

  // Pour les toasts
  toastMessage: string = '';
  toastType: string = ''; // 'success', 'error', 'warning', 'info'
  showToast: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vendeurService: VendeurService,
    private articleService: ArticleService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.vendeurId = this.route.snapshot.paramMap.get('id') || '';
    console.log('ID du vendeur récupéré:', this.vendeurId);
    
    if (this.vendeurId) {
      this.loadVendeurDetails();
      this.loadVendeurArticles();
    } else {
      this.errorMessage = 'ID du vendeur non trouvé';
      this.isLoading = false;
    }
  }

  // Afficher un toast
  showToastMessage(message: string, type: string = 'info') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    
    // Masquer automatiquement après 5 secondes
    setTimeout(() => {
      this.hideToast();
    }, 5000);
  }

  // Masquer le toast
  hideToast() {
    this.showToast = false;
    this.toastMessage = '';
    this.toastType = '';
  }

  loadVendeurDetails() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.vendeurService.getVendeurs().subscribe({
      next: (data: any[]) => {
        console.log('Tous les vendeurs reçus:', data);
        this.vendeur = data.find(v => v._id === this.vendeurId);
        
        if (this.vendeur) {
          console.log('Vendeur trouvé:', this.vendeur);
          this.isLoading = false;
        } else {
          console.error('Vendeur non trouve avec l\'ID:', this.vendeurId);
          this.errorMessage = 'Vendeur non trouve.';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des vendeurs:', error);
        this.errorMessage = 'Impossible de charger les détails du vendeur.';
        this.isLoading = false;
        this.loadFallbackVendeur();
      }
    });
  }

  loadFallbackVendeur() {
    const fallbackVendeurs = [
      {
        _id: '6a63855d02eada0e436d8c6c',
        email: 'micheekolony71@gmail.com',
        storeName: 'Ayemtech boutique',
        storeCategory: 'Electronique',
        phoneNumber: '081 030 351 9',
        address: 'Rue Khonde 21',
        paymentMethod: 'mobile_money',
        mobileMoneyNumber: '0810303519',
        status: 'pending',
        isVerified: false,
        createdAt: '2026-07-24T15:31:41.833Z',
        updatedAt: '2026-07-24T15:31:41.833Z'
      }
    ];

    this.vendeur = fallbackVendeurs.find(v => v._id === this.vendeurId);
    
    if (this.vendeur) {
      console.log('Vendeur trouve dans les donnees de fallback:', this.vendeur);
      this.isLoading = false;
    } else {
      this.errorMessage = 'Vendeur non trouve.';
      this.isLoading = false;
    }
  }

  loadVendeurArticles() {
    this.isLoadingArticles = true;
    
    this.articleService.getArticles().subscribe({
      next: (articles: any[]) => {
        console.log('Tous les articles:', articles);
        this.vendeurArticles = articles.filter(article => 
          article.vendeurId === this.vendeurId
        );
        console.log('Articles du vendeur:', this.vendeurArticles);
        this.isLoadingArticles = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des articles:', error);
        this.vendeurArticles = [];
        this.isLoadingArticles = false;
      }
    });
  }

  // Ouvrir le modal de verification
  openVerifyModal() {
    if (!this.vendeur) return;
    this.modalTitle = 'Confirmation de verification';
    this.modalMessage = 'Voulez-vous verifier le vendeur "' + (this.vendeur.storeName || this.vendeur.email) + '" ?';
    this.modalAction = 'verify';
    this.showVerifyModal = true;
  }

  // Ouvrir le modal de suppression
  openDeleteModal() {
    if (!this.vendeur) return;
    this.modalTitle = 'Confirmation de suppression';
    this.modalMessage = 'Voulez-vous vraiment supprimer le vendeur "' + (this.vendeur.storeName || this.vendeur.email) + '" ? Cette action est irreversible.';
    this.modalAction = 'delete';
    this.showDeleteModal = true;
  }

  // Fermer les modales
  closeModal() {
    this.showVerifyModal = false;
    this.showDeleteModal = false;
  }

  // Confirmer la verification
  confirmVerify() {
    if (!this.vendeur) return;
    
    this.isVerifying = true;
    this.showVerifyModal = false;
    
    console.log('Tentative de verification du vendeur ID:', this.vendeurId);
    
    const updatedData = {
      isVerified: true,
      status: 'active'
    };
    
    this.vendeurService.updateVendeur(this.vendeurId, updatedData).subscribe({
      next: (response) => {
        console.log('Vendeur verifie avec succes:', response);
        this.vendeur.isVerified = true;
        this.vendeur.status = 'active';
        this.isVerifying = false;
        this.showToastMessage('Le vendeur "' + this.vendeur.storeName + '" a ete verifie avec succes !', 'success');
      },
      error: (error) => {
        console.error('Erreur lors de la verification:', error);
        this.isVerifying = false;
        
        if (error.status === 0) {
          this.showToastMessage('Erreur de connexion au serveur. Veuillez verifier votre connexion internet.', 'error');
        } else if (error.status === 404) {
          this.showToastMessage('L\'API de mise a jour n\'existe pas. Veuillez contacter l\'administrateur.', 'error');
        } else {
          this.showToastMessage('Erreur lors de la verification du vendeur. Code: ' + error.status, 'error');
        }
      }
    });
  }

  // Confirmer la suppression
  confirmDelete() {
    if (!this.vendeur) return;
    
    this.isDeleting = true;
    this.showDeleteModal = false;
    
    this.vendeurService.deleteVendeur(this.vendeurId).subscribe({
      next: (response) => {
        console.log('Vendeur supprime avec succes:', response);
        this.isDeleting = false;
        this.showToastMessage('Le vendeur "' + this.vendeur.storeName + '" a ete supprime avec succes !', 'success');
        setTimeout(() => {
          this.router.navigate(['/admin/vendeurs']);
        }, 1500);
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.isDeleting = false;
        
        if (error.status === 0) {
          this.showToastMessage('Erreur de connexion au serveur. Veuillez verifier votre connexion internet.', 'error');
        } else if (error.status === 404) {
          this.showToastMessage('Le vendeur n\'existe pas ou a deja ete supprime.', 'warning');
        } else {
          this.showToastMessage('Erreur lors de la suppression du vendeur. Code: ' + error.status, 'error');
        }
      }
    });
  }

  goBack() {
    this.location.back();
  }

  voirArticle(article: any) {
    console.log('Voir article:', article);
    this.router.navigate(['/admin/article-details', article._id]);
  }

  formatDate(date: string): string {
    if (!date) return 'Non specifiee';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPrixFinal(article: any): number {
    if (article.reduction && article.reduction > 0) {
      return article.prix - (article.prix * article.reduction / 100);
    }
    return article.prix;
  }
}