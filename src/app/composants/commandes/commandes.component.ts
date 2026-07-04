import { Component } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-commandes',
  templateUrl: './commandes.component.html',
  styleUrl: './commandes.component.css'
})
export class CommandesComponent {
  constructor(public themeService: ThemeService) {}

  // Données des commandes
  orders = [
    {
      id: 1,
      client: 'Jean Dupont',
      clientAvatar: 'https://ui-avatars.com/api/?name=Jean+Dupont&background=ffbf00&color=1a1a1a&size=32',
      product: 'iPhone 15 Pro Max',
      productImage: 'https://picsum.photos/seed/1/40/40',
      price: '1 299,99 €',
      vendor: 'Marie Martin',
      vendorAvatar: 'https://ui-avatars.com/api/?name=Marie+Martin&background=ffbf00&color=1a1a1a&size=24',
      status: 'Livrée',
      statusClass: 'delivered',
      date: '15/01/2024'
    },
    // ... plus de commandes
  ];
}