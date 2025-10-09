import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  // grab current JWT from AuthService's BehaviourSubject
  const token = auth.token$.value;

  // no token: forward unchanged
  if (!token) return next(req);

  // clone the request to add the Authorization header
  const cloned = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });

  return next(cloned);
};
