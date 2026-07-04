import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

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

  // Liste des vendeurs
  allVendeurs = [
    {
      id: 1,
      name: 'Marie Martin',
      email: 'marie.martin@email.com',
      phone: '+33 6 12 34 56 78',
      location: 'Paris, France',
      shopName: 'TechShop Pro',
      avatar: 'https://ui-avatars.com/api/?name=Marie+Martin&background=ffbf00&color=1a1a1a&size=80',
      status: 'active'
    },
    {
      id: 2,
      name: 'Pierre Durand',
      email: 'pierre.durand@email.com',
      phone: '+33 6 98 76 54 32',
      location: 'Lyon, France',
      shopName: 'Mode & Élégance',
      avatar: 'https://ui-avatars.com/api/?name=Pierre+Durand&background=ffbf00&color=1a1a1a&size=80',
      status: 'active'
    },
    {
      id: 3,
      name: 'Julie Petit',
      email: 'julie.petit@email.com',
      phone: '+33 6 45 67 89 01',
      location: 'Marseille, France',
      shopName: 'Beauté & Soins',
      avatar: 'https://ui-avatars.com/api/?name=Julie+Petit&background=ffbf00&color=1a1a1a&size=80',
      status: 'active'
    },
    {
      id: 4,
      name: 'Paul Robert',
      email: 'paul.robert@email.com',
      phone: '+33 6 78 90 12 34',
      location: 'Bordeaux, France',
      shopName: 'ElectroWorld',
      avatar: 'https://ui-avatars.com/api/?name=Paul+Robert&background=ffbf00&color=1a1a1a&size=80',
      status: 'inactive'
    },
    {
      id: 5,
      name: 'Claire Simon',
      email: 'claire.simon@email.com',
      phone: '+33 6 34 56 78 90',
      location: 'Toulouse, France',
      shopName: 'Artisan Créatif',
      avatar: 'https://ui-avatars.com/api/?name=Claire+Simon&background=ffbf00&color=1a1a1a&size=80',
      status: 'active'
    },
    {
      id: 6,
      name: 'Marc Laurent',
      email: 'marc.laurent@email.com',
      phone: '+33 6 56 78 90 12',
      location: 'Nantes, France',
      shopName: 'Gourmet Delice',
      avatar: 'https://ui-avatars.com/api/?name=Marc+Laurent&background=ffbf00&color=1a1a1a&size=80',
      status: 'active'
    },
    {
      id: 7,
      name: 'Anne Thomas',
      email: 'anne.thomas@email.com',
      phone: '+33 6 67 89 01 23',
      location: 'Strasbourg, France',
      shopName: 'Livre & Savoir',
      avatar: 'https://ui-avatars.com/api/?name=Anne+Thomas&background=ffbf00&color=1a1a1a&size=80',
      status: 'inactive'
    },
    {
      id: 8,
      name: 'David Blanc',
      email: 'david.blanc@email.com',
      phone: '+33 6 89 01 23 45',
      location: 'Nice, France',
      shopName: 'Sports & Co',
      avatar: 'https://ui-avatars.com/api/?name=David+Blanc&background=ffbf00&color=1a1a1a&size=80',
      status: 'active'
    },
    {
      id: 9,
      name: 'Sophie Lefevre',
      email: 'sophie.lefevre@email.com',
      phone: '+33 6 23 45 67 89',
      location: 'Lille, France',
      shopName: 'Bio & Nature',
      avatar: 'https://ui-avatars.com/api/?name=Sophie+Lefevre&background=ffbf00&color=1a1a1a&size=80',
      status: 'active'
    },
    {
      id: 10,
      name: 'Thomas Moreau',
      email: 'thomas.moreau@email.com',
      phone: '+33 6 45 67 89 01',
      location: 'Rennes, France',
      shopName: 'Tech Innov',
      avatar: 'https://ui-avatars.com/api/?name=Thomas+Moreau&background=ffbf00&color=1a1a1a&size=80',
      status: 'active'
    }
  ];

  filteredVendeurs: any[] = [];
  paginatedVendeurs: any[] = [];

  constructor(public themeService: ThemeService) {}

  ngOnInit() {
    this.filteredVendeurs = [...this.allVendeurs];
    this.updatePagination();
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
        vendeur.phone.includes(search)
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
    // Ici vous pouvez ouvrir une modale ou naviguer vers la page de détails
    alert(`Vendeur: ${vendeur.name}\nBoutique: ${vendeur.shopName}\nEmail: ${vendeur.email}\nTéléphone: ${vendeur.phone}\nAdresse: ${vendeur.location}`);
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