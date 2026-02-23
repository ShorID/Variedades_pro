import { Component, input, OnInit, output} from "@angular/core";
import { IconComponent } from '../../components/Icon/icon.component'
import { IModal } from "../interfaces/components.interface";
import { NgStyle, NgClass } from "@angular/common";

@Component({
    selector: "app-disableModal",
    template: `
                @if(modal().isOpen){
                    <div id="overlay" class="overlay" (click)="cancelar($event)">
                        <div class="modal-backdrop fade show"></div>

                        <div id="d-background" class="modal fade show d-block">
                            <div class="modal-dialog modal-sm" role="document">
                                <div class="modal-content">
                                    <button id="d-close" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" (click)="cancelar($event)"></button>
                                    <div
                                        class="modal-status bg-danger"
                                        [ngClass]="{'bg-danger': modal().item?.active, 'bg-success': !modal().item?.active}">
                                    </div>
                                    <div class="modal-body text-center py-4">
                                        <div class="d-flex justify-content-center mb-3 text-danger"
                                             [ngClass]="{'text-danger': modal().item?.active, 'text-success': !modal().item?.active}"   >
                                            <app-icon [name]="'CirclePower'" [size]="50"></app-icon>
                                        </div>
                                        <h3>{{modal().textQuestion}}</h3>
                                        <div class="text-secondary">
                                            {{modal().textAdditional}}
                                            <strong>{{modal().textbold}}</strong>
                                        </div>
                                    </div>
                                    <div class="modal-footer">
                                        <div class="w-100">
                                            <div class="row">
                                                <div class="col">
                                                    <a id="d-cancel" class="btn w-100" (click)="cancelar($event)"> Cancel </a>
                                                </div>
                                                <div class="col">
                                                    <a class="btn w-100" 
                                                        [ngClass]="{'btn-danger': modal().item?.active, 'btn-success': !modal().item?.active}"
                                                        data-bs-dismiss="modal" 
                                                        (click)="confirm($event)">
                                                        @if(modal().item?.active){ Deshabilitar } @else { Habilitar }
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                `,
    imports: [NgClass, IconComponent],
})

export class disableModalComponent implements OnInit {
    modal= input<IModal> ({isOpen: false, type: "", textQuestion: "", textAdditional: "", textbold: ""});
    onConfirm = output<Event>();

    constructor(){}

    confirm(e: Event) {
        this.onConfirm.emit(e);
    }

    cancelar(e:MouseEvent){
        const element = e.target as HTMLElement;
        if(["d-background", "d-cancel", "d-close"].includes(element.id)){
            this.modal().isOpen = false;
        }
    }

    ngOnInit() {}
}