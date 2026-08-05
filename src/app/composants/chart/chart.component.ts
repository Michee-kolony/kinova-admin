// chart.component.ts
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js/auto';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit, AfterViewInit, OnDestroy {
  
  @ViewChild('salesChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart!: Chart;
  private resizeTimer: any;

  ventesMensuelles = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [
      {
        label: 'Ventes 2024',
        data: [12000, 15000, 18000, 22000, 20000, 25000, 28000, 30000, 27000, 32000, 35000, 38000],
        backgroundColor: 'rgba(234, 179, 8, 0.12)',
        borderColor: '#eab308',
        borderWidth: 2.5,
        tension: 0.4,
        pointBackgroundColor: '#eab308',
        pointBorderColor: '#1d1d1d',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#fbbf24',
        fill: true
      },
      {
        label: 'Ventes 2023',
        data: [8000, 10000, 12000, 15000, 14000, 18000, 20000, 22000, 19000, 24000, 26000, 28000],
        backgroundColor: 'rgba(234, 179, 8, 0.06)',
        borderColor: 'rgba(234, 179, 8, 0.5)',
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: 'rgba(234, 179, 8, 0.5)',
        pointBorderColor: '#1d1d1d',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#fbbf24',
        fill: true,
        borderDash: [6, 4]
      }
    ]
  };

  getChartOptions(): ChartConfiguration['options'] {
    const isMobile = window.innerWidth < 640;
    const isTablet = window.innerWidth < 768;
    const isDark = document.documentElement.classList.contains('dark');

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: '#eab308',
          bodyColor: isDark ? '#ffffff' : '#1a1a1a',
          borderColor: 'rgba(234, 179, 8, 0.3)',
          borderWidth: 1,
          padding: isMobile ? 10 : 14,
          cornerRadius: 8,
          titleFont: {
            size: isMobile ? 11 : 13
          },
          bodyFont: {
            size: isMobile ? 10 : 12
          },
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ' : ';
              }
              if (context.parsed.y !== null) {
                const value = typeof context.parsed.y === 'number' ? context.parsed.y : 0;
                if (value >= 1000) {
                  label += (value / 1000).toFixed(1) + 'k $';
                } else {
                  label += value + ' $';
                }
              }
              return label;
            },
            title: function(context) {
              return context[0].label;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: isDark ? 'rgba(234, 179, 8, 0.06)' : 'rgba(234, 179, 8, 0.1)',
            tickColor: isDark ? 'rgba(234, 179, 8, 0.06)' : 'rgba(234, 179, 8, 0.1)'
          },
          border: {
            dash: [4, 4],
            color: isDark ? 'rgba(234, 179, 8, 0.15)' : 'rgba(234, 179, 8, 0.2)'
          },
          ticks: {
            color: isDark ? 'rgba(234, 179, 8, 0.4)' : 'rgba(234, 179, 8, 0.6)',
            font: {
              size: isMobile ? 9 : isTablet ? 10 : 11,
              family: "'Inter', sans-serif"
            },
            maxTicksLimit: isMobile ? 5 : 8,
            callback: function(value) {
              const numValue = typeof value === 'number' ? value : 0;
              if (numValue >= 1000) {
                return (numValue / 1000) + '$';
              }
              return numValue;
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          border: {
            color: isDark ? 'rgba(234, 179, 8, 0.15)' : 'rgba(234, 179, 8, 0.2)'
          },
          ticks: {
            color: isDark ? 'rgba(234, 179, 8, 0.4)' : 'rgba(234, 179, 8, 0.6)',
            font: {
              size: isMobile ? 9 : isTablet ? 10 : 11,
              family: "'Inter', sans-serif"
            },
            maxRotation: isMobile ? 45 : 0,
            autoSkip: true,
            maxTicksLimit: isMobile ? 6 : 12
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      elements: {
        point: {
          radius: isMobile ? 3 : 4,
          hoverRadius: isMobile ? 5 : 6
        },
        line: {
          borderWidth: isMobile ? 2 : 2.5
        }
      }
    };
  }

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initChart();
    // Observer les changements de thème
    this.observeThemeChanges();
  }

  // Observer les changements de thème pour mettre à jour le graphique
  observeThemeChanges(): void {
    const observer = new MutationObserver(() => {
      if (this.chart) {
        const newOptions = this.getChartOptions();
        Object.assign(this.chart.options, newOptions);
        this.chart.update();
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      if (this.chart) {
        const newOptions = this.getChartOptions();
        Object.assign(this.chart.options, newOptions);
        this.chart.update();
      }
    }, 250);
  }

  initChart(): void {
    const canvas = this.chartCanvas.nativeElement;
    if (canvas) {
      this.chart = new Chart(canvas, {
        type: 'line',
        data: this.ventesMensuelles,
        options: this.getChartOptions()
      });
    }
  }

  updateChartData(newData: any[]): void {
    if (this.chart) {
      this.chart.data.datasets[0].data = newData;
      this.chart.update();
    }
  }

  addDataset(label: string, data: any[]): void {
    if (this.chart) {
      this.chart.data.datasets.push({
        label: label,
        data: data,
        backgroundColor: 'rgba(234, 179, 8, 0.08)',
        borderColor: '#eab308',
        borderWidth: 2.5,
        tension: 0.4,
        pointBackgroundColor: '#eab308',
        pointBorderColor: '#1d1d1d',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true
      });
      this.chart.update();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
    clearTimeout(this.resizeTimer);
  }
}