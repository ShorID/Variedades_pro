import { Component,OnInit, OnDestroy,ChangeDetectorRef,HostListener } from '@angular/core';
import { homehttpServices } from './services/home-http.services';
import { interval, Subscription } from 'rxjs';
import { DatePipe,CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'home',
  templateUrl: './home.component.html',
  imports: [DatePipe,CurrencyPipe,RouterModule]
  
})
export class HomeComponent implements OnInit, OnDestroy {
  
  private refreshSub?: Subscription; // Para guardar el temporizador
  cargando: boolean = false; // Para mostrar un pequeño indicador visual

  estadisticas = {
    totalVentas: 0,
    cantidadVentas: 0,
    ganancia: 0
  };
  productosBajos: any[] = [];
  ultimasVentas: any[] = [];
  esAdministrador: boolean = false; // Aquí validarías el rol del usuario
  constructor(private service: homehttpServices,private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit() {
    // 2. Configurar el auto-refresh cada 5 minutos
    // 1000ms * 60 * 5 = 300,000
    this.refreshSub = interval(300000).subscribe(() => {
      console.log('Actualizando datos del inicio automáticamente...');
      this.cargarDatos();
    });
    this.esAdministrador = this.service.getRolUsuario() === 'ADMIN';
  }

  // ¡CRÍTICO! Limpiar el temporizador al cerrar la pantalla
  ngOnDestroy() {
    if (this.refreshSub) {
      this.refreshSub.unsubscribe();
    }
  }

  async cargarDatos() {
    this.cargando = true;
    this.cdr.markForCheck();

  try {
    // Disparamos ambas consultas en paralelo
    const [productos, ventas] = await Promise.all([
      this.service.getStockBajo(10), // Traer los que tienen menos de 10
      this.service.getVentasHoy()
    ]);

    // Asignamos a las listas del HTML
    this.productosBajos = productos;
    this.ultimasVentas = ventas;

    // Calculamos las estadísticas del día
    this.estadisticas.cantidadVentas = ventas.length;
    this.estadisticas.totalVentas = ventas.reduce((acc, v) => acc + (v.total || 0), 0);

    // Solo si es ADMIN calculamos la ganancia
    if (this.esAdministrador) {
      // Ganancia = Total Venta - Costo de Compra
      this.estadisticas.ganancia = ventas.reduce((acc, v) => {
        return acc + ((v.total || 0) - (v.costo_total || 0));
      }, 0);
    }

    this.cdr.markForCheck(); // Notificamos a Angular del cambio de datos

    } catch (error) {
    console.error("Error cargando el Dashboard:", error);
    }
  }

  // Este decorador escucha las teclas en toda la ventana del navegador
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Verificamos si la tecla presionada es F2
    if (event.key === 'F2') {
      // Evitamos que el navegador haga su función por defecto (como abrir ayuda)
      event.preventDefault();
      
      console.log('F2 presionado: Navegando a Facturación...');
      this.router.navigate(['/check-in']); // Asegúrate que esta ruta sea la correcta
    }
  }

}

