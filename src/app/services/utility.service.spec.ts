import { TestBed } from '@angular/core/testing';
import { UtilityService } from './utility.service';

describe('UtilityService', () => {
  let service: UtilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UtilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return full URL for avatar path', () => {
    const avatarPath = 'public/avatars/test.png';
    const result = service.getAvatarUrl(avatarPath);

    expect(result).toContain('localhost:3000');
    expect(result).toContain(avatarPath);
  });

  it('should return default avatar for undefined path', () => {
    const result = service.getAvatarUrl(undefined);

    expect(result).toContain('default.png');
  });
});
