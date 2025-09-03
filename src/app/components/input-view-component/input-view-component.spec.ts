import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputViewComponent } from './input-view-component';

describe('InputViewComponent', () => {
  let component: InputViewComponent;
  let fixture: ComponentFixture<InputViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
