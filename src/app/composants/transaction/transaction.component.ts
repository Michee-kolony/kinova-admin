import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// =====================================================
// VENDEUR
// Correspond à ton model Mongoose Vendeur
// =====================================================

interface Vendeur {

  _id?: string;

  email?: string;

  storeName?: string;

  storeCategory?: string;

  phoneNumber?: string;

  address?: string;

  paymentMethod?: string;

  mobileMoneyNumber?: string;

  paymentCustomerId?: string;

  paymentMethodId?: string;

  status?: string;

  isVerified?: boolean;

}


// =====================================================
// ARTICLE PAYOUT
// =====================================================

interface ArticlePayout {

  articleId: string;

  nomArticle: string;

  quantite: number;

  prixUnitaire: number;

  montant: number;

  _id?: string;

}


// =====================================================
// COMMANDE POPULÉE
// =====================================================

interface CommandePayout {

  _id?: string;

  numeroCommande?: string;

}


// =====================================================
// PAYOUT
// =====================================================

interface Payout {

  _id?: string;

  vendeurId: string | Vendeur;

  commandeId:
    string |
    CommandePayout;

  numeroCommande: string;

  articles: ArticlePayout[];

  payoutId: string;

  providerTransactionId?: string | null;

  montant: number;

  devise: string;

  telephone: string;

  operateur: string;

  statut: string;

  effectuePar?: any;

  datePaiement?: string | null;

  pawapayStatus?: string | null;

  failureReason?: string | null;

  createdAt?: string;

  updatedAt?: string;

}


// =====================================================
// PAYOUT POUR AFFICHAGE
// =====================================================

interface PayoutAffichage
  extends Payout {

  vendeurNom: string;

  vendeurEmail: string;

  vendeurTelephone: string;

  commandeNumero: string;

  nombreArticles: number;

}


// =====================================================
// COMPONENT
// =====================================================

@Component({

  selector: 'app-transaction',

  templateUrl: './transaction.component.html',

  styleUrl: './transaction.component.css'

})
export class TransactionComponent
  implements OnInit {


  // =====================================================
  // URL API
  // =====================================================

  private urlPayout =
    'https://kinova-backend.tech/payout/';


  // =====================================================
  // DONNÉES
  // =====================================================

  payouts: PayoutAffichage[] = [];

  payoutsFiltres: PayoutAffichage[] = [];


  // =====================================================
  // RECHERCHE
  // =====================================================

  recherche = '';


  // =====================================================
  // ÉTAT
  // =====================================================

  chargement = false;

  erreur = '';

  messageSucces = '';


  // =====================================================
  // FORMULAIRE
  // =====================================================

  payoutForm = {

    vendeurId: '',

    numeroCommande: '',

    telephone: '',

    operateur: 'VODACOM_MPESA_COD'

  };


  // =====================================================
  // CONSTRUCTEUR
  // =====================================================

  constructor(
    private http: HttpClient
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.chargerPayouts();

  }


  // =====================================================
  // RÉCUPÉRER TOUS LES PAYOUTS
  // =====================================================

  chargerPayouts(): void {

    this.chargement = true;

    this.erreur = '';


    this.http
      .get<any>(this.urlPayout)
      .subscribe({

        next: (response) => {

          console.log(
            'PAYOUTS API :',
            response
          );


          const liste: Payout[] =
            Array.isArray(response)
              ? response
              : response?.payouts || [];


          // =============================================
          // NORMALISER
          // =============================================

          this.payouts =
            liste.map(
              (payout: Payout) =>
                this.normaliserPayout(payout)
            );


          // =============================================
          // PLUS RÉCENT EN PREMIER
          // =============================================

          this.trierPayouts();


          // =============================================
          // RECHERCHE
          // =============================================

          this.filtrerPayouts();


          this.chargement = false;

        },


        error: (error) => {

          console.error(
            'Erreur récupération payouts :',
            error
          );


          this.erreur =
            error?.error?.message ||
            'Impossible de récupérer les historiques de payout.';


          this.chargement = false;

        }

      });

  }


  // =====================================================
  // NORMALISER UN PAYOUT
  // =====================================================

  private normaliserPayout(
    payout: Payout
  ): PayoutAffichage {


    // =============================================
    // VENDEUR
    // =============================================

    let vendeurNom =
      'Vendeur inconnu';

    let vendeurEmail =
      '';

    let vendeurTelephone =
      '';


    // =============================================
    // VENDEUR POPULÉ
    // =============================================

    if (
      typeof payout.vendeurId === 'object' &&
      payout.vendeurId !== null
    ) {

      const vendeur =
        payout.vendeurId as Vendeur;


      // -----------------------------------------
      // NOM DE BOUTIQUE
      // -----------------------------------------

      if (vendeur.storeName) {

        vendeurNom =
          vendeur.storeName;

      }

      // -----------------------------------------
      // SINON EMAIL
      // -----------------------------------------

      else if (vendeur.email) {

        vendeurNom =
          vendeur.email;

      }


      // -----------------------------------------
      // EMAIL
      // -----------------------------------------

      vendeurEmail =
        vendeur.email || '';


      // -----------------------------------------
      // TÉLÉPHONE VENDEUR
      // -----------------------------------------

      vendeurTelephone =
        vendeur.phoneNumber || '';

    }


    // =============================================
    // VENDEUR NON POPULÉ
    // =============================================

    else if (
      typeof payout.vendeurId === 'string'
    ) {

      vendeurNom =
        payout.vendeurId;

    }


    // =============================================
    // COMMANDE
    // =============================================

    let commandeNumero =
      payout.numeroCommande || '-';


    if (
      typeof payout.commandeId === 'object' &&
      payout.commandeId !== null
    ) {

      commandeNumero =
        payout.commandeId.numeroCommande
        ||
        payout.numeroCommande
        ||
        '-';

    }


    // =============================================
    // ARTICLES
    // =============================================

    const articles =
      Array.isArray(payout.articles)
        ? payout.articles
        : [];


    // =============================================
    // RETOUR
    // =============================================

    return {

      ...payout,

      vendeurNom,

      vendeurEmail,

      vendeurTelephone,

      commandeNumero,

      nombreArticles:
        articles.length

    };

  }


  // =====================================================
  // TRIER LES PAYOUTS
  // =====================================================

  private trierPayouts(): void {

    this.payouts.sort(
      (a, b) => {

        const dateA =
          new Date(
            a.datePaiement
            ||
            a.updatedAt
            ||
            a.createdAt
            ||
            0
          ).getTime();


        const dateB =
          new Date(
            b.datePaiement
            ||
            b.updatedAt
            ||
            b.createdAt
            ||
            0
          ).getTime();


        return dateB - dateA;

      }
    );

  }


  // =====================================================
  // RECHERCHE
  // =====================================================

  filtrerPayouts(): void {

    const recherche =
      this.recherche
        .trim()
        .toLowerCase();


    // =============================================
    // AUCUNE RECHERCHE
    // =============================================

    if (!recherche) {

      this.payoutsFiltres =
        [...this.payouts];

      return;

    }


    // =============================================
    // FILTRER
    // =============================================

    this.payoutsFiltres =
      this.payouts.filter(
        (payout) => {


          const texte = [

            // Commande
            payout.numeroCommande,

            payout.commandeNumero,

            // Payout
            payout.payoutId,

            payout.providerTransactionId,

            // Vendeur
            payout.vendeurNom,

            payout.vendeurEmail,

            payout.vendeurTelephone,

            // Téléphone payout
            payout.telephone,

            // Opérateur
            payout.operateur,

            // Statut
            payout.statut,

            payout.pawapayStatus,

            // Montant
            payout.montant?.toString(),

            payout.devise,

            // Articles
            ...(payout.articles || [])
              .map(
                article =>
                  article.nomArticle
              )

          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();


          return texte.includes(
            recherche
          );

        }
      );

  }


  // =====================================================
  // CHANGEMENT RECHERCHE
  // =====================================================

  onRechercheChange(): void {

    this.filtrerPayouts();

  }


  // =====================================================
  // EFFECTUER PAYOUT
  // =====================================================

  effectuerPayout(): void {

    this.erreur = '';

    this.messageSucces = '';


    // =============================================
    // VALIDATION
    // =============================================

    if (
      !this.payoutForm.vendeurId.trim()
    ) {

      this.erreur =
        'Le vendeur est obligatoire.';

      return;

    }


    if (
      !this.payoutForm.numeroCommande.trim()
    ) {

      this.erreur =
        'Le numéro de commande est obligatoire.';

      return;

    }


    if (
      !this.payoutForm.telephone.trim()
    ) {

      this.erreur =
        'Le numéro de téléphone est obligatoire.';

      return;

    }


    if (
      !this.payoutForm.operateur
    ) {

      this.erreur =
        'L’opérateur est obligatoire.';

      return;

    }


    this.chargement = true;


    // =============================================
    // PAYLOAD
    // =============================================

    const payload = {

      vendeurId:
        this.payoutForm.vendeurId.trim(),

      numeroCommande:
        this.payoutForm.numeroCommande.trim(),

      telephone:
        this.payoutForm.telephone.trim(),

      operateur:
        this.payoutForm.operateur

    };


    console.log(
      'PAYLOAD PAYOUT :',
      payload
    );


    // =============================================
    // ENVOYER
    // =============================================

    this.http
      .post<any>(
        `${this.urlPayout}vendeur`,
        payload
      )
      .subscribe({

        next: (response) => {

          console.log(
            'PAYOUT EFFECTUÉ :',
            response
          );


          this.messageSucces =
            'Le payout a été envoyé avec succès.';


          this.chargement = false;


          // ===========================================
          // RESET FORMULAIRE
          // ===========================================

          this.payoutForm = {

            vendeurId: '',

            numeroCommande: '',

            telephone: '',

            operateur:
              'VODACOM_MPESA_COD'

          };


          // ===========================================
          // RECHARGER HISTORIQUE
          // ===========================================

          this.chargerPayouts();

        },


        error: (error) => {

          console.error(
            'Erreur payout :',
            error
          );


          this.chargement = false;


          this.erreur =
            error?.error?.message
            ||
            'Une erreur est survenue lors du payout.';

        }

      });

  }


  // =====================================================
  // COMPLETED
  // =====================================================

  isCompleted(
    payout: PayoutAffichage
  ): boolean {

    return (

      payout.statut === 'COMPLETED'

      ||

      payout.pawapayStatus === 'COMPLETED'

    );

  }


  // =====================================================
  // ACCEPTED
  // =====================================================

  isAccepted(
    payout: PayoutAffichage
  ): boolean {

    return (

      payout.statut === 'ACCEPTED'

      ||

      payout.pawapayStatus === 'ACCEPTED'

    );

  }


  // =====================================================
  // FAILED
  // =====================================================

  isFailed(
    payout: PayoutAffichage
  ): boolean {

    return (

      payout.statut === 'FAILED'

      ||

      payout.pawapayStatus === 'FAILED'

    );

  }


  // =====================================================
  // STATUT
  // =====================================================

  getStatut(
    payout: PayoutAffichage
  ): string {

    return (

      payout.statut

      ||

      payout.pawapayStatus

      ||

      'INCONNU'

    );

  }


  // =====================================================
  // DATE
  // =====================================================

  formatDate(
    date?: string | null
  ): string {

    if (!date) {

      return '-';

    }


    const valeur =
      new Date(date);


    if (
      isNaN(
        valeur.getTime()
      )
    ) {

      return '-';

    }


    return valeur.toLocaleString(
      'fr-FR',
      {

        day: '2-digit',

        month: '2-digit',

        year: 'numeric',

        hour: '2-digit',

        minute: '2-digit'

      }
    );

  }


  // =====================================================
  // TRACK BY
  // =====================================================

  trackByPayout(
    index: number,
    payout: PayoutAffichage
  ): string {

    return (

      payout._id

      ||

      payout.payoutId

      ||

      index.toString()

    );

  }

}