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

  constructor(private el: ElementRef) {}

  ngOnInit() {
    // Initialize current displayed value to the initial countUp value
    this.currentDisplayedValue = this.countUp;

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
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['countUp'] && !changes['countUp'].firstChange) {
      // Update current displayed value
      this.currentDisplayedValue = changes['countUp'].previousValue || 0;

      // If we've already animated once, restart animation
      if (this.hasAnimated) {
        this.restartAnimation();
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

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);

      this.el.nativeElement.textContent = this.formatNumber(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.el.nativeElement.textContent = this.formatNumber(endValue);
        // Update current displayed value and remove counting class when animation completes
        this.currentDisplayedValue = endValue;
        this.el.nativeElement.classList.remove('counting');
      }
    };

    requestAnimationFrame(animate);
  }

  private restartAnimation(): void {
    // Reset animation state
    this.hasAnimated = false;
    this.el.nativeElement.classList.remove('counting', 'stats-number');

    // Start animation immediately (don't wait for intersection observer)
    this.animateCount();
    this.hasAnimated = true;
  }

  private formatNumber(num: number): string {
    // Add comma formatting for large numbers
    return num.toLocaleString();
  }
}