import { Component, input, OnInit, output } from '@angular/core';

@Component({
    selector:'app-headerManageAttrValue',
    template: `
        <div class="modal-header">
            <h5 class="modal-title">{{Mtitle()}}</h5>
            <button id="d-close" type="button" class="btn-close" (click)="close($event)"></button>
        </div>
    `,
    styles:`
        :host {
            display: block;
            width: 100%;
        }
    `,
    imports: []
})

export class headerManageAttrValue implements OnInit {
    Mtitle = input<string> ("");
    
    onClose = output<boolean> ();

    constructor(){}

    close(e:MouseEvent){
        const element = e.target as HTMLElement;
        if(["d-close"].includes(element.id)){
            this.onClose.emit(false);
        }
    }

    ngOnInit(){}

}