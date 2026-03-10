import { Component, OnInit,ChangeDetectorRef,EventEmitter, Output,Input } from '@angular/core';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientesService } from './services/clientes.service';
import { Router } from '@angular/router'; // Importa el Router

@Component({
  //selector: 'app-cliente.component', //le quitare el .compnent, para ver que pasa sino funciona lo devuelvo
  selector: 'app-cliente',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, TitleCasePipe, FormsModule],
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.scss',
})
export class ClienteComponent implements OnInit {
  clientes: any[] = [];
  filtroNombre: string = '';
  loading: boolean = true;
  // Estadísticas rápidas
  totalClientes: number = 0;
  clientesActivos: number = 0;
  showModal = false;
  // Objeto para el nuevo cliente
  nuevoClienteObj: any = {
  nombre: '',
  personeria: 'Natural', // Valor por defecto
  telefono: '',
  direccion: '',
  clasificacion: 'Minorista', // Valor por defecto
  identificacion: ''
};  
  // Añade esta variable
  isEditing = false;
  //esta para salvar
  isSaving = false; // Variable para controlar el estado del botón
  //para que el formulario sepa que guardo desde la facturacion
  @Output() clienteGuardado = new EventEmitter<any>();
  //esto es para que solose ve el modal de clientes
  @Input() soloModal: boolean = false;
  constructor(private service: ClientesService,private router: Router,private cdr: ChangeDetectorRef) {}
  async ngOnInit() {
    await this.cargarClientes();
  }


  async cargarClientes() {
   this.loading = true;
    try {
      const data = await this.service.obtener_Clientes();
      if (data) {
        this.clientes = data;
        
        // Calculamos las estadísticas reales
        this.totalClientes = this.clientes.length;
        this.clientesActivos = this.clientes.filter(c => c.activo === 'true').length;
      }
    } catch (error) {
      console.error("No se pudieron cargar los clientes:", error);
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); // Forzamos a que la tabla se dibuje
    }
  }

  abrirModal() {
    this.showModal = true;
  }

  cerrarModal() {
    
    this.showModal = false;
    this.isEditing = false; // Importante resetear esto
    this.isSaving = false;
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.nuevoClienteObj = { nombre: '', telefono: '', email: '', direccion: '' ,identificacion: '',personeria: 'Natural' ,clasificacion: 'Minorista' };
  }
  async guardarCliente() {
    
  if (!this.nuevoClienteObj.nombre || !this.nuevoClienteObj.telefono) {
    // Puedes usar SweetAlert2 aquí para que se vea mejor que un alert normal
    alert("Por favor rellena los campos obligatorios.");
    return;
  }
    this.isSaving = true; // 1. Bloqueamos el botón
  try {
    let respuesta: any;
    //const respuesta = await this.service.saveClienteRPC(this.nuevoClienteObj);
    if (this.isEditing) {
      respuesta=await this.service.updateClienteRPC(this.nuevoClienteObj);
    } else {
      respuesta=await this.service.saveClienteRPC(this.nuevoClienteObj);
      
    }
    if (respuesta.status === 'success') {
      console.log("Cliente guardado con ID:", respuesta.id);
      const clienteFinal = { 
        ...this.nuevoClienteObj, 
        id: respuesta.id 
        };

        // Emitimos el objeto COMPLETO (con nombre, identificación, etc.)
      this.clienteGuardado.emit(clienteFinal);
      } else {
      alert("Error de DB: " + respuesta.message);
    }
    this.cerrarModal();
    this.isEditing = false;
    this.isSaving = false;
    await this.cargarClientes();

    
      //this.cerrarModal();
      //await this.cargarClientes(); // Refresca la tabla automáticamente
    
  } catch (err) {
    alert("Error de conexión con el servidor");
  }
  finally {
    // Esto se ejecuta SIEMPRE, falle o no, para liberar el botón
    this.isSaving = false;
    this.isEditing = false;
  }
}

verCompras(cliente: any) {
  // Navegamos a /history pasando el ID como parámetro de consulta (queryParam)
  this.router.navigate(['/history'], { 
    queryParams: { clienteId: cliente.id, nombre: cliente.nombre } 
  });
}

abrirModalEditar(cliente: any) {
  this.isEditing = true;
  // Creamos una copia para no modificar la tabla antes de guardar
  this.nuevoClienteObj = { ...cliente }; 
  this.showModal = true;
}

async eliminarCliente(id: number) {
  if (confirm('¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.')) {
    try {
      await this.service.deleteClienteRPC(id);
      await this.cargarClientes(); // Refrescar lista
    } catch (err) {
      alert("No se pudo eliminar el cliente.");
    }
  }
}

// // En tu clientes.component.ts
// @Input() set nombrePredefinido(val: string) {
//   if (val) this.nuevoClienteObj.nombre = val;
// }

abrirDesdeVentas(nombre?: string) {
  this.isEditing = false;
  this.isSaving = false;
  this.limpiarFormulario(); // Tu función de limpieza
  if (nombre) {
    this.nuevoClienteObj = { 
    nombre: nombre,
    personeria: 'Natural',
    clasificacion: 'Minorista'
  }
  this.showModal = true;
}

/*
// Dentro de tu función guardarCliente(), en el éxito de la respuesta:
if (respuesta.status === 'success') {
   this.clienteGuardado.emit(this.nuevoClienteObj);
   this.cerrarModal();
}
   */
}

}
