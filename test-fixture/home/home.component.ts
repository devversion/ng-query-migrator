import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";

@Component({
  selector: 'app-home',
  template: '<span #mySpan>Home</span>'
})
export class HomeComponent implements OnInit {
  @ViewChild('mySpan') spanQuery: ElementRef<HTMLSpanElement>;

  ngOnInit() {
    this.spanQuery.nativeElement.addEventListener('click', () => {
      // noop
    });
  }
}
