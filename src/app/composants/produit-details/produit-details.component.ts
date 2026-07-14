import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-produit-details',
  templateUrl: './produit-details.component.html',
  styleUrls: ['./produit-details.component.css']
})
export class ProduitDetailsComponent implements OnInit, OnDestroy {
  product: any = null;
  loading = true;
  showDeleteModal = false;
  deleting = false;
  errorMessage: string | null = null;
  selectedImage: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private articleService: ArticleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProduct();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProduct(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (!id) {
      this.errorMessage = 'ID du produit manquant';
      this.loading = false;
      return;
    }

    this.articleService.getArticleById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.product = data;
          this.selectedImage = this.getFirstImage();
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur de chargement:', err);
          this.errorMessage = 'Impossible de charger le produit. Veuillez réessayer.';
          this.loading = false;
        }
      });
  }

  // Récupère toutes les images du produit
  getImages(): string[] {
    if (this.product?.images && Array.isArray(this.product.images) && this.product.images.length > 0) {
      return this.product.images;
    }
    if (this.product?.image) {
      return [this.product.image];
    }
    return ['assets/placeholder-image.jpg'];
  }

  // Récupère la première image
  getFirstImage(): string {
    const images = this.getImages();
    return images.length > 0 ? images[0] : 'assets/placeholder-image.jpg';
  }

  // Prix final avec réduction
  getPrixFinal(): number {
    if (!this.product) return 0;
    return this.product.prixreduit || this.product.prix || 0;
  }

  openDeleteModal(): void {
    this.showDeleteModal = true;
    this.errorMessage = null;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deleting = false;
  }

  confirmDelete(): void {
    if (!this.product?._id) {
      this.errorMessage = 'ID du produit introuvable';
      return;
    }

    this.deleting = true;
    this.errorMessage = null;

    this.articleService.deleteArticle(this.product._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.closeDeleteModal();
          this.router.navigate(['/admin/produits'], { 
            state: { 
              message: `Le produit "${this.product.nom}" a été supprimé avec succès.` 
            }
          });
        },
        error: (err) => {
          console.error('Erreur de suppression:', err);
          this.errorMessage = 'Erreur lors de la suppression du produit. Veuillez réessayer.';
          this.deleting = false;
        }
      });
  }

  goToEdit(): void {
    if (this.product?._id) {
      this.router.navigate(['/produits/modifier', this.product._id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/produits']);
  }
}