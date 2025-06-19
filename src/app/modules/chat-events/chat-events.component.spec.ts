import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatEventsComponent } from './chat-events.component';

describe('ChatEventsComponent', () => {
  let component: ChatEventsComponent;
  let fixture: ComponentFixture<ChatEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatEventsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChatEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
