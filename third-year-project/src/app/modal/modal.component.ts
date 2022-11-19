import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: `./modal.component.html`,
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {

  @ViewChild('myModal', { static: false })
  modal!: ElementRef;
  word: string = '';

  open(word: string) {
    this.word = word;
    this.modal.nativeElement.style.display = 'block';
  }

  close() {
    this.modal.nativeElement.style.display = 'none';
  }
}
