import { Component, input, OnInit } from '@angular/core';
import {
  BadgeDollarSign,
  Boxes,
  House,
  Shapes,
  Store,
  UsersRound,
  Warehouse,
  LucideAngularModule,
  ArrowBigLeft,
  MapPinHouse,
  CircleAlert,
  FolderOpen,
  Folder,
  Plus,
  Package,
  Tag,
  Star,
  RefreshCcw,
  ChevronRight,
  ChevronLeft,
  Pencil,
  Ellipsis,
  Search
} from 'lucide-angular';

const AllIcons = {
  Warehouse,
  Store,
  House,
  BadgeDollarSign,
  Boxes,
  Shapes,
  UsersRound,
  ArrowBigLeft,
  MapPinHouse,
  CircleAlert,
  FolderOpen,
  Folder,
  Plus,
  Package,
  Tag,
  Star,
  RefreshCcw,
  ChevronRight,
  ChevronLeft,
  Pencil,
  Ellipsis,
  Search
};
type AllIconsType = keyof typeof AllIcons;

@Component({
  selector: 'app-icon',
  template: ` <lucide-icon [img]="icons[name()]" [size]="size()" class="d-block" /> `,
  imports: [LucideAngularModule],
})
export class IconComponent implements OnInit {
  icons = AllIcons;
  name = input<AllIconsType>('House');
  size = input<number>(24);
  constructor() {}

  ngOnInit() {}
}
