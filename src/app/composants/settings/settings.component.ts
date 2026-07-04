import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {

  // Exemple de données pour les administrateurs
  administrateurs = [
    {
      id: 1,
      nom: 'Jean Dupont',
      email: 'jean.dupont@exemple.com',
      telephone: '+221 77 123 45 67',
      role: 'Super Admin',
      date_creation: '12/06/2026'
    },
    // ... autres données
  ];

  // Méthode pour supprimer un administrateur
  supprimerAdministrateur(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet administrateur ?')) {
      // Logique de suppression
      console.log('Supprimer l\'administrateur ID:', id);
    }
  }

  // Méthode pour créer un administrateur
  creerAdministrateur(formData: any) {
    console.log('Créer un administrateur:', formData);
  }

}