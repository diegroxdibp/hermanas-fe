import { AppConstants } from './../../../app-constants';
import { Component } from '@angular/core';
import { HeroComponent } from '../hero/hero.component';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-body',
  imports: [HeroComponent, CommonModule, MatButtonModule, MatExpansionModule],
  templateUrl: './body.component.html',
  styleUrl: './body.component.scss',
  standalone: true,
})
export class BodyComponent {
  AppConstants = AppConstants;
  // Using an object instead of an array to track expanded state
  expandedItems: { [key: string]: boolean } = {};

  toggleItem(itemId: string) {
    // Toggle only the specific item
    this.expandedItems[itemId] = !this.expandedItems[itemId];
  }
}
