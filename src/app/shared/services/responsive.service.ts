import { Injectable, inject } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ResponsiveService {
  private readonly observer = inject(BreakpointObserver);

  private readonly breakpoints = {
    mobile: '(max-width: 768px)',
    tablet: '(min-width: 769px) and (max-width: 1024px)',
    desktop: '(min-width: 1025px)',
  };

  isMobile = toSignal(
    this.observer.observe(this.breakpoints.mobile).pipe(map(r => r.matches)),
    { initialValue: false }
  );

  isTablet = toSignal(
    this.observer.observe(this.breakpoints.tablet).pipe(map(r => r.matches)),
    { initialValue: false }
  );

  isDesktop = toSignal(
    this.observer.observe(this.breakpoints.desktop).pipe(map(r => r.matches)),
    { initialValue: true }
  );
}
