import { Directive, ElementRef, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[countUp]',
  standalone: true
})
export class CountUpDirective implements OnInit, OnDestroy, OnChanges {
  @Input() countUp!: number;
  @Input() duration: number = 2000; // Duration in milliseconds
  @Input() startValue: number = 0;

  private observer!: IntersectionObserver;
  private hasAnimated: boolean = false;
  private currentDisplayedValue: number = 0;
  private animationFrameId: number | null = null;
  private isAnimating: boolean = false;
  private pendingValue: number | null = null;
  private updateTimeout: number | null = null;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    // Initialize current displayed value to startValue (0) since that's where animation starts
    this.currentDisplayedValue = this.startValue;
    // Set initial display value
    this.el.nativeElement.textContent = this.formatNumber(this.startValue);

    // Create intersection observer to trigger animation when element comes into view
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.hasAnimated) {
            this.animateCount();
            this.hasAnimated = true;
            this.observer.unobserve(this.el.nativeElement);
          }
        });
      },
      { threshold: 0.1 }
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['countUp'] && !changes['countUp'].firstChange) {
      const newValue = changes['countUp'].currentValue;

      // If we've already animated once, handle the update with debouncing
      if (this.hasAnimated) {
        this.handleValueUpdate(newValue);
      }
    }
  }

  private animateCount() {
    const startTime = performance.now();
    // Use current displayed value as start if we've animated before, otherwise use startValue
    const startValue = this.hasAnimated ? this.currentDisplayedValue : this.startValue;
    const endValue = this.countUp;
    const duration = this.duration;

    // Add counting class and stats-number class
    this.el.nativeElement.classList.add('counting', 'stats-number');
    this.isAnimating = true;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);

      this.el.nativeElement.textContent = this.formatNumber(currentValue);

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        this.el.nativeElement.textContent = this.formatNumber(endValue);
        // Update current displayed value and remove counting class when animation completes
        this.currentDisplayedValue = endValue;
        this.el.nativeElement.classList.remove('counting');
        this.isAnimating = false;
        this.animationFrameId = null;
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  private handleValueUpdate(newValue: number): void {
    // Store the latest value
    this.pendingValue = newValue;

    // Clear any existing timeout
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    // Debounce rapid updates - wait 100ms for more updates
    this.updateTimeout = window.setTimeout(() => {
      if (this.pendingValue !== null) {
        this.updateToNewValue(this.pendingValue);
        this.pendingValue = null;
      }
    }, 100);
  }

  private updateToNewValue(newValue: number): void {
    // If we're currently animating, cancel the current animation
    if (this.isAnimating && this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.isAnimating = false;
      this.animationFrameId = null;
    }

    // Get the current displayed value from the DOM element
    const currentText = this.el.nativeElement.textContent;
    const currentDisplayed = this.parseDisplayedValue(currentText);
    
    // Start animation from current displayed value to new value
    const startTime = performance.now();
    const startValue = currentDisplayed;
    const endValue = newValue;
    const duration = this.duration;

    // Add counting class
    this.el.nativeElement.classList.add('counting');
    this.isAnimating = true;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);

      this.el.nativeElement.textContent = this.formatNumber(currentValue);

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        this.el.nativeElement.textContent = this.formatNumber(endValue);
        // Update current displayed value and remove counting class when animation completes
        this.currentDisplayedValue = endValue;
        this.el.nativeElement.classList.remove('counting');
        this.isAnimating = false;
        this.animationFrameId = null;
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  private parseDisplayedValue(text: string): number {
    // Parse the displayed value from the DOM element text
    const cleaned = text.replace(/,/g, '');
    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? this.currentDisplayedValue : parsed;
  }

  private formatNumber(num: number): string {
    // Add comma formatting for large numbers
    return num.toLocaleString();
  }
}