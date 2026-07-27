import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const adminAuthInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);

  // Récupérer le token enregistré lors de la connexion
  const token = localStorage.getItem('auth_token');

  // Si aucun token n'existe, envoyer la requête normalement
  if (!token) {
    return next(req);
  }

  // Ajouter le token dans le header Authorization
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq).pipe(

    catchError((error) => {

      // Token expiré ou invalide
      if (error.status === 401) {

        console.log('❌ Session administrateur expirée ou invalide');

        // Supprimer le token
        localStorage.removeItem('auth_token');

        // Supprimer les données de l'utilisateur
        localStorage.removeItem('user_data');

        // Rediriger vers la page de connexion
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })

  );
};