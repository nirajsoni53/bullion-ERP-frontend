import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export class AuthGuard {
  static canActivate: CanActivateFn = () => {
    const router = inject(Router);
    const token = localStorage.getItem('auth_token');

    if (token) {
      return true;
    }

    router.navigate(['/login']);
    return false;
  };
}