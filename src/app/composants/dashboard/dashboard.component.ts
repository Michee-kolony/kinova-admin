import { Component } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  today: Date = new Date();

  constructor(public themeService: ThemeService) {}

  // Données fictives pour les statistiques
  stats = {
    clients: 1284,
    vendeurs: 342,
    articles: 2847,
    mesArticles: 124,
    reclamations: 18,
    commandes: 1563
  };

  // Données des commandes récentes
  recentOrders = [
    {
      id: 1,
      product: 'iPhone 15 Pro Max',
      price: '1 299,99 €',
      image: 'https://picsum.photos/seed/1/60/60',
      status: 'Livrée',
      statusClass: 'delivered'
    },
    {
      id: 2,
      product: 'MacBook Pro 16"',
      price: '2 499,00 €',
      image: 'https://picsum.photos/seed/2/60/60',
      status: 'En traitement',
      statusClass: 'processing'
    },
    {
      id: 3,
      product: 'Samsung Galaxy S24 Ultra',
      price: '1 399,00 €',
      image: 'https://picsum.photos/seed/3/60/60',
      status: 'En attente',
      statusClass: 'pending'
    },
    {
      id: 4,
      product: 'AirPods Pro 2',
      price: '279,00 €',
      image: 'https://picsum.photos/seed/4/60/60',
      status: 'Livrée',
      statusClass: 'delivered'
    },
    {
      id: 5,
      product: 'iPad Pro 12.9"',
      price: '1 199,00 €',
      image: 'https://picsum.photos/seed/5/60/60',
      status: 'Expédiée',
      statusClass: 'shipped'
    },
    {
      id: 6,
      product: 'Apple Watch Series 9',
      price: '449,00 €',
      image: 'https://picsum.photos/seed/6/60/60',
      status: 'En traitement',
      statusClass: 'processing'
    },
    {
      id: 7,
      product: 'Dell XPS 13"',
      price: '1 899,00 €',
      image: 'https://picsum.photos/seed/7/60/60',
      status: 'En attente',
      statusClass: 'pending'
    },
    {
      id: 8,
      product: 'Sony WH-1000XM5',
      price: '399,00 €',
      image: 'https://picsum.photos/seed/8/60/60',
      status: 'Livrée',
      statusClass: 'delivered'
    },
    {
      id: 9,
      product: 'Canon EOS R6',
      price: '2 699,00 €',
      image: 'https://picsum.photos/seed/9/60/60',
      status: 'Expédiée',
      statusClass: 'shipped'
    },
    {
      id: 10,
      product: 'Nintendo Switch OLED',
      price: '349,00 €',
      image: 'https://picsum.photos/seed/10/60/60',
      status: 'En attente',
      statusClass: 'pending'
    }
  ];
}