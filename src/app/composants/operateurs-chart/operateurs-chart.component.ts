import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { CommandesService } from '../../services/commandes.service';

interface OperateurConfig {
  nom: string;
  icone: string;
  colorLight: string;
  colorDark: string;
}

interface OperateurStat extends OperateurConfig {
  code: string;
  nombre: number;
  pourcentage: number;
}

// Ordre fixe (jamais recalcule selon le rang) -> chaine adjacente sure pour le daltonisme
const OPERATEURS_CONFIG: { code: string; config: OperateurConfig }[] = [
  { code: 'VODACOM_MPESA_COD', config: { nom: 'Vodacom M-Pesa', icone: 'fa-mobile-screen-button', colorLight: '#2a78d6', colorDark: '#3987e5' } },
  { code: 'ORANGE_COD', config: { nom: 'Orange Money', icone: 'fa-mobile-screen-button', colorLight: '#eb6834', colorDark: '#d95926' } },
  { code: 'AIRTEL_COD', config: { nom: 'Airtel Money', icone: 'fa-mobile-screen-button', colorLight: '#1baf7a', colorDark: '#199e70' } },
];

const AUTRE_CONFIG: OperateurConfig = { nom: 'Autre', icone: 'fa-wallet', colorLight: '#eda100', colorDark: '#c98500' };

@Component({
  selector: 'app-operateurs-chart',
  templateUrl: './operateurs-chart.component.html',
  styleUrls: ['./operateurs-chart.component.css']
})
export class OperateursChartComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('operateursChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart!: Chart;
  private themeObserver!: MutationObserver;

  stats: OperateurStat[] = [];
  totalCommandes = 0;
  chargement = true;

  constructor(private commandesService: CommandesService) {}

  ngOnInit(): void {
    this.chargerDonnees();
  }

  ngAfterViewInit(): void {
    this.themeObserver = new MutationObserver(() => {
      if (this.chart) {
        this.appliquerCouleursTheme();
        this.chart.update();
      }
    });
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
    if (this.themeObserver) {
      this.themeObserver.disconnect();
    }
  }

  private chargerDonnees(): void {
    this.chargement = true;

    this.commandesService.getToutesLesCommandes().subscribe({
      next: (reponse: any) => {
        const commandes = Array.isArray(reponse) ? reponse : reponse?.commandes;
        this.traiterDonnees(Array.isArray(commandes) ? commandes : []);
        this.chargement = false;
      },
      error: (erreur: any) => {
        console.error('Erreur lors du chargement des commandes (operateurs):', erreur);
        this.traiterDonnees([]);
        this.chargement = false;
      }
    });
  }

  private traiterDonnees(commandes: any[]): void {
    const compteurs = new Map<string, number>();

    commandes.forEach((commande: any) => {
      const code = commande.operateurPaiement || commande.modePaiement || 'INCONNU';
      compteurs.set(code, (compteurs.get(code) || 0) + 1);
    });

    this.totalCommandes = commandes.length;

    const stats: OperateurStat[] = [];

    OPERATEURS_CONFIG.forEach(({ code, config }) => {
      const nombre = compteurs.get(code) || 0;
      if (nombre > 0) {
        stats.push(this.construireStat(code, config, nombre));
      }
      compteurs.delete(code);
    });

    const nombreAutres = Array.from(compteurs.values()).reduce((somme, n) => somme + n, 0);
    if (nombreAutres > 0) {
      stats.push(this.construireStat('AUTRE', AUTRE_CONFIG, nombreAutres));
    }

    this.stats = stats;

    setTimeout(() => this.initChart(), 0);
  }

  private construireStat(code: string, config: OperateurConfig, nombre: number): OperateurStat {
    return {
      code,
      ...config,
      nombre,
      pourcentage: this.totalCommandes > 0 ? (nombre / this.totalCommandes) * 100 : 0
    };
  }

  private estThemeSombre(): boolean {
    return document.documentElement.classList.contains('dark');
  }

  private appliquerCouleursTheme(): void {
    if (!this.chart) {
      return;
    }
    const isDark = this.estThemeSombre();
    this.chart.data.datasets[0].backgroundColor = this.stats.map(stat => isDark ? stat.colorDark : stat.colorLight);
    (this.chart.data.datasets[0] as any).borderColor = isDark ? '#1a1a1a' : '#fcfcfb';
    (this.chart.options!.plugins as any).tooltip.backgroundColor = isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)';
    (this.chart.options!.plugins as any).tooltip.bodyColor = isDark ? '#ffffff' : '#1a1a1a';
  }

  private initChart(): void {
    if (!this.chartCanvas || this.stats.length === 0) {
      return;
    }

    const canvas = this.chartCanvas.nativeElement;
    const isDark = this.estThemeSombre();

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: this.stats.map(stat => stat.nom),
        datasets: [{
          data: this.stats.map(stat => stat.nombre),
          backgroundColor: this.stats.map(stat => isDark ? stat.colorDark : stat.colorLight),
          borderColor: isDark ? '#1a1a1a' : '#fcfcfb',
          borderWidth: 3,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
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
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context: any) => {
                const stat = this.stats[context.dataIndex];
                return ` ${stat.nombre} commande${stat.nombre > 1 ? 's' : ''} (${stat.pourcentage.toFixed(1)}%)`;
              }
            }
          }
        }
      }
    });
  }
}
