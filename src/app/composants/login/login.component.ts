import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnDestroy {

  private url = "https://backend-kinova.onrender.com/auth/login";

  loginData = {
    email: 'admin@gmail.com',
    password: ''
  };
  rememberMe = false;
  showPassword = false;
  isLoading = false;
  
  // Pour les toasts
  toast: { type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string } | null = null;
  private toastTimeout: any;
  private subscription?: Subscription;

  constructor(
    private router: Router,
    public themeService: ThemeService,
    private http: HttpClient
  ) {}

  onSubmit() {
    // Validation des champs
    if (!this.loginData.email || !this.loginData.password) {
      this.showToast('error', 'Veuillez remplir tous les champs', 'Erreur');
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.loginData.email)) {
      this.showToast('error', 'Veuillez entrer une adresse email valide', 'Erreur');
      return;
    }

    this.isLoading = true;
    this.clearToast();

    this.subscription = this.http.post<any>(this.url, this.loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        // Stocker les données utilisateur
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user_data', JSON.stringify(response));
        }

        this.showToast('success', `Bienvenue ${response.name || 'Administrateur'} !`, 'Connexion réussie');
        
        // Rediriger après un court délai pour voir le toast
        setTimeout(() => {
          this.router.navigate(['/admin/dashboard']);
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        let errorMessage = 'Une erreur est survenue lors de la connexion';
        
        if (error.status === 401) {
          errorMessage = 'Email ou mot de passe incorrect';
        } else if (error.status === 0) {
          errorMessage = 'Impossible de se connecter au serveur';
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        
        this.showToast('error', errorMessage, 'Erreur');
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  showToast(type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string) {
    this.toast = { type, message, title };
    
    // Auto-suppression après 5 secondes
    this.clearToastTimeout();
    this.toastTimeout = setTimeout(() => {
      this.clearToast();
    }, 5000);
  }

  clearToast() {
    this.toast = null;
    this.clearToastTimeout();
  }

  private clearToastTimeout() {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      this.toastTimeout = null;
    }
  }

  ngOnDestroy() {
    this.clearToastTimeout();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}