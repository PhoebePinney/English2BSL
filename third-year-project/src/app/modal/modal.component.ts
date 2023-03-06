import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: `./modal.component.html`,
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {

  @ViewChild('myModal', { static: false })
  modal!: ElementRef;
  word: string = '';
  videoLink: string = '';

  open(videoLink: string, word: string) {
    this.word = word;
    this.videoLink = videoLink;
    this.modal.nativeElement.style.display = 'block';
  }

  close() {
    this.modal.nativeElement.style.display = 'none';
  }
}
