import { Component } from '@angular/core';

interface Ecran {
  image: string;
  titre: string;
  description: string;
}

interface Section {
  id: string;
  badge: string;
  titre: string;
  intro: string;
  vendeur?: boolean;
  ecrans: Ecran[];
}

@Component({
  selector: 'app-decouvrir',
  templateUrl: './decouvrir.component.html',
  styleUrl: './decouvrir.component.css'
})
export class DecouvrirComponent {

  // Captures réelles de l'application mobile (public/images/app)
  sections: Section[] = [
    {
      id: 'demarrer',
      badge: 'Premiers pas',
      titre: 'Bien démarrer',
      intro: 'Au premier lancement, Kinova vous présente l\'application puis vous laisse choisir votre façon de l\'utiliser.',
      ecrans: [
        { image: 'onboarding', titre: 'Présentation', description: 'Faites défiler les écrans de bienvenue pour découvrir Kinova, ou appuyez sur « Passer ».' },
        { image: 'accueil', titre: 'Choisir son espace', description: 'Connectez-vous comme client, comme vendeur, ou continuez en tant qu\'invité pour visiter librement.' },
        { image: 'inscription', titre: 'Créer un compte', description: 'Renseignez vos informations en 3 étapes : nom, téléphone, adresse et genre.' },
        { image: 'connexion', titre: 'Se connecter', description: 'Entrez votre e-mail et votre mot de passe. Un oubli ? Le lien « Mot de passe oublié » vous envoie un code.' }
      ]
    },
    {
      id: 'explorer',
      badge: 'Client',
      titre: 'Explorer le catalogue',
      intro: 'Parcourez les articles de tous les vendeurs, par catégorie, par boutique ou par promotion.',
      ecrans: [
        { image: 'home', titre: 'Accueil', description: 'Recherchez un produit, filtrez Homme / Femme / Enfants et découvrez les promotions du moment.' },
        { image: 'categories', titre: 'Catégories', description: 'Toutes les catégories en un coup d\'œil. Touchez-en une pour voir ses articles.' },
        { image: 'filtre-categorie', titre: 'Articles d\'une catégorie', description: 'Les articles de la catégorie choisie, avec leurs prix et réductions.' },
        { image: 'boutiques', titre: 'Boutiques', description: 'La liste des boutiques vérifiées, avec leur nombre d\'articles.' },
        { image: 'boutique-details', titre: 'Page d\'une boutique', description: 'Les coordonnées du vendeur et tous les articles qu\'il propose.' },
        { image: 'promotions', titre: 'Promotions', description: 'Les meilleures offres, triées par catégorie.' }
      ]
    },
    {
      id: 'acheter',
      badge: 'Client',
      titre: 'Acheter un article',
      intro: 'De la fiche produit jusqu\'au suivi de votre commande, tout se fait depuis votre téléphone.',
      ecrans: [
        { image: 'article-details', titre: 'Fiche produit', description: 'Photos, prix, stock, couleurs et tailles. Choisissez vos options puis « Ajouter au panier ».' },
        { image: 'panier', titre: 'Panier', description: 'Ajustez les quantités, supprimez un article, puis appuyez sur « Passer au paiement » (Mobile Money ou carte).' },
        { image: 'mes-commandes', titre: 'Mes commandes', description: 'Suivez le statut de chaque commande : en attente, en préparation, en cours de livraison, livrée.' },
        { image: 'chat', titre: 'Discuter avec le vendeur', description: 'Posez vos questions sur un article directement au vendeur, depuis la fiche produit.' }
      ]
    },
    {
      id: 'compte',
      badge: 'Client',
      titre: 'Gérer son compte',
      intro: 'Votre profil regroupe vos informations, vos commandes, vos messages et vos préférences.',
      ecrans: [
        { image: 'profil', titre: 'Mon profil', description: 'Accédez à vos informations, commandes, messages, au mode sombre et à la langue.' },
        { image: 'mes-infos', titre: 'Mes informations', description: 'Consultez et modifiez votre nom, téléphone et genre.' },
        { image: 'langue', titre: 'Langue', description: 'L\'application est disponible en français, en lingala et en anglais.' },
        { image: 'centre-aide', titre: 'Centre d\'aide', description: 'Un souci ? Écrivez à l\'équipe Kinova, qui répond sous 24 h ouvrées.' }
      ]
    },
    {
      id: 'vendeur',
      badge: 'Vendeur',
      titre: 'Vendre sur Kinova',
      intro: 'Ouvrez votre boutique, publiez vos articles et gérez vos ventes depuis l\'espace vendeur.',
      vendeur: true,
      ecrans: [
        { image: 'vendeur-inscription', titre: 'Créer sa boutique', description: 'Inscrivez-vous en 3 étapes : identifiants, boutique, puis moyen de paiement.' },
        { image: 'vendeur-connexion', titre: 'Connexion vendeur', description: 'Une fois votre boutique vérifiée, connectez-vous à votre espace.' },
        { image: 'vendeur-dashboard', titre: 'Tableau de bord', description: 'Chiffre d\'affaires, articles publiés, commandes reçues et livrées en un coup d\'œil.' },
        { image: 'vendeur-publier', titre: 'Publier un article', description: 'Ajoutez jusqu\'à 3 photos, le nom, le prix, la réduction, la catégorie, les couleurs et les tailles.' },
        { image: 'vendeur-articles', titre: 'Mes articles', description: 'Retrouvez, modifiez ou supprimez les articles de votre boutique.' },
        { image: 'vendeur-commandes', titre: 'Commandes reçues', description: 'Toutes les commandes de vos clients, filtrées par statut.' },
        { image: 'vendeur-details-commande', titre: 'Détail d\'une commande', description: 'Paiement, livraison, articles commandés et argent reçu pour la commande.' },
        { image: 'vendeur-carte', titre: 'Suivi des livraisons', description: 'Suivez sur la carte le livreur qui transporte vos articles.' },
        { image: 'vendeur-profil', titre: 'Profil vendeur', description: 'Les informations de votre boutique : catégorie, téléphone, Mobile Money, adresse.' }
      ]
    }
  ];

  allerA(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
