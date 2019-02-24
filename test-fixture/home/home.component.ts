import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {ParentQuery} from "./second-file";

@Component({
  selector: 'app-home',
  template: '<span #mySpan>Home</span>'
})
export class HomeComponent extends ParentQuery implements OnInit {
  @ViewChild('mySpan') spanQuery: ElementRef<HTMLSpanElement>;

  ngOnInit() {
    this.spanQuery.nativeElement.addEventListener('click', () => {
      // noop
    });

    this.test();
  }

  test() {
    this.testParent.nativeElement.classList.add('testClass');
  }
}
