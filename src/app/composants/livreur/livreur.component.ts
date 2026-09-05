import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { LivreurService } from '../../services/livreur.service';

@Component({
  selector: 'app-livreur',
  templateUrl: './livreur.component.html',
  styleUrl: './livreur.component.css'
})
export class LivreurComponent implements OnInit {

  livreurs: any[] = [];
  filteredLivreurs: any[] = [];
  searchTerm: string = '';

  isLoading: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';

  // Modale d'inscription
  isModalOpen: boolean = false;
  isSubmitting: boolean = false;
  selectedPhoto: File | null = null;
  photoPreview: string | ArrayBuffer | null = null;

  livreurData = {
    nom: '',
    email: '',
    password: '',
    telephone: ''
  };

  // Modale de suppression
  isDeleteModalOpen: boolean = false;
  isDeleting: boolean = false;
  livreurToDelete: any = null;

  constructor(
    public themeService: ThemeService,
    private livreurService: LivreurService
  ) {}

  ngOnInit(): void {
    this.loadLivreurs();
  }

  loadLivreurs(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.livreurService.getLivreurs().subscribe({
      next: (data) => {
        this.livreurs = data || [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des livreurs:', error);
        this.errorMessage = 'Impossible de charger la liste des livreurs. Veuillez réessayer.';
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    const search = this.searchTerm.toLowerCase().trim();
    if (!search) {
      this.filteredLivreurs = [...this.livreurs];
    } else {
      this.filteredLivreurs = this.livreurs.filter(livreur =>
        (livreur.nom || '').toLowerCase().includes(search) ||
        (livreur.email || '').toLowerCase().includes(search) ||
        (livreur.telephone || '').toLowerCase().includes(search)
      );
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilter();
  }

  // ===== Modale d'inscription =====

  openModal(): void {
    this.resetForm();
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  resetForm(): void {
    this.livreurData = { nom: '', email: '', password: '', telephone: '' };
    this.selectedPhoto = null;
    this.photoPreview = null;
  }

  onPhotoSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    this.selectedPhoto = file;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.photoPreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removePhoto(): void {
    this.selectedPhoto = null;
    this.photoPreview = null;
  }

  registerLivreur(): void {
    if (!this.livreurData.nom || !this.livreurData.email || !this.livreurData.password || !this.livreurData.telephone) {
      this.showError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!this.selectedPhoto) {
      this.showError('Veuillez sélectionner une photo de profil');
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('nom', this.livreurData.nom);
    formData.append('email', this.livreurData.email);
    formData.append('password', this.livreurData.password);
    formData.append('telephone', this.livreurData.telephone);
    formData.append('photo', this.selectedPhoto);

    this.livreurService.registerLivreur(formData).subscribe({
      next: () => {
        this.showSuccess('Livreur inscrit avec succès !');
        this.loadLivreurs();
        this.closeModal();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Erreur lors de l\'inscription du livreur:', error);
        if (error.error?.message) {
          this.showError('Erreur: ' + error.error.message);
        } else if (typeof error.error === 'string') {
          this.showError('Erreur: ' + error.error);
        } else {
          this.showError('Erreur lors de l\'inscription du livreur. Veuillez réessayer.');
        }
        this.isSubmitting = false;
      }
    });
  }

  // ===== Modale de suppression =====

  confirmDelete(livreur: any): void {
    this.livreurToDelete = livreur;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.livreurToDelete = null;
  }

  deleteLivreur(): void {
    if (!this.livreurToDelete?._id) return;

    this.isDeleting = true;
    this.livreurService.deleteLivreur(this.livreurToDelete._id).subscribe({
      next: () => {
        this.showSuccess('Livreur supprimé avec succès');
        this.loadLivreurs();
        this.isDeleting = false;
        this.closeDeleteModal();
      },
      error: (error) => {
        console.error('Erreur lors de la suppression du livreur:', error);
        this.showError('Erreur lors de la suppression du livreur. Veuillez réessayer.');
        this.isDeleting = false;
        this.closeDeleteModal();
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

  formatDate(date: string): string {
    return date ? new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Date inconnue';
  }
}
