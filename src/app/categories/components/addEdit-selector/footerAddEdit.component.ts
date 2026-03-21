import { Component, OnInit, input, output } from '@angular/core';

@Component({
    selector:'app-footerAddEdit',
    template: `
         <div class="modal-footer">
            <div class="w-100">
                <div class="row">
                    <div class="col">
                        <a id="d-cancel" class="btn w-100" (click)="close($event)"> Cancelar </a>
                    </div>
                    <div class="col">
                        <a class="btn w-100 btn-primary" (click)="confirm($event)">
                            Guardar
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `,
    imports: []
})

export class footerAddEditComponent implements OnInit {
    Maction = input<string> ("save");

    onConfirm = output<Event> ();
    onClose = output<boolean> ();

    constructor(){}

    confirm(e: Event) { this.onConfirm.emit(e); }

    close(e:MouseEvent){
        const element = e.target as HTMLElement;
        if(["d-cancel"].includes(element.id)){
            this.onClose.emit(false);
        }
    }

    ngOnInit(){}
}