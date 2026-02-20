import { Component, input, OnInit, output} from "@angular/core";
import { IconComponent } from '../../components/Icon/icon.component'
import { IModal } from "../interfaces/components.interface";
import { NgStyle, NgClass } from "@angular/common";

@Component({
    selector: "app-disableModal",
    template: `
                <div class="modal" [id]="id()" [ngStyle]="{'display': modal().isOpen ? 'block' : 'none'}" tabindex="-1">
                    <div class="modal-dialog modal-sm" role="document">
                        <div class="modal-content">
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            <div
                                class="modal-status bg-danger"
                                [ngClass]="{'bg-danger': modal().item?.active, 'bg-success': !modal().item?.active}">
                            </div>
                            <div class="modal-body text-center py-4">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                     class="icon mb-2 text-danger icon-lg" width="24" height="24"
                                     viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                                     stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <path d="M12 9v2m0 4v.01" />
                                    <path d="M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75" />
                                </svg>
                                <h3>{{modal().textQuestion}}</h3>
                                <div class="text-secondary">
                                    {{modal().textAdditional}}
                                    <strong>{{modal().item?.name}}</strong>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <div class="w-100">
                                    <div class="row">
                                        <div class="col">
                                            <a href="#" class="btn w-100" data-bs-dismiss="modal"> Cancel </a>
                                        </div>
                                        <div class="col">
                                            <a  href="#" 
                                                class="btn w-100" 
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
                `,
    imports: [NgStyle, NgClass],
})

export class disableModalComponent implements OnInit {
    id= input<string>('');
    modal= input<IModal> ({isOpen: false, type: "", textQuestion: "", textAdditional: ""});
    onConfirm = output<Event>();

    constructor(){}

    confirm(e: Event) {
        this.onConfirm.emit(e);
    }

    ngOnInit() {}
}