import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { ContextService } from '../../services/context.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: any;
  let mockContextService: any;
  let mockUserService: any;
  let mockRouter: any;

  beforeEach(async () => {
    // create mock services
    mockAuthService = {
      login: jasmine.createSpy('login'),
      isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(false),
      getCurrentUser: jasmine.createSpy('getCurrentUser').and.returnValue(null),
      lgoout: jasmine.createSpy('logout'),
      setCurrentUser: jasmine.createSpy('setCurrentUser')
    };

    mockContextService = {
      loadUserContext: jasmine.createSpy('loadUserContext').and.returnValue(Promise.resolve())
    };

    mockUserService = {
      getUser: jasmine.createSpy('getUser').and.returnValue(of({ _id: '123', username: 'test' }))
    };

    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ContextService, useValue: mockContextService },
        { provide: UserService, useValue: mockUserService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty email and password initially', () => {
    expect(component.email()).toBe('');
    expect(component.password()).toBe('');
  });

  it('should set error message on login failure', async () => {
    // setup mock to throw error
    mockAuthService.login.and.returnValue(throwError(() => new Error('Network error')));

    component.email.set('test@test.com');
    component.password.set('password123');

    await component.login(new Event('submit'));

    expect (component.errorMsg()).toBe('Login failed, try again');
  });
});
