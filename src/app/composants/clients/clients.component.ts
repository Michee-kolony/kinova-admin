import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.css'
})
export class ClientsComponent implements OnInit {
  searchTerm: string = '';
  selectedGender: string = 'all';
  currentPage: number = 1;
  itemsPerPage: number = 9;
  Math = Math;

  // Liste complète des clients
  allClients = [
    {
      id: 1,
      name: 'Jean Dupont',
      email: 'jean.dupont@email.com',
      phone: '+33 6 12 34 56 78',
      location: 'Paris, France',
      gender: 'male',
      avatar: 'https://ui-avatars.com/api/?name=Jean+Dupont&background=ffbf00&color=1a1a1a&size=80',
      online: true,
      orders: 24,
      totalSpent: '2 450 €',
      joinDate: 'Jan 2024'
    },
    {
      id: 2,
      name: 'Sophie Leroy',
      email: 'sophie.leroy@email.com',
      phone: '+33 6 98 76 54 32',
      location: 'Lyon, France',
      gender: 'female',
      avatar: 'https://ui-avatars.com/api/?name=Sophie+Leroy&background=ffbf00&color=1a1a1a&size=80',
      online: false,
      orders: 18,
      totalSpent: '1 890 €',
      joinDate: 'Fév 2024'
    },
    {
      id: 3,
      name: 'Lucas Moreau',
      email: 'lucas.moreau@email.com',
      phone: '+33 6 45 67 89 01',
      location: 'Marseille, France',
      gender: 'male',
      avatar: 'https://ui-avatars.com/api/?name=Lucas+Moreau&background=ffbf00&color=1a1a1a&size=80',
      online: true,
      orders: 32,
      totalSpent: '3 200 €',
      joinDate: 'Déc 2023'
    },
    {
      id: 4,
      name: 'Emma Bernard',
      email: 'emma.bernard@email.com',
      phone: '+33 6 78 90 12 34',
      location: 'Toulouse, France',
      gender: 'female',
      avatar: 'https://ui-avatars.com/api/?name=Emma+Bernard&background=ffbf00&color=1a1a1a&size=80',
      online: true,
      orders: 15,
      totalSpent: '1 560 €',
      joinDate: 'Mar 2024'
    },
    {
      id: 5,
      name: 'Thomas David',
      email: 'thomas.david@email.com',
      phone: '+33 6 34 56 78 90',
      location: 'Nice, France',
      gender: 'male',
      avatar: 'https://ui-avatars.com/api/?name=Thomas+David&background=ffbf00&color=1a1a1a&size=80',
      online: false,
      orders: 8,
      totalSpent: '980 €',
      joinDate: 'Avr 2024'
    },
    {
      id: 6,
      name: 'Laura Michel',
      email: 'laura.michel@email.com',
      phone: '+33 6 56 78 90 12',
      location: 'Nantes, France',
      gender: 'female',
      avatar: 'https://ui-avatars.com/api/?name=Laura+Michel&background=ffbf00&color=1a1a1a&size=80',
      online: true,
      orders: 42,
      totalSpent: '4 250 €',
      joinDate: 'Nov 2023'
    },
    {
      id: 7,
      name: 'Nicolas Petit',
      email: 'nicolas.petit@email.com',
      phone: '+33 6 67 89 01 23',
      location: 'Strasbourg, France',
      gender: 'male',
      avatar: 'https://ui-avatars.com/api/?name=Nicolas+Petit&background=ffbf00&color=1a1a1a&size=80',
      online: false,
      orders: 12,
      totalSpent: '1 340 €',
      joinDate: 'Mai 2024'
    },
    {
      id: 8,
      name: 'Camille Roux',
      email: 'camille.roux@email.com',
      phone: '+33 6 89 01 23 45',
      location: 'Bordeaux, France',
      gender: 'female',
      avatar: 'https://ui-avatars.com/api/?name=Camille+Roux&background=ffbf00&color=1a1a1a&size=80',
      online: true,
      orders: 27,
      totalSpent: '2 780 €',
      joinDate: 'Fév 2024'
    },
    {
      id: 9,
      name: 'Pierre Durand',
      email: 'pierre.durand@email.com',
      phone: '+33 6 12 34 56 78',
      location: 'Lille, France',
      gender: 'male',
      avatar: 'https://ui-avatars.com/api/?name=Pierre+Durand&background=ffbf00&color=1a1a1a&size=80',
      online: true,
      orders: 6,
      totalSpent: '890 €',
      joinDate: 'Juin 2024'
    },
    {
      id: 10,
      name: 'Julie Petit',
      email: 'julie.petit@email.com',
      phone: '+33 6 98 76 54 32',
      location: 'Rennes, France',
      gender: 'female',
      avatar: 'https://ui-avatars.com/api/?name=Julie+Petit&background=ffbf00&color=1a1a1a&size=80',
      online: false,
      orders: 9,
      totalSpent: '1 100 €',
      joinDate: 'Juil 2024'
    },
    {
      id: 11,
      name: 'Paul Robert',
      email: 'paul.robert@email.com',
      phone: '+33 6 45 67 89 01',
      location: 'Reims, France',
      gender: 'male',
      avatar: 'https://ui-avatars.com/api/?name=Paul+Robert&background=ffbf00&color=1a1a1a&size=80',
      online: true,
      orders: 19,
      totalSpent: '2 150 €',
      joinDate: 'Aou 2024'
    },
    {
      id: 12,
      name: 'Claire Simon',
      email: 'claire.simon@email.com',
      phone: '+33 6 78 90 12 34',
      location: 'Le Havre, France',
      gender: 'female',
      avatar: 'https://ui-avatars.com/api/?name=Claire+Simon&background=ffbf00&color=1a1a1a&size=80',
      online: true,
      orders: 35,
      totalSpent: '3 450 €',
      joinDate: 'Sep 2024'
    }
  ];

  filteredClients: any[] = [];
  paginatedClients: any[] = [];

  constructor(public themeService: ThemeService) {}

  ngOnInit() {
    this.filteredClients = [...this.allClients];
    this.updatePagination();
  }

  filterClients() {
    const search = this.searchTerm.toLowerCase().trim();
    
    if (!search) {
      this.filteredClients = [...this.allClients];
    } else {
      this.filteredClients = this.allClients.filter(client =>
        client.name.toLowerCase().includes(search) ||
        client.email.toLowerCase().includes(search) ||
        client.phone.includes(search)
      );
    }

    // Appliquer le filtre de genre si actif
    if (this.selectedGender !== 'all') {
      this.filteredClients = this.filteredClients.filter(
        client => client.gender === this.selectedGender
      );
    }

    this.currentPage = 1;
    this.updatePagination();
  }

  filterByGender(gender: string) {
    this.selectedGender = gender;
    this.filterClients();
  }

  clearSearch() {
    this.searchTerm = '';
    this.filterClients();
  }

  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedClients = this.filteredClients.slice(startIndex, endIndex);
  }

  changePage(page: number) {
    if (page < 1 || page > this.getTotalPages()) return;
    this.currentPage = page;
    this.updatePagination();
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredClients.length / this.itemsPerPage);
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
          pages.splice(1, 0, -1); // ...
        }
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push(-1); // ...
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  }
}