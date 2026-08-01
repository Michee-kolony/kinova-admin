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
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    borderColor: '#FFC107',
    borderWidth: 3,
    tension: 0.4,
    pointBackgroundColor: '#FFC107',
    pointBorderColor: '#fff',
    pointRadius: 5,
    pointHoverRadius: 7,
    fill: true
  },
  {
    label: 'Ventes 2023',
    data: [8000, 10000, 12000, 15000, 14000, 18000, 20000, 22000, 19000, 24000, 26000, 28000],
    backgroundColor: 'rgba(184, 134, 11, 0.12)',
    borderColor: '#B8860B',
    borderWidth: 3,
    tension: 0.4,
    pointBackgroundColor: '#B8860B',
    pointBorderColor: '#fff',
    pointRadius: 5,
    pointHoverRadius: 7,
    fill: true
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
        title: {
          display: true,
          text: 'Évolution des Ventes Mensuelles',
          font: {
            size: 18,
            weight: 'bold'
          }
        },
        legend: {
          labels: {
            font: {
              size: 14
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                // Correction : s'assurer que la valeur est un nombre
                const value = typeof context.parsed.y === 'number' ? context.parsed.y : 0;
                label += new Intl.NumberFormat('fr-FR', { 
                  style: 'currency', 
                  currency: 'EUR' 
                }).format(value);
              }
              return label;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              // Correction : s'assurer que la valeur est un nombre
              const numValue = typeof value === 'number' ? value : 0;
              return new Intl.NumberFormat('fr-FR', { 
                style: 'currency', 
                currency: 'EUR',
                maximumFractionDigits: 0 
              }).format(numValue);
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
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
        backgroundColor: color + '40',
        borderColor: color,
        borderWidth: 2,
        tension: 0.4
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