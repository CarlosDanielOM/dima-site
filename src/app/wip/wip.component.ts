import { Component } from '@angular/core';
import { LucideAngularModule, Construction } from 'lucide-angular';

@Component({
  selector: 'app-wip',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './wip.component.html',
  styleUrls: ['./wip.component.css']
})
export class WipComponent {
  constructionIcon = Construction;
}
