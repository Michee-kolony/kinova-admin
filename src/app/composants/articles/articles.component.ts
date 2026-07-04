import { Component } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.css'
})
export class ArticlesComponent {
  isModalOpen = false;
  isEditing = false;
  
  articleData = {
    title: '',
    category: '',
    image: '',
    content: '',
    status: 'draft'
  };

  constructor(public themeService: ThemeService) {}

  openModal(article?: any) {
    if (article) {
      this.isEditing = true;
      this.articleData = { ...article };
    } else {
      this.isEditing = false;
      this.resetForm();
    }
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isModalOpen = false;
    document.body.style.overflow = 'auto';
    this.resetForm();
  }

  resetForm() {
    this.articleData = {
      title: '',
      category: '',
      image: '',
      content: '',
      status: 'draft'
    };
  }

  saveArticle() {
    console.log('Article sauvegardé:', this.articleData);
    this.closeModal();
    // Ici vous pouvez appeler votre service pour sauvegarder
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.articleData.image = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Données simulées
  articles = [
    {
      id: 1,
      title: 'iPhone 15 Pro Max - Le nouveau fleuron d\'Apple',
      category: 'Technologie',
      image: 'https://picsum.photos/seed/1/400/250',
      content: '...',
      status: 'published',
      views: 1234,
      date: '15 Jan 2024'
    },
    // ... plus d'articles
  ];
}