import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { UserStateService } from '../services/user-state.service';
import { BlockInactiveUserDirective } from './block-inactive-user.directive';

@Component({
  template: `
    <button appBlockInactiveUser actionType="click" (click)="onClick()">Test Button</button>
    <form appBlockInactiveUser actionType="submit" (submit)="onSubmit()">
      <input type="submit" value="Submit">
    </form>
  `
})
class TestComponent {
  onClick() {
    console.log('Button clicked');
  }

  onSubmit() {
    console.log('Form submitted');
  }
}

describe('BlockInactiveUserDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let userStateService: jasmine.SpyObj<UserStateService>;

  beforeEach(async () => {
    const userStateServiceSpy = jasmine.createSpyObj('UserStateService', ['blockAction'], {
      isUserActive$: { subscribe: jasmine.createSpy() }
    });

    await TestBed.configureTestingModule({
      imports: [TestComponent, BlockInactiveUserDirective],
      providers: [
        { provide: UserStateService, useValue: userStateServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    userStateService = TestBed.inject(UserStateService) as jasmine.SpyObj<UserStateService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should block action when user is inactive', () => {
    // Mock user as inactive
    userStateService.isUserActive$.subscribe.and.callFake((callback: (value: boolean) => void) => {
      callback(false);
    });

    fixture.detectChanges();

    const button = fixture.debugElement.nativeElement.querySelector('button');
    const clickEvent = new Event('click');
    
    spyOn(clickEvent, 'preventDefault');
    spyOn(clickEvent, 'stopPropagation');

    button.dispatchEvent(clickEvent);

    expect(clickEvent.preventDefault).toHaveBeenCalled();
    expect(clickEvent.stopPropagation).toHaveBeenCalled();
    expect(userStateService.blockAction).toHaveBeenCalled();
  });
});
