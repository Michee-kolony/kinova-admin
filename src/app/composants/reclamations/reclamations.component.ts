import { Component } from '@angular/core';

@Component({
  selector: 'app-reclamations',
  templateUrl: './reclamations.component.html',
  styleUrl: './reclamations.component.css'
})
export class ReclamationsComponent {

  reclamations = [
    {
      id: 1,
      nom: 'Jean Dupont',
      email: 'jean@gmail.com',
      sujet: 'Problème de commande',
      message: `Bonjour,

Je n'ai toujours pas reçu ma commande passée il y a une semaine.

Merci de vérifier.

Cordialement.`,
      date: 'Aujourd\'hui - 09:30'
    },
    {
      id: 2,
      nom: 'Sarah Mukendi',
      email: 'sarah@gmail.com',
      sujet: 'Paiement refusé',
      message: `Bonsoir,

Mon paiement est refusé malgré plusieurs tentatives.

Merci pour votre aide.`,
      date: 'Hier - 16:40'
    },
    {
      id: 3,
      nom: 'Patrick Ilunga',
      email: 'patrick@gmail.com',
      sujet: 'Suggestion',
      message: `Bonjour,

Votre plateforme est très belle.

J'aimerais voir une version mobile avec plus de fonctionnalités.

Merci.`,
      date: '03 Juillet'
    },
    {
      id: 4,
      nom: 'Grâce Mbala',
      email: 'grace@gmail.com',
      sujet: 'Compte bloqué',
      message: `Bonjour,

Je ne peux plus accéder à mon compte depuis ce matin.

Pouvez-vous m'aider ?

Merci.`,
      date: '02 Juillet'
    }
  ];

  selectedMessage = this.reclamations[0];

  ouvrirMessage(message: any) {
    this.selectedMessage = message;
  }

  getInitiales(nom: string): string {
    return nom
      .split(' ')
      .map(m => m.charAt(0))
      .join('')
      .toUpperCase();
  }

}