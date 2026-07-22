import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KinovaComponent } from './kinova.component';

describe('KinovaComponent', () => {
  let component: KinovaComponent;
  let fixture: ComponentFixture<KinovaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KinovaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KinovaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
