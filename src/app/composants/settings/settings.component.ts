import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {

  private destroy$ = new Subject<void>();

  administrateurs: any[] = [];
  loading = true;

  loadingCreate = false;

  // DELETE LOADING
  deletingId: string | null = null;

  adminForm!: FormGroup;

  // TOAST
  toastVisible = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  // MODAL DELETE
  showDeleteModal = false;
  adminToDelete: any = null;

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {

    this.adminForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      role: ['admin', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.getAdministrateurs();
  }

  // ---------------- TOAST ----------------
  showToast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;

    setTimeout(() => {
      this.toastVisible = false;
    }, 3000);
  }

  // ---------------- GET ADMIN ----------------
getAdministrateurs(): void {

  this.loading = true;

  this.adminService.getAdmins()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {

        this.administrateurs = data.sort((a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        this.loading = false;
      },

      error: () => {
        this.loading = false;
      }
    });

}

  // ---------------- CREATE ----------------
  creerAdministrateur() {

    if (this.adminForm.invalid) return;

    this.loadingCreate = true;

    this.adminService.createAdmin(this.adminForm.value).subscribe({
      next: () => {

        this.loadingCreate = false;

        this.showToast("Administrateur créé avec succès", "success");

        this.adminForm.reset({ role: 'admin' });

        this.getAdministrateurs();
      },
      error: (err) => {

        this.loadingCreate = false;

        this.showToast(err.error?.message || "Erreur lors de la création", "error");
      }
    });
  }

  // ---------------- OPEN MODAL DELETE ----------------
  openDeleteModal(admin: any) {
    this.adminToDelete = admin;
    this.showDeleteModal = true;
  }

  closeModal() {
    this.showDeleteModal = false;
    this.adminToDelete = null;
  }

  // ---------------- CONFIRM DELETE ----------------
  confirmDelete() {

    if (!this.adminToDelete) return;

    const id = this.adminToDelete._id;

    this.deletingId = id;

    this.adminService.deleteAdmin(id).subscribe({

      next: () => {

        this.deletingId = null;

        this.showToast("Administrateur supprimé avec succès", "success");

        this.closeModal();

        this.getAdministrateurs();
      },

      error: (err) => {

        this.deletingId = null;

        this.showToast(err.error?.message || "Erreur suppression", "error");
      }
    });
  }

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}


}