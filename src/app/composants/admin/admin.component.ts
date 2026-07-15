// admin.component.ts
import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  sidebarOpen = false;
  private isBrowser: boolean;

  // Ajoutez ces propriétés
  userName: string = '';
  userEmail: string = '';
  userInitial: string = '';

  constructor(
    public themeService: ThemeService,
    @Inject(PLATFORM_ID) platformId: Object,
    private router : Router,
    private http: HttpClient
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Appliquer le thème au chargement
    if (this.isBrowser) {
      this.applyTheme();
      this.loadUserData(); // Chargez les données utilisateur
    }
  }


  private loadUserData() {
  if (!this.isBrowser) return;
  
  try {
    // Récupérer les données utilisateur
    const userDataString = localStorage.getItem('user_data');
    
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      
      // Récupérer le nom et l'email (adaptez selon votre structure de données)
      this.userName = userData.name || userData.username || 'Utilisateur';
      this.userEmail = userData.email || '';
      
      // Générer l'initiale
      this.userInitial = this.generateInitial(this.userName);
    } else {
      // Si pas de données, valeurs par défaut
      this.userName = 'Invité';
      this.userEmail = '';
      this.userInitial = '?';
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données utilisateur:', error);
    this.userName = 'Invité';
    this.userEmail = '';
    this.userInitial = '?';
  }
}

private generateInitial(name: string): string {
  if (!name) return '?';
  
  // Prendre la première lettre du nom
  const initial = name.charAt(0).toUpperCase();
  
  // Si le nom a plusieurs parties, prendre la première lettre de la première partie
  const parts = name.trim().split(' ');
  if (parts.length > 1) {
    // Prendre la première lettre du prénom et du nom
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  
  return initial;
}

sendNotification(){

  const url = "https://backend-kinova.onrender.com/notification/test";

  this.http.get(url).subscribe({

    next: (response:any)=>{

      console.log("Notification envoyée :", response);

      alert("Notification envoyée avec succès 🔔");

    },

    error:(error)=>{

      console.error("Erreur envoi notification :", error);

      alert("Erreur lors de l'envoi de la notification");

    }

  });

}

  toggleTheme() {
    this.themeService.toggleTheme();
    this.applyTheme();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    this.updateBodyOverflow();
  }

  closeSidebar() {
    this.sidebarOpen = false;
    this.updateBodyOverflow();
  }

  private applyTheme() {
    if (!this.isBrowser) return;
    
    const isDark = this.themeService.isDark();
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  }

  private updateBodyOverflow() {
    if (!this.isBrowser) return;
    
    if (this.sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  // Fermer la sidebar avec ESC
  @HostListener('document:keydown.escape')
  onEscapePress() {
    if (this.sidebarOpen) {
      this.closeSidebar();
    }
  }

  // Gérer le redimensionnement
  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth >= 768 && this.sidebarOpen) {
      this.closeSidebar();
    }
  }


  logout() {
  // Supprimer les données de connexion
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');

  // Redirection vers la page de connexion
  this.router.navigate(['/login']);
}

}