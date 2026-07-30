import { Component, HostListener, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-kinova',
  templateUrl: './kinova.component.html',
  styleUrls: ['./kinova.component.css']
})
export class KinovaComponent implements OnInit {

  showScrollButton = false;

  constructor(private router: Router) {}

  ngOnInit(): void {

    // Remonter automatiquement en haut à chaque changement de page
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });

  }


  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.showScrollButton = window.pageYOffset > 150;
  }


  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

}