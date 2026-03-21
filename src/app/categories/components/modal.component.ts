import { Component, input, OnInit, output } from "@angular/core";
import { NgStyle, NgClass } from "@angular/common";
import { IconComponent } from "../../components/Icon/icon.component" 
import { IaddEditModal, IdisableModal } from '../interfaces/components.interface';

@Component({
    selector: "app-modal",
    template: `
                @if(isOpen()){
                    <div id="overlay" class="overlay" (click)="close($event)">
                        <div class="modal-backdrop fade show"></div>

                        <div id="d-background" class="modal fade show d-block">
                            <div class="modal-dialog" [ngClass]="{'modal-sm': Msize() == 'small', 'modal-lg': Msize() == 'large'}" role="document">  
                                <div class="modal-content">

                                    @if(Mheader()){
                                        <ng-content select="[header]"></ng-content>
                                    }

                                    @if(!Mheader() && Mbuttonclose()){
                                        <button id="d-close" type="button" class="btn-close" aria-label="Close" (click)="close($event)"></button>
                                    }

                                    @if(Mbadges() !== ""){
                                        <div
                                            class="modal-status bg-danger"
                                            [ngClass]="{'bg-danger': Mbadges() ===  'danger', 'bg-success': Mbadges() ===  'success'}">
                                        </div>
                                    }

                                    <!-- <div class="modal-body text-center py-4"> -->
                                    <ng-content select="[body]"></ng-content>
                                    <!-- </div> -->

                                    @if(Mfooter()){
                                        <!-- <div class="modal-footer"> -->
                                        <ng-content select="[footer]"></ng-content>
                                        <!-- </div> -->
                                    }

                                </div>
                            </div>
                        </div>
                    </div>
                }
                `,
    imports: [NgClass]
})

export class modalComponent implements OnInit{
    isOpen = input<boolean>(false);
    onClose = output<boolean>();
    
    Mtitle = input <string> ("");
    Msize = input <string> ("small"); //puede ser small o large
    Mbadges =  input<string> ("");
    Mheader = input <boolean> (true);
    Mfooter = input <boolean> (true);
    Mbuttonclose =  input <boolean> (false);

    constructor(){}

    close(e:MouseEvent){
        const element = e.target as HTMLElement;
        if(["d-background", "d-close"].includes(element.id)){
            this.onClose.emit(false);
        }
    }

    ngOnInit() {}
}