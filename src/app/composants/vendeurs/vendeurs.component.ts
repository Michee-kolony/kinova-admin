import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { VendeurService } from '../../services/vendeur.service';

@Component({
  selector: 'app-vendeurs',
  templateUrl: './vendeurs.component.html',
  styleUrl: './vendeurs.component.css'
})
export class VendeursComponent implements OnInit {
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  Math = Math;

  // Liste des vendeurs - sera remplie dynamiquement
  allVendeurs: any[] = [];
  filteredVendeurs: any[] = [];
  paginatedVendeurs: any[] = [];

  // Statistiques
  totalVendeurs: number = 0;
  vendeursVerifies: number = 0;
  vendeursNonVerifies: number = 0;

  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    public themeService: ThemeService,
    private vendeurService: VendeurService
  ) {}

  ngOnInit() {
    this.loadVendeurs();
  }

  loadVendeurs() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.vendeurService.getVendeurs().subscribe({
      next: (data) => {
        console.log('Données reçues du service:', data);
        
        // Transformer les données pour correspondre au format attendu
        this.allVendeurs = data.map((vendeur: any) => this.transformVendeurData(vendeur));
        
        // Mettre à jour les statistiques
        this.updateStats();
        
        // Initialiser les listes filtrées
        this.filteredVendeurs = [...this.allVendeurs];
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des vendeurs:', error);
        this.errorMessage = 'Impossible de charger la liste des vendeurs. Veuillez réessayer.';
        this.isLoading = false;
        
        // En cas d'erreur, utiliser des données de fallback
        this.loadFallbackData();
      }
    });
  }

  transformVendeurData(vendeur: any): any {
    // Utiliser storeName comme nom principal
    const name = vendeur.storeName || 'Vendeur sans nom';
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ffbf00&color=1a1a1a&size=80`;
    
    return {
      id: vendeur._id || vendeur.id,
      name: name,
      email: vendeur.email || 'Email non renseigné',
      phone: vendeur.phoneNumber || vendeur.mobileMoneyNumber || 'Non renseigné',
      location: vendeur.address || 'Adresse non renseignée',
      shopName: vendeur.storeName || 'Boutique sans nom',
      shopCategory: vendeur.storeCategory || 'Non catégorisé',
      avatar: avatarUrl,
      isVerified: vendeur.isVerified || false,
      status: vendeur.status || 'pending',
      paymentMethod: vendeur.paymentMethod || 'Non renseigné',
      mobileMoneyNumber: vendeur.mobileMoneyNumber || 'Non renseigné',
      createdAt: vendeur.createdAt || new Date().toISOString(),
      updatedAt: vendeur.updatedAt || new Date().toISOString(),
      // Garder les données brutes pour référence
      rawData: vendeur
    };
  }

  updateStats() {
    this.totalVendeurs = this.allVendeurs.length;
    this.vendeursVerifies = this.allVendeurs.filter(v => v.isVerified === true).length;
    this.vendeursNonVerifies = this.allVendeurs.filter(v => v.isVerified === false).length;
  }

  loadFallbackData() {
    // Données de fallback en cas d'erreur API
    this.allVendeurs = [
      {
        id: '1',
        name: 'Marie Martin',
        email: 'marie.martin@email.com',
        phone: '+33 6 12 34 56 78',
        location: 'Paris, France',
        shopName: 'TechShop Pro',
        shopCategory: 'Électronique',
        avatar: 'https://ui-avatars.com/api/?name=Marie+Martin&background=ffbf00&color=1a1a1a&size=80',
        isVerified: true,
        status: 'active',
        paymentMethod: 'Mobile Money',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Pierre Durand',
        email: 'pierre.durand@email.com',
        phone: '+33 6 98 76 54 32',
        location: 'Lyon, France',
        shopName: 'Mode & Élégance',
        shopCategory: 'Mode',
        avatar: 'https://ui-avatars.com/api/?name=Pierre+Durand&background=ffbf00&color=1a1a1a&size=80',
        isVerified: true,
        status: 'active',
        paymentMethod: 'Carte Bancaire',
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Julie Petit',
        email: 'julie.petit@email.com',
        phone: '+33 6 45 67 89 01',
        location: 'Marseille, France',
        shopName: 'Beauté & Soins',
        shopCategory: 'Beauté',
        avatar: 'https://ui-avatars.com/api/?name=Julie+Petit&background=ffbf00&color=1a1a1a&size=80',
        isVerified: false,
        status: 'pending',
        paymentMethod: 'Mobile Money',
        createdAt: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Paul Robert',
        email: 'paul.robert@email.com',
        phone: '+33 6 78 90 12 34',
        location: 'Bordeaux, France',
        shopName: 'ElectroWorld',
        shopCategory: 'Électronique',
        avatar: 'https://ui-avatars.com/api/?name=Paul+Robert&background=ffbf00&color=1a1a1a&size=80',
        isVerified: false,
        status: 'inactive',
        paymentMethod: 'Carte Bancaire',
        createdAt: new Date().toISOString()
      },
      {
        id: '5',
        name: 'Claire Simon',
        email: 'claire.simon@email.com',
        phone: '+33 6 34 56 78 90',
        location: 'Toulouse, France',
        shopName: 'Artisan Créatif',
        shopCategory: 'Artisanat',
        avatar: 'https://ui-avatars.com/api/?name=Claire+Simon&background=ffbf00&color=1a1a1a&size=80',
        isVerified: true,
        status: 'active',
        paymentMethod: 'Mobile Money',
        createdAt: new Date().toISOString()
      }
    ];
    
    this.updateStats();
    this.filteredVendeurs = [...this.allVendeurs];
    this.updatePagination();
    this.isLoading = false;
  }

  filterVendeurs() {
    const search = this.searchTerm.toLowerCase().trim();
    
    if (!search) {
      this.filteredVendeurs = [...this.allVendeurs];
    } else {
      this.filteredVendeurs = this.allVendeurs.filter(vendeur =>
        vendeur.name.toLowerCase().includes(search) ||
        vendeur.email.toLowerCase().includes(search) ||
        vendeur.shopName.toLowerCase().includes(search) ||
        vendeur.location.toLowerCase().includes(search) ||
        vendeur.phone.includes(search) ||
        (vendeur.shopCategory && vendeur.shopCategory.toLowerCase().includes(search))
      );
    }

    this.currentPage = 1;
    this.updatePagination();
  }

  clearSearch() {
    this.searchTerm = '';
    this.filterVendeurs();
  }

  voirDetails(vendeur: any) {
    console.log('Voir détails du vendeur:', vendeur);
    const details = `
      ===== DÉTAILS DU VENDEUR =====
      
      Nom: ${vendeur.name}
      Boutique: ${vendeur.shopName}
      Catégorie: ${vendeur.shopCategory || 'Non spécifiée'}
      Email: ${vendeur.email}
      Téléphone: ${vendeur.phone}
      Adresse: ${vendeur.location}
      Méthode de paiement: ${vendeur.paymentMethod}
      Statut: ${vendeur.isVerified ? '✅ Vérifié' : '❌ Non vérifié'}
      Statut du compte: ${vendeur.status || 'Non défini'}
      Date d'inscription: ${new Date(vendeur.createdAt).toLocaleDateString()}
      ID: ${vendeur.id}
    `;
    alert(details);
  }

  // Méthode pour vérifier un vendeur
  verifyVendeur(vendeur: any) {
    if (confirm(`Voulez-vous vérifier le vendeur "${vendeur.name}" ?`)) {
      this.vendeurService.verifyVendeur(vendeur.id).subscribe({
        next: (response) => {
          console.log('Vendeur vérifié avec succès:', response);
          // Recharger la liste pour mettre à jour
          this.loadVendeurs();
          alert(`✅ Le vendeur "${vendeur.name}" a été vérifié avec succès !`);
        },
        error: (error) => {
          console.error('Erreur lors de la vérification:', error);
          alert('❌ Erreur lors de la vérification du vendeur. Veuillez réessayer.');
        }
      });
    }
  }

  // Méthode pour supprimer un vendeur
  deleteVendeur(vendeur: any) {
    if (confirm(`Voulez-vous vraiment supprimer le vendeur "${vendeur.name}" ? Cette action est irréversible.`)) {
      this.vendeurService.deleteVendeur(vendeur.id).subscribe({
        next: (response) => {
          console.log('Vendeur supprimé avec succès:', response);
          // Recharger la liste pour mettre à jour
          this.loadVendeurs();
          alert(`🗑️ Le vendeur "${vendeur.name}" a été supprimé avec succès !`);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          alert('❌ Erreur lors de la suppression du vendeur. Veuillez réessayer.');
        }
      });
    }
  }

  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedVendeurs = this.filteredVendeurs.slice(startIndex, endIndex);
  }

  changePage(page: number) {
    if (page < 1 || page > this.getTotalPages()) return;
    this.currentPage = page;
    this.updatePagination();
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredVendeurs.length / this.itemsPerPage);
  }

  getPages(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(totalPages, start + maxVisible - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (start > 1) {
        pages.unshift(1);
        if (start > 2) {
          pages.splice(1, 0, -1);
        }
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push(-1);
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  }
}