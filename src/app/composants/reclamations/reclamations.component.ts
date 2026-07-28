import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reclamations',
  templateUrl: './reclamations.component.html',
  styleUrl: './reclamations.component.css'
})
export class ReclamationsComponent implements OnInit {

  private urlMessages = "https://kinova-backend.tech/messages";

  reclamations: any[] = [];
  selectedMessage: any = null;
  
  // Variables pour la modale
  showModal: boolean = false;
  messageToDelete: any = null;
  isDeleting: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.chargerMessages();
  }

  chargerMessages() {
    this.http.get(this.urlMessages).subscribe({
      next: (data: any) => {
        // Trier les messages par date décroissante (du plus récent au plus ancien)
        this.reclamations = data.sort((a: any, b: any) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        if (this.reclamations.length > 0) {
          this.selectedMessage = this.reclamations[0];
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des messages:', error);
      }
    });
  }

  ouvrirMessage(message: any) {
    this.selectedMessage = message;
  }

  getInitiales(nom: string): string {
    if (!nom) return '';
    return nom
      .split(' ')
      .map(m => m.charAt(0))
      .join('')
      .toUpperCase();
  }

  // Ouvrir la modale de confirmation
  ouvrirModalSuppression(message: any) {
    this.messageToDelete = message;
    this.showModal = true;
    this.isDeleting = false;
  }

  // Fermer la modale
  fermerModal() {
    this.showModal = false;
    this.messageToDelete = null;
    this.isDeleting = false;
  }

  // Confirmer la suppression
  confirmerSuppression() {
    if (!this.messageToDelete) return;
    
    this.isDeleting = true;
    const id = this.messageToDelete._id;

    this.http.delete(`${this.urlMessages}/${id}`).subscribe({
      next: () => {
        // Filtrer le message supprimé
        this.reclamations = this.reclamations.filter(m => m._id !== id);
        
        // Re-trier la liste après suppression
        this.reclamations.sort((a: any, b: any) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        // Sélectionner le premier message ou null si liste vide
        if (this.reclamations.length > 0) {
          this.selectedMessage = this.reclamations[0];
        } else {
          this.selectedMessage = null;
        }
        
        // Fermer la modale
        this.fermerModal();
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.isDeleting = false;
        alert('Une erreur est survenue lors de la suppression. Veuillez réessayer.');
      }
    });
  }

  formaterDate(date: string): string {
    if (!date) return '';
    const dateObj = new Date(date);
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Aujourd'hui - ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
    } else if (diffDays === 1) {
      return `Hier - ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
    } else {
      const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
      return dateObj.toLocaleDateString('fr-FR', options);
    }
  }
}