import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletecountComponent } from './deletecount.component';

describe('DeletecountComponent', () => {
  let component: DeletecountComponent;
  let fixture: ComponentFixture<DeletecountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeletecountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletecountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
