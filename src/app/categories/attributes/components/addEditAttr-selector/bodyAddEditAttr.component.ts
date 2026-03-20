import { Component, input, OnInit, output } from '@angular/core';
import { FormsModule } from '@angular/forms'

@Component({
    selector:'app-bodyAddEditAttr',
    template: `
        <div class="modal-body py-4">
            <ng-content select="[dropdown]"></ng-content>
            <ng-content select="[input]"></ng-content>
        </div>
    `,
    imports: [FormsModule]
})

export class bodyAddEditAttrComponent implements OnInit {
    inputValue: string = "";

    constructor(){}

    submit(){ return this.inputValue; }

    ngOnInit(){}
}