import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedemptionsComponent } from './redemptions.component';

describe('RedemptionsComponent', () => {
  let component: RedemptionsComponent;
  let fixture: ComponentFixture<RedemptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RedemptionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RedemptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
