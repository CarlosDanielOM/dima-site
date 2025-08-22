import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipDirective } from './tooltip.component';

/**
 * Example component showing how to use the TooltipDirective
 * This file demonstrates various ways to use the tooltip across your application
 */
@Component({
  selector: 'app-tooltip-example',
  standalone: true,
  imports: [CommonModule, TooltipDirective],
  template: `
    <div class="p-6 space-y-4">
      <h2 class="text-2xl font-bold mb-4">Tooltip Usage Examples</h2>

      <!-- Basic tooltip usage -->
      <div class="space-y-2">
        <h3 class="text-lg font-semibold">Basic Usage</h3>
        <p [appTooltip]="'This is a basic tooltip that shows on hover'">
          Hover over this text to see a basic tooltip
        </p>
      </div>

      <!-- Tooltip with custom delay -->
      <div class="space-y-2">
        <h3 class="text-lg font-semibold">Custom Delay</h3>
        <p [appTooltip]="'This tooltip shows after 500ms instead of 1000ms'"
            tooltipDelay="500">
          Hover over this text to see a tooltip with custom delay
        </p>
      </div>

      <!-- Tooltip that always shows (not just when truncated) -->
      <div class="space-y-2">
        <h3 class="text-lg font-semibold">Always Show Tooltip</h3>
        <p [appTooltip]="'This tooltip always shows, even if text is not truncated'"
            tooltipOnlyWhenTruncated="false">
          This tooltip always shows on hover
        </p>
      </div>

      <!-- Tooltip with long text that will be truncated -->
      <div class="space-y-2">
        <h3 class="text-lg font-semibold">Truncated Text Tooltip</h3>
        <div class="w-48 truncate">
          <span [appTooltip]="'This is a very long text that will be truncated and show a tooltip when you hover over it'">
            This is a very long text that will be truncated and show a tooltip when you hover over it
          </span>
        </div>
      </div>

      <!-- Tooltip with dynamic content -->
      <div class="space-y-2">
        <h3 class="text-lg font-semibold">Dynamic Content</h3>
        <p [appTooltip]="dynamicTooltipText">
          Hover to see dynamic tooltip: {{ dynamicValue }}
        </p>
      </div>

      <!-- Button with tooltip -->
      <div class="space-y-2">
        <h3 class="text-lg font-semibold">Button Tooltip</h3>
        <button class="px-4 py-2 bg-blue-500 text-white rounded"
                [appTooltip]="'Click this button to perform an action'"
                tooltipOnlyWhenTruncated="false">
          Action Button
        </button>
      </div>
    </div>
  `
})
export class TooltipExampleComponent {
  dynamicValue: any = 'Hello World';
  dynamicTooltipText: any = 'This tooltip content can be dynamically updated';

  // You can update tooltip content dynamically
  updateTooltip() {
    this.dynamicTooltipText = 'Updated tooltip content: ' + new Date().toLocaleTimeString();
  }
}
