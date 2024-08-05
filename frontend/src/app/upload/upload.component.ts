import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  selectedFile: File = null;
  extractedFields: any;

  constructor(private http: HttpClient) {}

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('document', this.selectedFile);

    this.http.post('http://localhost:3000/upload', formData).subscribe(
      (response: any) => {
        this.extractedFields = response.extractedFields;
      },
      (error) => {
        console.error('Error uploading file', error);
      }
    );
  }
}
