import { Component,OnInit,ChangeDetectorRef } from '@angular/core';
import { HistorialhttpServices } from '../historial/services/historial-https.services';
import { DatePipe,CurrencyPipe } from '@angular/common';
import { NgApexchartsModule } from "ng-apexcharts"; // 1. Importar la librería
import { ActivatedRoute } from '@angular/router'; // Para leer parámetros
import { ClientesService } from '../clientes/services/clientes.service';
import { VentasHttpServices } from '../services/ventas-https.services';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexLegend
} from "ng-apexcharts";
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  // ... otras propiedades que necesites
};

@Component({
  selector: 'app-historial',
  imports: [NgApexchartsModule,DatePipe,CurrencyPipe],
  templateUrl: './historial.component.html',
  styleUrl: 'historial.component.scss',
})

export class HistorialComponent implements OnInit {
ventasHoy: number = 0;
chartData: any;
facturas: any[] = [];
loading: boolean = false;
//public chartOptions: Partial<ChartOptions> | any;
 public chartOptions: any = {
    series: [],
    chart: { type: 'area', height: 240 },
    xaxis: { categories: [] }
  };
  clienteFiltrado: string | null = null;
 constructor(
    private service: HistorialhttpServices,
    private clienteservice: ClientesService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private servicioimp: VentasHttpServices
    //private usuarioauth: AuthService,
  ) {} //el router se ocupa para navegar a pagnas, router.navigate
 async ngOnInit() {
  // Leemos los parámetros de la URL
    this.route.queryParams.subscribe(async params => {
      const id = params['clienteId'];
      //this.clienteFiltrado = params['nombre'] || null;
      if (id) {
      // 2. Si hay un ID, filtramos por ese cliente
       await this.cargarVentasFiltradas(id);
    } else {
    await this.cargarHistorial();
    }
  
  this.inicializarGrafico(id);
  });
  }
   async inicializarGrafico(idCliente?: any) {
  try{
    const stats = await this.service.getVentasPorDia(idCliente ? Number(idCliente) : undefined);
  
    this.chartOptions = {
    series: [{
      name: "Ventas (NIO)",
      data: stats.values
    }],
    chart: { type: "area", height: 300, toolbar: { show: false } },
    colors: ['#206bc4'], // Azul estilo Tabler
    xaxis: { categories: stats.labels,type: 'datetime' },
    stroke: { curve: 'smooth' },
    dataLabels: { enabled: false },
    // --- AQUÍ AÑADIMOS EL TOOLTIP PERSONALIZADO ---
    tooltip: {
      custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
        const total = series[seriesIndex][dataPointIndex];
        const cantidad = stats.cantidades[dataPointIndex];
        
        return `
          <div class="p-2 shadow-sm border-0">
            <div class="text-muted mb-1">${w.globals.categoryLabels[dataPointIndex]}</div>
            <div><strong>Monto:</strong> C$ ${total.toLocaleString()}</div>
            <div><strong>Facturas:</strong> ${cantidad}</div>
          </div>
        `;
      }
     }
    };
    this.cdr.detectChanges();
      } catch (error) {
        console.error("Error al cargar gráfico:", error);
      }
   }
  async cargarHistorial() {
    this.loading = true;
  console.log("Intentando cargar facturas...");
  try {
    // Llamamos al servicio (asegúrate de que el nombre coincida con tu servicio)
    const data = await this.service.getHistorial();
    
    console.log("Datos recibidos de Supabase:", data);
    
    if (data && data.length > 0) {
      this.facturas = data;
      this.inicializarGrafico();//aqui va el grafico
      //this.loading = false;
      //this.cdr.detectChanges();
    } else {
      console.warn("Supabase devolvió una lista vacía. ¿Hay registros en la tabla 'factura'?");
    }
  } catch (error) {
    console.error("Error fatal al cargar historial:", error);
  }
  finally {
    this.loading = false;
    this.cdr.detectChanges();
  }
}
  imprimir(id: any) {
    //window.print(); // Prueba básica de impresión
    this.loading = true; // Mostramos spinner de carga
      const facturaId = Number(id);
  // 1. Obtenemos toda la data (incluyendo detalles y cliente)
  this.servicioimp.getFacturaCompleta(facturaId).subscribe((factura) => {
          //this.generarPDFRollpaper(factura); });
          this.servicioimp.generarTicketPro(factura);
          this.loading = false;
          this.cdr.detectChanges();
        });
  }
  async cargarVentasFiltradas(id: string) {
  this.loading = true;
  this.facturas=[];
  try {
    // Asegúrate de tener este método en tu servicio
    const data = await this.clienteservice.getVentasPorCliente((id));
      this.facturas = data || [];
      } catch (error) {
      console.error("Error al filtrar:", error);
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); // Forzamos a Angular a pintar los nuevos datos
  
  }
}
}
