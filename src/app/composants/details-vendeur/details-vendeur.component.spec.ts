import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsVendeurComponent } from './details-vendeur.component';

describe('DetailsVendeurComponent', () => {
  let component: DetailsVendeurComponent;
  let fixture: ComponentFixture<DetailsVendeurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetailsVendeurComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsVendeurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
