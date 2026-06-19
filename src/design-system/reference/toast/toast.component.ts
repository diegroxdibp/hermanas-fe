import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent implements OnInit, OnDestroy {
  @Input() message = 'Faça login para acessar esta área';
  @Input() duration = 5000;        // ms before auto-dismiss
  @Output() dismissed = new EventEmitter<void>();

  pct = 100;                        // bar width %
  private start = 0;
  private elapsed = 0;              // accumulated ms while not paused
  private paused = false;
  private raf = 0;

  ngOnInit(): void { this.start = performance.now(); this.tick(); }
  ngOnDestroy(): void { cancelAnimationFrame(this.raf); }

  private tick = (): void => {
    const now = performance.now();
    if (!this.paused) this.elapsed += now - this.start;
    this.start = now;
    this.pct = Math.max(0, 100 - (this.elapsed / this.duration) * 100);
    if (this.elapsed >= this.duration) { this.dismiss(); return; }
    this.raf = requestAnimationFrame(this.tick);
  };

  pause(): void { this.paused = true; }
  resume(): void { this.paused = false; }
  dismiss(): void { cancelAnimationFrame(this.raf); this.dismissed.emit(); }
}
