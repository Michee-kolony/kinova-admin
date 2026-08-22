import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Payout {
  _id?: string;
  vendeurId: any;
  commandeId: any;
  numeroCommande: string;
  payoutId: string;
  providerTransactionId?: string | null;
  montant: number;
  devise: string;
  telephone: string;
  vendeurTelephone?: string;
  operateur: string;
  statut: string;
  pawapayStatus?: string | null;
  failureReason?: string | null;
  datePaiement?: string | null;
  createdAt?: string;
  updatedAt?: string;
  articles?: { nomArticle: string; quantite: number }[];
  vendeurNom?: string;
  vendeurEmail?: string;
  commandeNumero?: string;
  nombreArticles?: number;
}

@Component({
  selector: 'app-historique-transaction',
  templateUrl: './historique-transaction.component.html',
  styleUrl: './historique-transaction.component.css'
})
export class HistoriqueTransactionComponent implements OnInit {
  private readonly urlPayout = 'https://kinova-backend.tech/payout/';

  payouts: Payout[] = [];
  payoutsFiltres: Payout[] = [];
  recherche = '';
  chargement = false;
  erreur = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.chargerPayouts();
  }

  chargerPayouts(): void {
    this.chargement = true;
    this.erreur = '';

    this.http.get<any>(this.urlPayout).subscribe({
      next: (response) => {
        const liste = Array.isArray(response) ? response : response?.payouts || [];
        this.payouts = liste.map((payout: Payout) => this.normaliserPayout(payout));
        this.payouts.sort((a, b) => this.datePayout(b) - this.datePayout(a));
        this.filtrerPayouts();
        this.chargement = false;
      },
      error: (error) => {
        console.error('Erreur récupération payouts :', error);
        this.erreur = error?.error?.message || 'Impossible de récupérer les historiques de transaction.';
        this.chargement = false;
      }
    });
  }

  private normaliserPayout(payout: Payout): Payout {
    const vendeur = payout.vendeurId && typeof payout.vendeurId === 'object' ? payout.vendeurId : null;
    const commande = payout.commandeId && typeof payout.commandeId === 'object' ? payout.commandeId : null;
    const articles = Array.isArray(payout.articles) ? payout.articles : [];

    return {
      ...payout,
      vendeurNom: vendeur?.storeName || vendeur?.email || payout.vendeurId || 'Vendeur inconnu',
      vendeurEmail: vendeur?.email || '',
      commandeNumero: commande?.numeroCommande || payout.numeroCommande || '-',
      nombreArticles: articles.length,
      articles
    };
  }

  private datePayout(payout: Payout): number {
    return new Date(payout.datePaiement || payout.updatedAt || payout.createdAt || 0).getTime() || 0;
  }

  filtrerPayouts(): void {
    const recherche = this.recherche.trim().toLowerCase();
    if (!recherche) {
      this.payoutsFiltres = [...this.payouts];
      return;
    }

    this.payoutsFiltres = this.payouts.filter((payout) => {
      const texte = [
        payout.numeroCommande, payout.commandeNumero, payout.payoutId,
        payout.providerTransactionId, payout.vendeurNom, payout.vendeurEmail,
        payout.vendeurTelephone, payout.telephone, payout.operateur,
        payout.statut, payout.pawapayStatus, payout.montant?.toString(), payout.devise,
        ...(payout.articles || []).map((article) => article.nomArticle)
      ].filter(Boolean).join(' ').toLowerCase();
      return texte.includes(recherche);
    });
  }

  isCompleted(payout: Payout): boolean {
    return ['COMPLETED', 'SUCCESS', 'SUCCEEDED'].includes((payout.pawapayStatus || payout.statut || '').toUpperCase());
  }

  isFailed(payout: Payout): boolean {
    return ['FAILED', 'REJECTED', 'CANCELLED'].includes((payout.pawapayStatus || payout.statut || '').toUpperCase());
  }

  isAccepted(payout: Payout): boolean {
    return !this.isCompleted(payout) && !this.isFailed(payout);
  }

  formatDate(date?: string | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  trackByPayout(index: number, payout: Payout): string | number {
    return payout._id || payout.payoutId || index;
  }
}
