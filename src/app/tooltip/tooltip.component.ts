import { Component, Directive, ElementRef, HostListener, Input, OnDestroy, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') tooltipText: string = '';
  @Input() tooltipDelay: number = 1000; // milliseconds
  @Input() tooltipOnlyWhenTruncated: boolean = true; // Only show if text is truncated

  private tooltipElement: HTMLElement | null = null;
  private tooltipTimer: ReturnType<typeof setTimeout> | null = null;
  private isVisible: boolean = false;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('mouseenter', ['$event'])
  onMouseEnter(event: MouseEvent) {
    this.scheduleTooltip(event);
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.cancelTooltip();
  }

  private scheduleTooltip(event: MouseEvent) {
    this.cancelTooltip();

    // Check if we should show tooltip based on truncation setting
    if (this.tooltipOnlyWhenTruncated && !this.isTextTruncated()) {
      return;
    }

    this.tooltipTimer = setTimeout(() => {
      this.showTooltip(event);
    }, this.tooltipDelay);
  }

  private showTooltip(event: MouseEvent) {
    if (!this.tooltipText || this.isVisible) return;

    // Create tooltip element
    this.tooltipElement = this.renderer.createElement('div') as HTMLElement;

    // Set tooltip styles
    this.renderer.addClass(this.tooltipElement, 'fixed');
    this.renderer.addClass(this.tooltipElement, 'z-50');
    this.renderer.addClass(this.tooltipElement, 'pointer-events-none');
    this.renderer.addClass(this.tooltipElement, 'max-w-[80vw]');
    this.renderer.addClass(this.tooltipElement, 'break-words');
    this.renderer.addClass(this.tooltipElement, 'rounded-md');
    this.renderer.addClass(this.tooltipElement, 'shadow-lg');
    this.renderer.addClass(this.tooltipElement, 'border');
    this.renderer.addClass(this.tooltipElement, 'px-3');
    this.renderer.addClass(this.tooltipElement, 'py-2');
    this.renderer.addClass(this.tooltipElement, 'text-sm');

    // Light/dark mode styles
    this.renderer.addClass(this.tooltipElement, 'bg-white');
    this.renderer.addClass(this.tooltipElement, 'text-gray-900');
    this.renderer.addClass(this.tooltipElement, 'border-gray-200');
    this.renderer.addClass(this.tooltipElement, 'dark:bg-gray-800');
    this.renderer.addClass(this.tooltipElement, 'dark:text-gray-100');
    this.renderer.addClass(this.tooltipElement, 'dark:border-gray-700');

    // Set tooltip text
    if (this.tooltipElement) {
      this.tooltipElement.textContent = this.tooltipText;
    }

    // Position tooltip
    const offset = 12;
    const x = event.clientX + offset;
    const y = event.clientY + offset;

    this.renderer.setStyle(this.tooltipElement, 'left', x + 'px');
    this.renderer.setStyle(this.tooltipElement, 'top', y + 'px');

    // Add to DOM
    this.renderer.appendChild(document.body, this.tooltipElement);
    this.isVisible = true;
  }

  private cancelTooltip() {
    if (this.tooltipTimer) {
      clearTimeout(this.tooltipTimer);
      this.tooltipTimer = null;
    }

    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
      this.tooltipElement = null;
      this.isVisible = false;
    }
  }

  private isTextTruncated(): boolean {
    const element = this.elementRef.nativeElement;
    return element.scrollWidth > element.clientWidth;
  }

  ngOnDestroy() {
    this.cancelTooltip();
  }
}

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: '',
  styleUrl: './tooltip.component.css'
})
export class TooltipComponent {
  // This component serves as a barrel export for the directive
  static TooltipDirective = TooltipDirective;
}
