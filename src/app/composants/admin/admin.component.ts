// admin.component.ts
import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  sidebarOpen = false;
  private isBrowser: boolean;

  constructor(
    public themeService: ThemeService,
    @Inject(PLATFORM_ID) platformId: Object,
    private router : Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Appliquer le thème au chargement
    if (this.isBrowser) {
      this.applyTheme();
    }
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