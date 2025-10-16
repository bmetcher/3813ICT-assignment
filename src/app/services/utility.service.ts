import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  private baseUrl = environment.apiUrl.replace('/api', '');

  // get full avatar for path -- handle backend paths, full URLs, missing avatars
  getAvatarUrl(avatarPath: string | undefined): string {
    // no specified avatar -> default
    if (!avatarPath) {
      return `${this.baseUrl}/public/avatars/default.png`;
    }

    // already a full URL -> return as-is
    if (avatarPath.startsWith('http')) {
      return avatarPath;
    }

    // backend relative path -> prepend base URL
    return `${this.baseUrl}/${avatarPath}`;
  }

  // get full URL for group icon path
  getGroupIconUrl(iconPath: string | undefined): string {
    if (!iconPath) {
      return `${this.baseUrl}/public/groupIcons/default.png`;
    }

    if (iconPath.startsWith('http')) {
      return iconPath;
    }

    return `${this.baseUrl}/${iconPath}`;
  }

  // "cache bust" -> add a timestamp to the URL to force a reload
  bustCache(url: string): string {
    return `${url}?t=${Date.now()}`;
  }
}
