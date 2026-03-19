import { Component, input, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import {} from '../../../components/Icon/icon.component';

@Component({
    selector: 'app-bodyDisable',
    template: `
        <div class="modal-body text-center py-4">
            <div class="d-flex justify-content-center mb-3 text-danger"
                [ngClass]="{'text-danger': status() === 'danger', 'text-success': status() === 'success'}">

            <ng-content select="[icon]"></ng-content>
            </div>
            <h3>{{textQuestion()}}</h3> 
            <div class="text-secondary">
                {{textAdditional()}}
                <strong>{{textbold()}}</strong>
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

export class bodyDisable implements OnInit {
    textQuestion = input<string> ("");
    textAdditional = input<string> ("");
    textbold = input<string> ("");
    status = input<string> ('success');

    constructor(){}

    ngOnInit(){}
}