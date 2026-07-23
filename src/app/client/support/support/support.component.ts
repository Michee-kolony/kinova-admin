import { Component } from '@angular/core';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css']
})
export class SupportComponent {
  activeTab: string = 'conditions';

  tabs = [
    { id: 'conditions', label: 'Conditions d\'utilisation' },
    { id: 'confidentialite', label: 'Politique de confidentialité'},
    { id: 'cgu', label: 'CGU'},
    { id: 'cookies', label: 'Cookies'},
    { id: 'faq', label: 'FAQ'},
    { id: 'contact', label: 'Contact'},
    { id: 'deletecount', label: 'Supprimer mon compte'}
  ];
}