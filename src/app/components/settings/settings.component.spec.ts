import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UtilityService } from '../../services/utility.service';
import { Router } from '@angular/router';
import { signal } from '@angular/core';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let mockAuthService: any;
  let mockUserService: any;
  let mockUtilityService: any;
  let mockRouter: any;

  beforeEach(async () => {
    const mockUser = {
      _id: '123',
      username: 'testuser',
      email: 'test@test.com',
      avatar: 'public/avatars/default.png'
    };

    mockAuthService = {
      currentUser: signal(mockUser),
      logout: jasmine.createSpy('logout'),
      setCurrentUser: jasmine.createSpy('setCurrentUser')
    };

    mockUserService = {
      updateUser: jasmine.createSpy('updateUser'),
      uploadAvatar: jasmine.createSpy('uploadAvatar')
    };

    mockUtilityService = {
      getAvatarUrl: jasmine.createSpy('getAvatarUrl').and.returnValue('http:/localhost:3000/public/avatars/default.png')
    };

    mockRouter = {
      navigate: jasmine.createSpy('navigate'),
      navigateByUrl: jasmine.createSpy('navigateByUrl')
    }

    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
        { provide: UtilityService, useValue: mockUtilityService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate back to chat', () => {
    component.backToChat();
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/chat');
  });

  it('should call logout on confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });
});
