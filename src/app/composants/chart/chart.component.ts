import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { CommandesService } from '../../services/commandes.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit, AfterViewInit, OnDestroy {
  
  @ViewChild('salesChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart!: Chart;
  private resizeTimer: any;

  // Données réelles des commandes
  commandesData: any[] = [];
  ventesMensuelles: any = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [
      {
        label: 'Ventes 2026',
        data: Array(12).fill(0),
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
      }
    ]
  };

  // Statistiques
  statistiques = {
    totalCommandes: 0,
    montantTotal: 0,
    moisPlusCommandes: '',
    nbCommandesMoisPlus: 0,
    moisPlusVentes: '',
    montantMoisPlusVentes: 0,
    commandesParMois: Array(12).fill(0),
    ventesParMois: Array(12).fill(0)
  };

  // Propriétés pour le template
  today: Date = new Date();
  currentYear: number = new Date().getFullYear();

  constructor(
    private commandesService: CommandesService
  ) {}

  ngOnInit(): void {
    this.chargerDonnees();
  }

  ngAfterViewInit(): void {
    // Le graphique sera initialisé après le chargement des données
    setTimeout(() => {
      if (this.ventesMensuelles.datasets[0].data.some((v: number) => v > 0)) {
        this.initChart();
      }
    }, 500);

    // Observer les changements de thème
    this.observeThemeChanges();
  }

  // Charger les données des commandes
  chargerDonnees(): void {
    this.commandesService.getToutesLesCommandes().subscribe({
      next: (reponse: any) => {
        if (reponse && reponse.commandes) {
          this.commandesData = reponse.commandes;
          this.traiterDonneesCommandes();
        }
      },
      error: (erreur: any) => {
        console.error('Erreur lors du chargement des commandes:', erreur);
        // Utiliser des données de démonstration en cas d'erreur
        this.utiliserDonneesDemo();
      }
    });
  }

  // Traiter les données des commandes
  traiterDonneesCommandes(): void {
    const commandes = this.commandesData;
    
    // Initialiser les tableaux pour chaque mois (0-11)
    const commandesParMois = Array(12).fill(0);
    const montantParMois = Array(12).fill(0);
    let totalCommandes = commandes.length;
    let montantTotal = 0;

    // Parcourir toutes les commandes
    commandes.forEach((commande: any) => {
      const date = new Date(commande.createdAt);
      const mois = date.getMonth(); // 0-11
      
      // Compter les commandes par mois
      commandesParMois[mois] += 1;
      
      // Additionner les montants (en supposant que les montants sont déjà en USD)
      const montant = commande.montantAPayer || 0;
      montantParMois[mois] += montant;
      montantTotal += montant;
    });

    // Mettre à jour les statistiques
    this.statistiques.totalCommandes = totalCommandes;
    this.statistiques.montantTotal = montantTotal;
    this.statistiques.commandesParMois = commandesParMois;
    this.statistiques.ventesParMois = montantParMois;

    // Trouver le mois avec le plus de commandes
    const maxCommandes = Math.max(...commandesParMois);
    const moisMaxIndex = commandesParMois.indexOf(maxCommandes);
    if (maxCommandes > 0) {
      const moisNoms = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
      this.statistiques.moisPlusCommandes = moisNoms[moisMaxIndex];
      this.statistiques.nbCommandesMoisPlus = maxCommandes;
    } else {
      this.statistiques.moisPlusCommandes = 'Aucune donnée';
      this.statistiques.nbCommandesMoisPlus = 0;
    }

    // Trouver le mois avec le plus de ventes (montant)
    const maxVentes = Math.max(...montantParMois);
    const moisVentesMaxIndex = montantParMois.indexOf(maxVentes);
    if (maxVentes > 0) {
      const moisNoms = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
      this.statistiques.moisPlusVentes = moisNoms[moisVentesMaxIndex];
      this.statistiques.montantMoisPlusVentes = maxVentes;
    } else {
      this.statistiques.moisPlusVentes = 'Aucune donnée';
      this.statistiques.montantMoisPlusVentes = 0;
    }

    // Mettre à jour les données du graphique
    this.ventesMensuelles.datasets[0].data = montantParMois;
    this.ventesMensuelles.datasets[0].label = `Ventes ${this.currentYear}`;

    // Initialiser le graphique si le canvas est prêt
    if (this.chartCanvas) {
      this.initChart();
    }
  }

  // Données de démonstration (au cas où l'API ne répond pas)
  utiliserDonneesDemo(): void {
    const commandesDemo = [
      { createdAt: '2026-08-05T21:05:53.861Z', montantAPayer: 833.25 },
      { createdAt: '2026-08-05T20:53:07.255Z', montantAPayer: 458.90 },
      { createdAt: '2026-08-05T07:57:55.854Z', montantAPayer: 75.00 }
    ];
    this.commandesData = commandesDemo;
    this.traiterDonneesCommandes();
  }

  // Observer les changements de thème
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

  // ✅ FORMATER LES MONTANTS EN USD
  formatMontantUSD(montant: number): string {
    if (montant >= 1000000) {
      return '$' + (montant / 1000000).toFixed(1) + 'M';
    } else if (montant >= 1000) {
      return '$' + (montant / 1000).toFixed(1) + 'K';
    } else {
      return '$' + montant.toFixed(2);
    }
  }

  // Arrondir les nombres pour le template
  roundNumber(value: number): number {
    return Math.round(value);
  }

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
            label: function(context: any) {
              let label = context.dataset.label || '';
              if (label) {
                label += ' : ';
              }
              if (context.parsed.y !== null) {
                const value = typeof context.parsed.y === 'number' ? context.parsed.y : 0;
                if (value >= 1000000) {
                  label += '$' + (value / 1000000).toFixed(1) + 'M';
                } else if (value >= 1000) {
                  label += '$' + (value / 1000).toFixed(1) + 'K';
                } else {
                  label += '$' + value.toFixed(2);
                }
              }
              return label;
            },
            title: function(context: any) {
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
            callback: function(value: any) {
              const numValue = typeof value === 'number' ? value : 0;
              if (numValue >= 1000000) {
                return '$' + (numValue / 1000000) + 'M';
              } else if (numValue >= 1000) {
                return '$' + (numValue / 1000) + 'K';
              }
              return '$' + numValue;
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

  initChart(): void {
    const canvas = this.chartCanvas.nativeElement;
    if (canvas) {
      // Détruire le graphique existant s'il y en a un
      if (this.chart) {
        this.chart.destroy();
      }
      
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