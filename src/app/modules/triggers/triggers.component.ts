import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-triggers',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './triggers.component.html',
  styleUrl: './triggers.component.css'
})
export class TriggersComponent {

}
