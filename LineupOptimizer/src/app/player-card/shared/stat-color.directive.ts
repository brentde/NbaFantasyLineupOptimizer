import { Directive, Input, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appStatColor]'
})
export class StatColorDirective implements OnInit {

  @Input() stat: number = 0.0;
  @Input() expStat: number = 0.0;

  constructor(private el: ElementRef) {}

  ngOnInit(){
    this.colorEl();
  }

  private colorEl(): void {
    if(this.expStat >= this.stat){
      this.el.nativeElement.innerText = ` (+${(this.expStat-this.stat).toFixed(2)})`;    
      this.el.nativeElement.style.color = "#008000";
    } else {
      this.el.nativeElement.innerText = ` (${(this.expStat-this.stat).toFixed(2)})`;
      this.el.nativeElement.style.color = "#ff0000";
    }
  }
}
