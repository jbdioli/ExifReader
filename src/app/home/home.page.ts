import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import * as ExifReader from 'exifreader'; // Test with exifReader plugin


export interface MetaData {
  name: string;
  size: number;
  type: string;
  date?: Date;
  imageHeight?: number;
  imageWidth?: number;
  gpsLatitude?: number;
  gpsLongitude?: number;
}

export interface ImageDetail {
  data: string;
  name?: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {

  @ViewChild('filePicker', { static: false }) filePickerRef: ElementRef<HTMLInputElement>;

  filesPickuped: Array<ImageDetail> = [];
  tags: Array<any> = [];
  metaData: Array<MetaData> = [];

  latFinal: number;

  constructor() {}

  ngOnInit() {}

  onPickImage() {
    this.filePickerRef.nativeElement.click();
  }

  onFileChosen(ev: Event) {
    const files: FileList = (ev.target as HTMLInputElement).files;
    console.log('file :', files[0]);


    let index: number;
    for (index = 0; index < files.length; index++) {

      /*
      * Convert the File to dataUrl to be display
      */
      this.convertToDataUrl(files[index], this.filesPickuped);
      let size: any = (files[index].size / 1048576);
      size = Number.parseFloat(size).toPrecision(3);
      const newIndex = this.metaData.push({name: files[index].name, size, type: files[index].type});
      console.log('new index :', newIndex);


      /*
       * using exifReader plugin
       * npm install exifreader --save
       */
      this.exifReader(files[index], (newIndex - 1));
    }
  }


  async exifReader(image: File, index: number) {
    const fileReader = new FileReader();
    let arrayBuffer: any;
    fileReader.onload = () => {
      arrayBuffer =  fileReader.result;
      this.tags[index] = ExifReader.load(arrayBuffer);

      console.log('tags : ', this.tags);

      this.metaData[index].imageHeight = this.tags[index]['Image Height'].description;
      this.metaData[index].imageWidth = this.tags[index]['Image Width'].description;
      if (this.tags[index].DateTimeOriginal) {
        this.metaData[index].date = this.tags[index].DateTimeOriginal.description;
      }
      if (this.tags[index].GPSLatitude) {
        this.metaData[index].gpsLatitude = this.tags[index].GPSLatitude.description;
      }
      if (this.tags[index].GPSLongitude) {
        this.metaData[index].gpsLongitude = this.tags[index].GPSLongitude.description;
      }

      console.log('metaData : ', this.metaData);

    };
    fileReader.readAsArrayBuffer(image);
  }


  convertDMSToDD(degrees: number, minutes: number, seconds: number, direction: string) {
    console.log(degrees, minutes, seconds, direction);
    let dd = degrees + (minutes / 60) + (seconds / 3600);

    if (direction === 'S' || direction === 'W') {
      dd = dd * -1;
    }
    return dd;
  }


  // File to dataUrl
  convertToDataUrl(image: File, storage: Array<ImageDetail>) {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const dataUrl = fileReader.result.toString();
      storage.push({ data: dataUrl, name: image.name });
    };
    fileReader.readAsDataURL(image);
  }
}

