import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ChatComponent } from './components/chat/chat.component';
import { SettingsComponent } from './components/settings/settings.component';
import { authGuard } from './guards/auth.guard';
import { superGuard } from './guards/super.guard';
import { AdminComponent } from './components/admin/admin.component';


export const routes: Routes = [
  {
  path:'login',
  component: LoginComponent,
  title: "Login Page",
  },
  {
    path:'chat',
    component: ChatComponent,
    title: "Chat",
    canActivate: [authGuard]  // bounce back to '/login' without a user
  },
  {
    path:'settings',
    component: SettingsComponent,
    title: "Settings",
  },
  {
    path: 'admin',
    component: AdminComponent,
    title: "Admin Settings",
    canActivate: [superGuard]
  },
  // default is chat
  {
    path: '',
    redirectTo: 'chat',
    pathMatch: 'full'
  }
];
