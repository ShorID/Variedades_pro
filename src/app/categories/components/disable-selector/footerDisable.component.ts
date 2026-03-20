import { Component, input, OnInit, output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-footerDisable',
    template: `
        <div class="modal-footer">
            <div class="w-100">
                <div class="row">
                    <div class="col">
                        <a id="d-cancel" class="btn w-100" (click)="cancelar($event)"> Cancel </a>
                    </div>
                    <div class="col">
                        <a class="btn w-100" 
                            [ngClass]="{'btn-danger': status() === 'danger', 'btn-success': status() === 'success'}"
                            data-bs-dismiss="modal" 
                            (click)="confirm($event)">
                            @if(status() === 'danger'){ Deshabilitar } @else { Habilitar }
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles:`
        :host {
            display: block;
            width: 100%;
        }
    `,
    imports: [NgClass]
})

export class footerDisable implements OnInit {
    status = input<string> ("success");
    onCancel = output<boolean> ();
    onConfirm = output<Event>();

    constructor(){}

    ngOnInit(){}

    cancelar(e:MouseEvent){
        const element = e.target as HTMLElement;
        if(["d-cancel"].includes(element.id)){
            this.onCancel.emit(false);
        }
    }

    confirm(e: Event) {
        this.onConfirm.emit(e);
    }
}