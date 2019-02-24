import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {ParentQuery} from "./second-file";

@Component({
  selector: 'app-home',
  template: '<span #mySpan #dynamic>Home</span>'
})
export class HomeComponent extends ParentQuery implements OnInit {
  @ViewChild('mySpan', {read: 'existingProp'}) spanQuery: ElementRef<HTMLSpanElement>;
  @ViewChild('dynamic', {}) dynamicQuery: ElementRef<HTMLElement>;

  ngOnInit() {
    this.spanQuery.nativeElement.addEventListener('click', () => {
      // noop
    });

    this.test();
  }

  ngAfterViewInit() {
    this.dynamicQuery.nativeElement.click();
  }

  test() {
    this.testParent.nativeElement.classList.add('testClass');
  }
}
