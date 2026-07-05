import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-categorie',
  templateUrl: './categorie.component.html',
  styleUrl: './categorie.component.css'
})
export class CategorieComponent implements OnInit, OnDestroy {

  private url = "https://backend-kinova.onrender.com/categorie/";
  private sub!: Subscription;
  private refreshSub!: Subscription;

  loading = true;
  loadingCreate = false;

  categorie = {
    nom: '',
    htag: ''
  };

  categories: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getCategories();

    // 🔄 Auto refresh toutes les 10 secondes
    this.refreshSub = interval(10000).subscribe(() => {
      this.getCategories(false); // silent refresh
    });
  }

  // 🔥 GET + TRI par date récente
  getCategories(showLoading: boolean = true) {
    if (showLoading) this.loading = true;

    this.sub = this.http.get<any[]>(this.url).subscribe({
      next: (data) => {
        this.categories = data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );

        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement catégories', err);
        this.loading = false;
      }
    });
  }

  // ➕ AJOUT
  ajouterCategorie() {

    this.loadingCreate = true;

    if (!this.categorie.nom || !this.categorie.htag) {
      this.loadingCreate = false;
      return;
    }

    const data = {
      nom: this.categorie.nom,
      htag: this.categorie.htag
    };

    this.http.post<any>(this.url, data).subscribe({
      next: (res) => {

        // ajout en haut (toujours récent)
        this.categories.unshift(res);

        this.categorie = { nom: '', htag: '' };
        this.loadingCreate = false;
      },
      error: (err) => {
        console.error('Erreur ajout catégorie', err);
        this.loadingCreate = false;
      }
    });
  }

  // 🗑️ SUPPRESSION PAR ID
  supprimerCategorie(id: string) {

    if (!confirm("Voulez-vous vraiment supprimer cette catégorie ?")) return;

    this.http.delete(this.url + id).subscribe({
      next: () => {
        this.categories = this.categories.filter(cat => cat._id !== id);
      },
      error: (err) => {
        console.error("Erreur suppression catégorie", err);
      }
    });
  }

  ngOnDestroy(): void {

    if (this.sub) this.sub.unsubscribe();

    if (this.refreshSub) this.refreshSub.unsubscribe();
  }
}