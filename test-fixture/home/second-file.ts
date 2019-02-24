import {ElementRef, ViewChild} from "@angular/core";

export class ParentQuery {
  @ViewChild('testParent') testParent: ElementRef<HTMLElement>;

}
