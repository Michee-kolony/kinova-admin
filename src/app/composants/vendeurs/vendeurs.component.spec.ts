import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendeursComponent } from './vendeurs.component';

describe('VendeursComponent', () => {
  let component: VendeursComponent;
  let fixture: ComponentFixture<VendeursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VendeursComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendeursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
