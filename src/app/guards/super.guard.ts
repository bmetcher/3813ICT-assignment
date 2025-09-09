import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const superGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isSuperAdmin()) {
        return true;    // allow access when super admin
    } else {
        router.navigate(['/']);
        return false;
    }
}