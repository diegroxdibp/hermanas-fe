import { Component, computed, ElementRef, signal, ViewChild } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { AppConstants } from '../../../app-constants';
import { MatExpansionModule } from '@angular/material/expansion';
import { trigger, state, style, transition, animate, query } from '@angular/animations';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-faq',
  imports: [MatListModule, MatExpansionModule, FormsModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({ height: '0', opacity: 0 })),
      state('expanded', style({ height: '*', opacity: 1 })),
      transition('collapsed <=> expanded', [animate('300ms ease-in-out')]),
    ]),
    trigger('rotateArrow', [
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      state('expanded', style({ transform: 'rotate(180deg)' })),
      transition('collapsed <=> expanded', [animate('300ms ease-in-out')]),
    ]),
    trigger('topicSwap', [                          // ← only one topicSwap
      transition('* => *', [
        style({ opacity: 0 }),
        animate('200ms 50ms ease-in', style({ opacity: 1 }))
      ])
    ]),
    trigger('heightChange', [
      transition('* => *', [
        query(':self', [
          style({ height: '{{startHeight}}px' }),
          animate('350ms cubic-bezier(0.4, 0, 0.2, 1)', style({ height: '*' }))
        ], { optional: true })
      ], { params: { startHeight: 0 } })
    ]),
  ],
})
export class FaqComponent {
  @ViewChild('topicItemsRef') topicItemsRef!: ElementRef;
  AppConstants = AppConstants;
  expandedItems: { [key: string]: boolean } = {};
  selectedTopicName = signal<string | null>(null);
  selectedTopic = computed(() =>
    AppConstants.faq.find(t => t.topicName === this.selectedTopicName()) ?? null
  );
  topicItemsHeight = 0;

  selectTopic(selectionValue: string) {
    this.selectedTopicName.set(this.selectedTopicName() !== selectionValue ? selectionValue : null);
  }

  selectTopicWithHeight(topicName: string) {
    // 1. Reset expansions first
    this.expandedItems = {};

    // 2. Let Angular process the reset in this frame,
    //    then switch topic + snapshot height in the next
    setTimeout(() => {
      if (this.topicItemsRef?.nativeElement) {
        this.topicItemsHeight = this.topicItemsRef.nativeElement.offsetHeight;
      }
      this.selectedTopicName.set(topicName);
      const elementTop = this.topicItemsRef.nativeElement.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementTop - AppConstants.navigation.height;

      setTimeout(()=>{
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      },0)
    }, 0);
  }

  toggleItem(itemId: string) {
    this.expandedItems[itemId] = !this.expandedItems[itemId];
  }
}
