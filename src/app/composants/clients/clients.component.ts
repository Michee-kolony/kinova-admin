// clients.component.ts
import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { HttpClient } from '@angular/common/http';

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
  
  // URL de l'API
  private apiUrl = 'https://backend-kinova.onrender.com/client';

  // Données réelles provenant du backend
  allClients: any[] = [];
  filteredClients: any[] = [];
  paginatedClients: any[] = [];

  // Statistiques
  totalClients: number = 0;
  maleCount: number = 0;
  femaleCount: number = 0;

  // États de chargement
  loading: boolean = false;
  error: string | null = null;

  constructor(
    public themeService: ThemeService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.loading = true;
    this.error = null;
    
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (clients) => {
        // Transformer les données du backend pour correspondre à votre affichage
        this.allClients = this.transformClients(clients);
        this.updateStatistics();
        this.filteredClients = [...this.allClients];
        this.updatePagination();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des clients:', error);
        this.error = 'Impossible de charger les clients. Veuillez réessayer.';
        this.loading = false;
        // En cas d'erreur, on garde les données mockées pour le développement
        this.loadMockData();
      }
    });
  }

  // Transformer les données du backend pour l'affichage
  transformClients(clients: any[]): any[] {
    return clients.map((client, index) => ({
      ...client,
      // Générer un avatar basé sur le nom
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=ffbf00&color=1a1a1a&size=80`,
      // Simuler le statut en ligne (alternance)
      online: index % 2 === 0,
      // Générer des données simulées pour les commandes
      orders: Math.floor(Math.random() * 50) + 1,
      totalSpent: `${(Math.floor(Math.random() * 50) + 1) * 100} €`,
      joinDate: this.formatDate(client.date),
      // Extraire la ville de l'email ou utiliser une valeur par défaut
      location: this.extractLocation(client.email),
      // Standardiser le genre pour le filtrage
      gender: this.standardizeGender(client.genre)
    }));
  }

  // Standardiser le genre
  standardizeGender(genre: string): string {
    if (genre === 'Homme' || genre === 'male' || genre === 'M') {
      return 'male';
    } else if (genre === 'Femme' || genre === 'female' || genre === 'F') {
      return 'female';
    }
    return 'other';
  }

  // Extraire une localisation à partir de l'email
  extractLocation(email: string): string {
    const domains: { [key: string]: string } = {
      'gmail.com': 'International',
      'yahoo.com': 'International',
      'outlook.com': 'International',
      'hotmail.com': 'International'
    };
    
    try {
      const domain = email.split('@')[1];
      return domains[domain] || 'Congo, RDC';
    } catch {
      return 'Congo, RDC';
    }
  }

  // Formater la date
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'Déc'];
      return `${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch {
      return 'N/A';
    }
  }

  // Mettre à jour les statistiques
  updateStatistics() {
    this.totalClients = this.allClients.length;
    this.maleCount = this.allClients.filter(c => c.gender === 'male').length;
    this.femaleCount = this.allClients.filter(c => c.gender === 'female').length;
  }

  // Données mockées en cas d'erreur
  loadMockData() {
    const mockClients = [
      {
        id: 1,
        name: 'Jean Dupont',
        email: 'jean.dupont@email.com',
        telephone: '+33 6 12 34 56 78',
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
        telephone: '+33 6 98 76 54 32',
        location: 'Lyon, France',
        gender: 'female',
        avatar: 'https://ui-avatars.com/api/?name=Sophie+Leroy&background=ffbf00&color=1a1a1a&size=80',
        online: false,
        orders: 18,
        totalSpent: '1 890 €',
        joinDate: 'Fév 2024'
      }
    ];
    this.allClients = mockClients;
    this.updateStatistics();
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
        (client.telephone && client.telephone.includes(search))
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

  // Rafraîchir les données
  refreshClients() {
    this.loadClients();
  }
}