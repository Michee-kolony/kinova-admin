import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoircommandesComponent } from './voircommandes.component';

describe('VoircommandesComponent', () => {
  let component: VoircommandesComponent;
  let fixture: ComponentFixture<VoircommandesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VoircommandesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoircommandesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
