import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  faqs = [
    {
      question: "Qu'est-ce que Kinova et comment ça fonctionne ?",
      answer: "Kinova est une plateforme e-commerce innovante qui simplifie vos achats en ligne. Elle fonctionne comme un marché en ligne où vous pouvez découvrir, comparer et acheter des produits de qualité. Notre système de recommandation intelligent vous propose des articles adaptés à vos préférences.",
      isOpen: false,
      maxHeight: '0px'
    },
    {
      question: "Comment créer un compte sur Kinova ?",
      answer: "Pour créer un compte, cliquez sur 'S'inscrire' en haut à droite du site. Remplissez le formulaire avec votre nom, votre email et un mot de passe sécurisé. Vous recevrez un email de confirmation pour activer votre compte. Une fois activé, vous pourrez commencer à acheter immédiatement.",
      isOpen: false,
      maxHeight: '0px'
    },
    {
      question: "Quels sont les modes de paiement acceptés ?",
      answer: "Nous acceptons les cartes bancaires (Visa, Mastercard, American Express), PayPal, et les virements bancaires. Tous les paiements sont sécurisés par un système de cryptage avancé. Vous pouvez également utiliser des solutions de paiement en plusieurs fois selon votre pays.",
      isOpen: false,
      maxHeight: '0px'
    },
    {
      question: "Quels sont les délais de livraison ?",
      answer: "Les délais de livraison varient selon votre localisation. En France métropolitaine, comptez 2 à 4 jours ouvrables. Pour l'Europe, 3 à 7 jours ouvrables. Nous proposons également une livraison express en 24h pour certaines zones. Vous recevrez un numéro de suivi dès l'expédition de votre commande.",
      isOpen: false,
      maxHeight: '0px'
    },
    {
      question: "Comment retourner un produit ?",
      answer: "Vous disposez de 30 jours après réception pour retourner un produit. Connectez-vous à votre compte, allez dans 'Mes commandes' et sélectionnez l'article à retourner. Imprimez l'étiquette de retour et déposez le colis dans un point relais. Le remboursement sera effectué sous 5 à 7 jours ouvrés.",
      isOpen: false,
      maxHeight: '0px'
    },
    {
      question: "Kinova propose-t-il un service client ?",
      answer: "Oui, notre service client est disponible 24h/24 et 7j/7. Vous pouvez nous contacter par email à support@kinova.com, par téléphone au +33 1 23 45 67 89, ou via notre chat en direct disponible sur le site. Notre équipe est réactive et prête à vous aider.",
      isOpen: false,
      maxHeight: '0px'
    },
    {
      question: "Comment fonctionnent les recommandations personnalisées ?",
      answer: "Notre système de recommandation analyse vos historiques de navigation, vos achats précédents et vos préférences. Grâce à un algorithme d'intelligence artificielle, nous vous proposons des produits susceptibles de vous plaire. Plus vous interagissez avec la plateforme, plus les recommandations deviennent pertinentes.",
      isOpen: false,
      maxHeight: '0px'
    }
  ];

  toggleFaq(index: number): void {
    const clickedFaq = this.faqs[index];
    const isCurrentlyOpen = clickedFaq.isOpen;
    
    // Fermer toutes les FAQ
    this.faqs.forEach(faq => {
      faq.isOpen = false;
      faq.maxHeight = '0px';
    });
    
    // Si la FAQ cliquée était fermée, on l'ouvre
    if (!isCurrentlyOpen) {
      clickedFaq.isOpen = true;
      
      // Calculer la hauteur réelle du contenu après l'ouverture
      setTimeout(() => {
        const contentElements = document.querySelectorAll('.faq-content');
        if (contentElements[index]) {
          const contentHeight = contentElements[index].scrollHeight;
          clickedFaq.maxHeight = contentHeight + 'px';
        } else {
          // Fallback si l'élément n'est pas trouvé
          clickedFaq.maxHeight = '300px';
        }
      }, 0);
    }
  }
}
