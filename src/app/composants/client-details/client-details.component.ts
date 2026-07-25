import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.css']

})
export class ClientDetailsComponent implements OnInit {

  private urlClient = 'https://kinova-backend.tech/client';

  client: any;
  loading = true;

  showModal = false;
  deleting = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getClient();
  }

  getClient() {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.http.get(`${this.urlClient}/${id}`).subscribe({
      next: (res: any) => {
        this.client = res;
        this.loading = false;
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
      }
    });

  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  deleteClient() {

    this.deleting = true;

    this.http.delete(`${this.urlClient}/${this.client._id}`).subscribe({

      next: () => {

        this.deleting = false;
        this.showModal = false;

        alert('Client supprimé avec succès');

        this.router.navigate(['/admin/clientlist']);

      },

      error: (err) => {

        console.log(err);
        this.deleting = false;

      }

    });

  }

}