import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-custom-snackbar',
  imports: [],
  templateUrl: './custom-snackbar.component.html',
  styleUrl: './custom-snackbar.component.scss',
})
export class CustomSnackbarComponent implements OnInit, OnDestroy {
  pct = 100;

  private start = 0;
  private elapsed = 0;
  private paused = false;
  private raf = 0;

  constructor(
    public snackBarRef: MatSnackBarRef<CustomSnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: { message: string; duration: number },
  ) {}

  ngOnInit(): void {
    this.start = performance.now();
    this.tick();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
  }

  private tick = (): void => {
    const now = performance.now();
    if (!this.paused) this.elapsed += now - this.start;
    this.start = now;
    this.pct = Math.max(0, 100 - (this.elapsed / this.data.duration) * 100);
    if (this.elapsed >= this.data.duration) { this.dismiss(); return; }
    this.raf = requestAnimationFrame(this.tick);
  };

  pause(): void { this.paused = true; }
  resume(): void { this.paused = false; }
  dismiss(): void {
    cancelAnimationFrame(this.raf);
    this.snackBarRef.dismiss();
  }
}
