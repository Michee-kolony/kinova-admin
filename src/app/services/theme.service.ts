import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private darkClass = 'dark';

  constructor() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.enableDark();
    } else {
      this.enableLight();
    }
  }

  enableDark() {
    document.documentElement.classList.add(this.darkClass);
    localStorage.setItem('theme', 'dark');
  }

  enableLight() {
    document.documentElement.classList.remove(this.darkClass);
    localStorage.setItem('theme', 'light');
  }

  toggleTheme() {
    if (document.documentElement.classList.contains(this.darkClass)) {
      this.enableLight();
    } else {
      this.enableDark();
    }
  }

  isDark(): boolean {
    return document.documentElement.classList.contains(this.darkClass);
  }
}