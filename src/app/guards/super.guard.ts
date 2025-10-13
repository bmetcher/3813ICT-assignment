import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ContextService } from '../services/context.service';

export const superGuard: CanActivateFn = () => {
    const context = inject(ContextService);
    const router = inject(Router);
    const memberships = context.memberships();

    // check membership at random   (every role should be super)
    if (memberships.some(ms => ms.userId === 'super')) return true;

    router.navigate(['/chat']);
    return false;
}