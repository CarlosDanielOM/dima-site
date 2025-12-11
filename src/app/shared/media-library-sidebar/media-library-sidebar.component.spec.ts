import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaLibrarySidebarComponent } from './media-library-sidebar.component';

describe('MediaLibrarySidebarComponent', () => {
  let component: MediaLibrarySidebarComponent;
  let fixture: ComponentFixture<MediaLibrarySidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaLibrarySidebarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MediaLibrarySidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
