import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js/auto';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit, AfterViewInit, OnDestroy {
  
  @ViewChild('salesChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart!: Chart;
  
  ventesMensuelles = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [
      {
        label: 'Ventes 2024',
        data: [12000, 15000, 18000, 22000, 20000, 25000, 28000, 30000, 27000, 32000, 35000, 38000],
        backgroundColor: 'rgba(234, 179, 8, 0.12)',
        borderColor: '#eab308',
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: '#eab308',
        pointBorderColor: '#000000',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
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
        pointBorderColor: '#000000',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#fbbf24',
        fill: true,
        borderDash: [6, 4]
      }
    ]
  };

  chartConfig: ChartConfiguration = {
    type: 'line',
    data: this.ventesMensuelles,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          titleColor: '#eab308',
          bodyColor: '#ffffff',
          borderColor: 'rgba(234, 179, 8, 0.3)',
          borderWidth: 1,
          padding: 14,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ' : ';
              }
              if (context.parsed.y !== null) {
                const value = typeof context.parsed.y === 'number' ? context.parsed.y : 0;
                label += new Intl.NumberFormat('fr-FR', { 
                  style: 'currency', 
                  currency: 'EUR',
                  maximumFractionDigits: 0
                }).format(value);
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
            color: 'rgba(234, 179, 8, 0.08)',
            tickColor: 'rgba(234, 179, 8, 0.08)'
          },
          border: {
            dash: [4, 4],
            color: 'rgba(234, 179, 8, 0.2)'
          },
          ticks: {
            color: 'rgba(234, 179, 8, 0.5)',
            font: {
              size: 11,
              family: "'Inter', sans-serif"
            },
            callback: function(value) {
              const numValue = typeof value === 'number' ? value : 0;
              if (numValue >= 1000) {
                return (numValue / 1000) + 'k $';
              }
              return numValue + '$';
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          border: {
            color: 'rgba(234, 179, 8, 0.2)'
          },
          ticks: {
            color: 'rgba(234, 179, 8, 0.5)',
            font: {
              size: 11,
              family: "'Inter', sans-serif"
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  };

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initChart();
  }

  initChart(): void {
    const canvas = this.chartCanvas.nativeElement;
    if (canvas) {
      this.chart = new Chart(canvas, this.chartConfig);
    }
  }

  updateChartData(newData: any[]): void {
    if (this.chart) {
      this.chart.data.datasets[0].data = newData;
      this.chart.update();
    }
  }

  addDataset(label: string, data: any[], color: string): void {
    if (this.chart) {
      this.chart.data.datasets.push({
        label: label,
        data: data,
        backgroundColor: 'rgba(234, 179, 8, 0.08)',
        borderColor: '#eab308',
        borderWidth: 2.5,
        tension: 0.4,
        pointBackgroundColor: '#eab308',
        pointBorderColor: '#000000',
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
  }
}