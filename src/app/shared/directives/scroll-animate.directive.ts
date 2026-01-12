import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appScrollAnimate]'
})
export class ScrollAnimateDirective implements OnInit, OnDestroy {
  @Input('appScrollAnimate') animationClass!: string;
  private observer!: IntersectionObserver;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

 ngOnInit(): void {
  // Start hidden + offset depending on direction
  this.renderer.addClass(this.el.nativeElement, 'before-show');

  if (this.animationClass === 'fade-in-up') {
    this.renderer.addClass(this.el.nativeElement, 'before-show-up');
  }
  if (this.animationClass === 'fade-in-left') {
    this.renderer.addClass(this.el.nativeElement, 'before-show-left');
  }
  if (this.animationClass === 'fade-in-right') {
    this.renderer.addClass(this.el.nativeElement, 'before-show-right');
  }

  this.observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.renderer.addClass(this.el.nativeElement, this.animationClass);
          this.observer.unobserve(this.el.nativeElement);
        }
      });
    },
    {
      threshold: 0.3,          // wait until 30% visible
      rootMargin: '0px 0px -10% 0px' // trigger a bit later
    }
  );

  this.observer.observe(this.el.nativeElement);
}

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
