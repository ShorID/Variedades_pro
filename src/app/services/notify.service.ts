import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class NotifyService {
  constructor(private toastr: ToastrService) {}

  success(msg: string, title?: string) {
    this.toastr.success(msg, title);
  }
  error(msg: string, title?: string) {
    this.toastr.error(msg, title);
  }
  info(msg: string, title?: string) {
    this.toastr.info(msg, title);
  }
}
