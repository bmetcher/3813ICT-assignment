import { Routes } from '@angular/router';
import { LoginComponent } from './components/login-component/login-component';
import { ChatComponent } from './components/chat-component/chat-component';
import { SettingsComponent } from './components/settings-component/settings-component';

export const routes: Routes = [
  // Default is Chat (it will require AuthGuard)
  {
    path: '',
    redirectTo: '/chat',
    pathMatch: 'full'
  },

  {
    path:'chat',
    component: ChatComponent,
    title: "Chat"
  },
  {
    path:'login',
    component: LoginComponent,
    title: "Login Page"
  },
  {
    path:'settings',
    component: SettingsComponent,
    title: "Settings"
  }

];
