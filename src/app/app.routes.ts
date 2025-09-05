import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ChatComponent } from './components/chat/chat.component';
import { SettingsComponent } from './components/settings/settings.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // default is chat
  {
    path: '',
    redirectTo: '/chat',
    pathMatch: 'full'
  },
  {
    path:'chat',
    component: ChatComponent,
    title: "Chat",
    canActivate: [authGuard]  // bounce back to '/login' without a user
  },
  {
    path:'login',
    component: LoginComponent,
    title: "Login Page",
  },
  {
    path:'settings',
    component: SettingsComponent,
    title: "Settings",
  }

];
