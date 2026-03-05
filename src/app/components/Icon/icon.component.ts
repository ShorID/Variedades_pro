import { Component, computed, input, OnInit } from '@angular/core';
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
  Search,
  CirclePower 
  CircleUser,
  Shirt,
  Handbag,
  LucideIconData,
  Barcode,
  RefreshCcw,
  Pencil,
  Trash,
  Search,
  X,
} from 'lucide-angular';

const lucidIconsObj = {
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
  CircleUser,
  Shirt,
  Handbag,
  Barcode,
  RefreshCcw,
  Pencil,
  Trash,
  Search,
  X,
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
  Search,
  CirclePower
};
type LucidIconsType = keyof typeof lucidIconsObj;

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  imports: [LucideAngularModule],
})
export class IconComponent implements OnInit {
  icons: Record<string, LucideIconData> = lucidIconsObj;
  name = input<LucidIconsType | string>('House');
  size = input<number | string>(24);
  iconClass = input<string>('d-block');
  isTablerIcon = computed(() => !(this.name() in this.icons));

  lucidIcon = computed<LucideIconData | undefined>(() => {
    return this.name() in this.icons ? this.icons[this.name()] : undefined;
  });

  get classes(): string | string[] {
    if (this.lucidIcon()) return this.iconClass();
    else return ['ti', 'ti-' + this.name(), this.iconClass().split(' ')].flat();
  }

  constructor() {}

  ngOnInit() {}
}
