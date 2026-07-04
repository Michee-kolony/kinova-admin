import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginData = {
    email: '',
    password: ''
  };
  rememberMe = false;
  showPassword = false;

  constructor(
    private router: Router,
    public themeService: ThemeService
  ) {}

  onSubmit() {
    console.log('Tentative de connexion:', this.loginData);
    // Ici vous pouvez appeler votre service d'authentification
    // Simuler une connexion réussie
    if (this.loginData.email && this.loginData.password) {
      // Rediriger vers le dashboard
      this.router.navigate(['/admin/dashboard']);
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}